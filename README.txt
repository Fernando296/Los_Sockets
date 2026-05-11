# Chat Colaborativo en Tiempo Real

Proyecto de chat colaborativo en tiempo real utilizando WebSockets para permitir la comunicación bidireccional entre múltiples usuarios de forma instantánea.

## Tecnologías Utilizadas

- Frontend: React (SPA)
- Backend: Node.js con la librería `ws`
- Comunicación: Protocolo WebSocket
- Control de versiones: Git y GitHub

---

## Estructura del Proyecto

```text
chat-colaborativo/
├── cliente/
│   └── client/          # Aplicación React
├── servidor/
│   └── server/          # Servidor WebSocket
├── test.html            # Cliente HTML para pruebas iniciales
└── README.md

Instalacion del servidor una vez descargado del repositorio, para el Backend

cd servidor/server
npm install
node server.js

para el Frontend

cd cliente/client
npm install
npm start