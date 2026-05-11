// importaciones necesarias para React, Google Login y decodificación de JWT
import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function App() {
  // Estado para almacenar la información del usuario autenticado y los mensajes del chat
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Sistema",
      text: "Bienvenido al chat colaborativo",
      type: "system",
    },
  ]);

  // Estados para manejar el valor del input, la conexión al WebSocket y el nombre de usuario
  const [inputValue, setInputValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const usernameRef = useRef("");

  // Función para establecer la conexión WebSocket con el servidor y manejar los eventos de conexión, mensajes entrantes y desconexión
  const connectWebSocket = (name) => {
    // Usamos directamente tu URL de Render (con wss://)
    const socketUrl = "wss://los-sockets.onrender.com";
    //const socketUrl = import.meta.env.VITE_SOCKET_URL || "ws://localhost:4800";
    const socket = new WebSocket(`${socketUrl}?username=${name}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log("Conectado al WebSocket");
    };

    // Manejo de mensajes entrantes del servidor WebSocket
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Mensaje recibido:", data);

      // Manejo de diferentes tipos de mensajes recibidos del servidor
      if (data.type === "welcome") {
        setUsername(data.username);
        usernameRef.current = data.username;
      }

      // Si el mensaje es del tipo "chat_history", actualizamos el estado de mensajes con el historial recibido del servidor
      if (data.type === "chat_history") {
        const history = data.messages.map((msg) => ({
          id: msg._id,
          user: msg.user,
          text: msg.message,
          type: msg.user === usernameRef.current ? "me" : "user",
        }));

        setMessages([
          {
            id: 1,
            user: "Sistema",
            text: "Bienvenido al chat colaborativo",
            type: "system",
          },
          ...history,
        ]);
      }

      // Si el mensaje es del tipo "message", agregamos el nuevo mensaje al estado de mensajes para mostrarlo en la interfaz
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: data.user,
            text: data.message,
            type: data.user === usernameRef.current ? "me" : "user",
          },
        ]);
      }

      // Si el mensaje es del tipo "join" o "leave", agregamos un mensaje de sistema al estado de mensajes para notificar a los usuarios sobre la conexión o desconexión de otros usuarios
      if (data.type === "join" || data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: "Sistema",
            text: data.message,
            type: "system",
          },
        ]);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log("WebSocket cerrado");
    };

    socket.onerror = (error) => {
      console.error("Error WebSocket:", error);
    };
  };

  // Efecto para establecer la conexión WebSocket cuando el usuario se autentica y limpiar la conexión al desmontar el componente
  useEffect(() => {
    if (user) {
      connectWebSocket(user.name);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  // Efecto para hacer scroll automático hacia el último mensaje cada vez que se actualiza el estado de mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // manejo de credenciales de inicio con Google
  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Login exitoso:", decoded);
    setUser(decoded);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        message: inputValue.trim(),
      })
    );

    setInputValue("");
  };

  // Si el usuario no está autenticado, mostramos la pantalla de inicio de sesión con Google
  if (!user) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: "40px", textAlign: "center" }}>
        <h1 style={{ marginBottom: "20px", background: "var(--gradient-main)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2rem" }}>
          Los Sockets
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
          Inicia sesión con tu cuenta de Google para entrar al chat.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Fallido")}
            useOneTap
          />
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, mostramos la interfaz principal del chat con el historial de mensajes y el formulario para enviar nuevos mensajes
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        width: "90%",
        maxWidth: "800px",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "24px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user.picture && (
            <img
              src={user.picture}
              alt="avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--accent-primary)" }}
            />
          )}
          <div>
            <h1
              style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                background: "var(--gradient-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Los Sockets
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
              }}
            >
              {user.name} ({user.email})
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: connected ? "#10b981" : "#ef4444",
              boxShadow: connected ? "0 0 10px #10b981" : "0 0 10px #ef4444",
            }}
          ></div>
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {connected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </header>

      <main
        ref={scrollRef}
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--accent-primary) transparent",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf:
                msg.type === "me"
                  ? "flex-end"
                  : msg.type === "system"
                    ? "center"
                    : "flex-start",
              maxWidth: "70%",
            }}
          >
            {msg.type !== "system" && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: "4px",
                  display: "block",
                  textAlign: msg.type === "me" ? "right" : "left",
                }}
              >
                {msg.user}
              </span>
            )}

            <div
              className="glass-panel"
              style={{
                padding: "12px 16px",
                borderRadius:
                  msg.type === "me"
                    ? "20px 20px 4px 20px"
                    : msg.type === "system"
                      ? "12px"
                      : "20px 20px 20px 4px",
                background:
                  msg.type === "me"
                    ? "var(--gradient-main)"
                    : msg.type === "system"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.1)",
                fontSize: msg.type === "system" ? "0.875rem" : "1rem",
                textAlign: msg.type === "system" ? "center" : "left",
                color: msg.type === "system" ? "var(--text-secondary)" : "white",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </main>

      <footer
        style={{
          padding: "24px",
          borderTop: "1px solid var(--glass-border)",
          background: "rgba(15, 23, 42, 0.3)",
        }}
      >
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="input-field"
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ flex: 1 }}
          />

          <button type="submit" className="button-primary">
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
