# Chat Colaborativo en Tiempo Real

Proyecto de chat utilizando WebSockets para permitir la comunicación bidireccional entre múltiples usuarios de forma instantánea.

## Tecnologías Utilizadas

- Frontend: React (SPA) con Vite.
- Backend: Node.js con la librería ws.
- Comunicación: Protocolo WebSocket.

## Estructura del Proyecto

- cliente/client: Contiene el código fuente de la aplicación React y su configuración.
- servidor/server: Contiene la lógica del servidor WebSocket.
- test.html: Cliente básico en HTML puro para pruebas de conectividad inicial.

## Instrucciones de Ejecución

Para ejecutar el proyecto correctamente, siga estos pasos en el orden indicado:

### 1. Iniciar el Servidor (Backend)

Abra una terminal en la raíz del proyecto y ejecute:

cd servidor/server
npm install
node server.js

El servidor se iniciará en el puerto 4000.

### 2. Iniciar el Cliente (Frontend)

Abra una nueva terminal (manteniendo la del servidor abierta) y ejecute:

cd cliente/client
npm install
npm run dev

Vite le proporcionará una URL local (normalmente http://localhost:5173).

### 3. Prueba de Funcionamiento

- Abra la URL del cliente en su navegador.
- Puede abrir la misma URL en varias pestañas o diferentes navegadores para simular múltiples usuarios.
- Verá notificaciones automáticas cuando alguien se conecte o desconecte.
- Los mensajes enviados se distribuirán a todos los participantes en tiempo real.

## Características Implementadas

- Manejo de múltiples conexiones simultáneas.
- Historial de mensajes visible.
- Asignación automática de nombres de usuario (Usuario_1, Usuario_2, etc.).
- Notificaciones de sistema para conexiones y desconexiones.
- Identificación de mensajes propios en la interfaz de React.
