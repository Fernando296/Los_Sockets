# 🚀 SocketsChat - Chat Colaborativo

### Universidad Mayor de San Simón (UMSS)

**Grupo 2 - Los Sockets**

SocketsChat es una aplicación de chat en tiempo real diseñada para ser instalada y ejecutada en menos de 5 minutos.

---

## ⚡ Opción Rápida (Sin Instalación)

**¡Prueba la app en línea primero!** 🌐

- Accede directamente a: https://los-sockets-cf2t.vercel.app/
- Si el link no funciona, instala el proyecto localmente (ver abajo).

---

## 🛠️ Guía de Instalación Rápida (Copia y Pega)

Sigue estos 3 pasos en tu terminal (PowerShell o CMD):

### 1. Clonar el proyecto

```bash
git clone https://github.com/Fernando296/Los_Sockets.git
cd Los_Sockets
```

### 2. Configuración Automática (Base de Datos + Dependencias)

Copia y pega este comando completo para configurar la base de datos de prueba y preparar el sistema:

**Si usas Windows (PowerShell):**

```powershell
echo "MONGO_URL=mongodb+srv://db_umss:UQzfSe6BGNlCbBVI@umss.aqnxfff.mongodb.net/sockets_chat?appName=umss" > server/.env; npm run setup
```

**Si usas Linux/macOS:**

```bash
echo "MONGO_URL=mongodb+srv://db_umss:UQzfSe6BGNlCbBVI@umss.aqnxfff.mongodb.net/sockets_chat?appName=umss" > server/.env && npm run setup
```

### 3. Ejecutar el Proyecto

Una vez termine la instalación, lanza el chat con:

```bash
npm run dev
```

---

## 💡 Cómo probarlo

1. Abre tu navegador en la dirección que te muestre la terminal (normalmente `http://localhost:5173`).
2. Inicia sesión con Google o como **Invitado**.
3. Abre la misma URL en otra pestaña para chatear contigo mismo o invita a un amigo.

## 📂 Estructura

- `server/`: El cerebro del chat (Node.js + WebSockets).
- `cliente/client/`: La interfaz visual (React + Vite).
- `package.json`: El control maestro para ejecutar todo a la vez.

---

**SocketsChat** · UMSS 2026 · v1.0
