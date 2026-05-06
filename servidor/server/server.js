const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });

let clients = [];
let userCount = 0;

wss.on('connection', (ws) => {
    userCount++;
    const username = `Usuario_${userCount}`;

    const client = { ws, username };
    clients.push(client);

    console.log(`${username} conectado`);

    // Notificar a todos que alguien se unió
    broadcast({
        type: "join",
        message: `${username} se unió al chat`
    });

    ws.on('message', (data) => {
        try {
            const parsed = JSON.parse(data);

            broadcast({
                type: "message",
                user: username,
                message: parsed.message,
                timestamp: new Date()
            });

        } catch (error) {
            console.error("Error al procesar mensaje:", error);
        }
    });

    ws.on('close', () => {
        clients = clients.filter(c => c.ws !== ws);

        console.log(`${username} desconectado`);

        broadcast({
            type: "leave",
            message: `${username} se desconectó`
        });
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);

    clients.forEach(client => {
        client.ws.send(message);
    });
}

console.log("🔥 Servidor WebSocket corriendo en ws://localhost:4000");