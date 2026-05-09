const WebSocket = require("ws");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 4800;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error MongoDB:", err.message));

const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  isOnline: Boolean,
  lastConnectedAt: Date
}), "users");

const Message = mongoose.model("Message", new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
}), "messages");

const wss = new WebSocket.Server({ port: PORT });
const clients = new Set();

const send = (ws, data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

const broadcast = (data) => {
  clients.forEach(client => send(client.ws, data));
};

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const username = url.searchParams.get("username") || "Invitado";

  const client = { ws, username };
  clients.add(client);

  await User.updateOne(
    { username },
    {
      username,
      isOnline: true,
      lastConnectedAt: new Date()
    },
    { upsert: true }
  );

  send(ws, { type: "welcome", username });

  const history = await Message.find().sort({ timestamp: 1 }).limit(100);
  send(ws, { type: "chat_history", messages: history });

  broadcast({
    type: "join",
    message: `${username} se unió al chat`
  });

  ws.on("message", async (data) => {
    try {
      const { message } = JSON.parse(data);
      if (!message || !message.trim()) return;

      const saved = await Message.create({
        user: username,
        message: message.trim()
      });

      broadcast({
        type: "message",
        user: saved.user,
        message: saved.message,
        timestamp: saved.timestamp
      });

      console.log("Mensaje guardado:", saved.message);
    } catch (err) {
      console.error("Error mensaje:", err.message);
    }
  });

  ws.on("close", async () => {
    clients.delete(client);

    await User.updateOne(
      { username },
      { isOnline: false }
    );

    broadcast({
      type: "leave",
      message: `${username} se desconectó`
    });
  });
});

console.log(`Servidor WebSocket corriendo en ws://localhost:${PORT}`);