import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

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

const wss = new WebSocketServer({ port: PORT });
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

  // Verify that the username is unique, if not add a number at the end
  let finalUsername = username;
  let counter = 1;
  const existingNames = Array.from(clients).map(c => c.username);

  while (existingNames.includes(finalUsername)) {
    finalUsername = `${username}_${counter}`;
    counter++;
  }

  const client = { ws, username: finalUsername };
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

  send(ws, { type: "welcome", username: finalUsername });

  const history = await Message.find().sort({ timestamp: 1 }).limit(100);
  send(ws, { type: "chat_history", messages: history });

  broadcast({
    type: "join",
    message: `${finalUsername} se unió al chat`
  });

    // updated list of connected users
    const userList = Array.from(clients).map(c => c.username);
    broadcast({ type: "user_list", users: userList });

  ws.on("message", async (data) => {
    try {
      const { message } = JSON.parse(data);
      if (!message || !message.trim()) return;

      const saved = await Message.create({
        user: finalUsername,
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
      { username: finalUsername },
      { isOnline: false }
    );

    broadcast({
      type: "leave",
      message: `${finalUsername} se desconectó`
    });

    // updated list after disconnection
    const userList = Array.from(clients).map(c => c.username);
    broadcast({ type: "user_list", users: userList });
  });
});

console.log(`Servidor WebSocket corriendo en ws://localhost:${PORT}`);