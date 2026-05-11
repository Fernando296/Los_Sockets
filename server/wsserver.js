// importaciones necesarias para el servidor WebSocket
import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const PORT = process.env.PORT || 4800; // definición del puerto para el servidor WebSocket

// conexión a la base de datos MongoDB utilizando Mongoose
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error MongoDB:", err.message));

// definicion de los usuario
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  isOnline: Boolean,
  lastConnectedAt: Date
}), "users");

// definicion de los mensajes
const Message = mongoose.model("Message", new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
}), "messages");

// inicialización del servidor WebSocket
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

const send = (ws, data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

// función para enviar un mensaje a todos los clientes conectados
const broadcast = (data) => {
  clients.forEach(client => send(client.ws, data));
};

// manejo de conexiones entrantes al servidor WebSocket
wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`); // dirección URL para obtener el nombre de usuario
  const username = url.searchParams.get("username") || "Invitado";

  const client = { ws, username };
  clients.add(client);

  // actualización o creación del usuario en la base de datos con su estado en línea
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

  // mensaje de notificación a todos los clientes sobre la nueva conexión
  broadcast({
    type: "join",
    message: `${finalUsername} se unió al chat`
  });

    // updated list of connected users
    const userList = Array.from(clients).map(c => c.username);
    broadcast({ type: "user_list", users: userList });

  // manejo de mensajes entrantes desde el cliente
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

  // manejo de desconexiones del cliente
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

// logs para indicar que el servidor WebSocket está corriendo
console.log(`Servidor WebSocket corriendo en ws://localhost:${PORT}`);