import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const avatarClass = (name = "") => {
  const classes = ["av-purple", "av-blue", "av-indigo", "av-muted"];
  const idx = name ? name.charCodeAt(0) % classes.length : 0;
  return classes[idx];
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const guestName = () => `Invitado_${Math.floor(Math.random() * 9000) + 1000}`;

// ──────────────────────────────────────────────────────────────────────────────
// Icons
// ──────────────────────────────────────────────────────────────────────────────

const SkijanLogo = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="#4F4698" />
    <path d="M16 26 Q26 14 36 26 Q26 38 16 26Z" fill="#CFFBF6" opacity="0.9" />
    <circle cx="26" cy="26" r="4" fill="#3B82C4" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MessagesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ──────────────────────────────────────────────────────────────────────────────
// App Component
// ──────────────────────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { id: "sys-1", user: "Sistema", text: "Bienvenido al chat colaborativo", type: "system" },
  ]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const usernameRef = useRef("");

  const connectWebSocket = (name) => {
    // Si estás en desarrollo local, puedes usar ws://localhost:4800
    // Para producción en Render: wss://los-sockets.onrender.com
    const isLocal = window.location.hostname === "localhost";
    const socketUrl = isLocal ? "ws://localhost:4800" : "wss://los-sockets.onrender.com";
    
    console.log(`Conectando a: ${socketUrl}`);
    const socket = new WebSocket(`${socketUrl}?username=${encodeURIComponent(name)}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log("WebSocket conectado");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Evento recibido:", data);

      if (data.type === "welcome") {
        setUsername(data.username);
        usernameRef.current = data.username;
      }

      if (data.type === "chat_history") {
        const history = data.messages.map((msg) => ({
          id: msg._id,
          user: msg.user,
          text: msg.message,
          timestamp: msg.timestamp,
          type: msg.user === usernameRef.current ? "me" : "other",
        }));
        setMessages([
          { id: "sys-1", user: "Sistema", text: "Bienvenido al chat colaborativo", type: "system" },
          ...history,
        ]);
      }

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: data.user,
            text: data.message,
            timestamp: data.timestamp,
            type: data.user === usernameRef.current ? "me" : "other",
          },
        ]);
      }

      if (data.type === "join" || data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), user: "Sistema", text: data.message, type: "system" },
        ]);
      }

      if (data.type === "user_list") {
        setOnlineUsers(data.users);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log("WebSocket desconectado");
    };

    socket.onerror = (err) => console.error("Error en WebSocket:", err);
  };

  useEffect(() => {
    if (user) connectWebSocket(user.name);
    return () => socketRef.current?.close();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
  };

  const handleGuestLogin = () => {
    const name = guestName();
    setUser({ name, email: null, picture: null });
  };

  const handleLogout = () => {
    socketRef.current?.close();
    setUser(null);
    setConnected(false);
    setOnlineUsers([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({ message: inputValue.trim() }));
    setInputValue("");
  };

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-wrapper">
          <div className="login-logo"><SkijanLogo /></div>
          <h1 className="login-brand">Skijan</h1>
          <p className="login-tagline">Chat colaborativo en tiempo real</p>
          
          <div className="login-card">
            <p className="login-card-title">Bienvenido/a</p>
            <p className="login-card-sub">Elige cómo deseas ingresar</p>
            
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Login Fallido")}
              useOneTap
            />

            <div className="login-divider"><span>o</span></div>

            <button className="btn-guest" onClick={handleGuestLogin}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <span>Continuar como invitado</span>
            </button>

            <p className="login-note">Se asignará automáticamente un nombre de usuario temporal</p>
          </div>
          <p className="login-footer">Skijan · Chat Colaborativo v1.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Overlay para móvil */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <SkijanLogo size={28} />
            <span className="sidebar-brand-name">Skijan</span>
          </div>
          <button className="menu-toggle" onClick={() => setSidebarOpen(false)}>
            <span style={{ fontSize: '20px' }}>✕</span>
          </button>
        </div>

        <div className="sidebar-users">
          <p className="sidebar-users-label">Conectados — {onlineUsers.length}</p>
          {onlineUsers.map((u) => (
            <div key={u} className={`user-item ${u === username ? "is-me" : ""}`}>
              <div className="avatar-wrap">
                <div className={`avatar ${avatarClass(u)}`}>{initials(u)}</div>
                <div className="online-dot" />
              </div>
              <span className="user-name">{u === username ? `Tú (${u})` : u}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="current-user-card">
            <div className="avatar-wrap">
              <div className="avatar av-teal">{initials(user.name)}</div>
            </div>
            <div className="current-user-info">
              <p>{user.name}</p>
              <p>{connected ? "En línea" : "Desconectado"}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIcon />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="chat-area">
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <MessagesIcon />
          <span className="chat-header-title">Chat General</span>
          <div className="chat-header-status">
            <div className="chat-header-status-dot" />
            <span>{onlineUsers.length} conectados</span>
          </div>
        </header>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="msg-system">
                  <span>{msg.text}</span>
                </div>
              );
            }

            if (msg.type === "me") {
              return (
                <div key={msg.id} className="msg-me">
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                  </div>
                  <span className="msg-time">{formatTime(msg.timestamp || Date.now())}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className="msg-other">
                <p className="msg-sender">{msg.user}</p>
                <div className="msg-other-inner">
                  <div className="avatar-wrap">
                    <div className={`avatar ${avatarClass(msg.user)}`} style={{ width: 28, height: 28 }}>
                      {initials(msg.user)}
                    </div>
                  </div>
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                  </div>
                </div>
                <span className="msg-time">{formatTime(msg.timestamp || Date.now())}</span>
              </div>
            );
          })}
        </div>

        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            className="chat-input"
            type="text"
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn-send">
            <SendIcon />
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
