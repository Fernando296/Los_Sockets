import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Sistema', text: 'Bienvenido al chat colaborativo', type: 'system' },
    { id: 2, user: 'Usuario_1', text: '¡Hola a todos!', type: 'user' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: 'Tú',
      text: inputValue,
      type: 'me',
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      width: '90%',
      maxWidth: '800px',
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Los Sockets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chat en tiempo real</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Conectado</span>
        </div>
      </header>

      {/* Messages Area */}
      <main ref={scrollRef} style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--accent-primary) transparent'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.type === 'me' ? 'flex-end' : msg.type === 'system' ? 'center' : 'flex-start',
            maxWidth: '70%'
          }}>
            {msg.type !== 'system' && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '4px', 
                display: 'block',
                textAlign: msg.type === 'me' ? 'right' : 'left'
              }}>
                {msg.user}
              </span>
            )}
            <div className="glass-panel" style={{
              padding: '12px 16px',
              borderRadius: msg.type === 'me' ? '20px 20px 4px 20px' : msg.type === 'system' ? '12px' : '20px 20px 20px 4px',
              background: msg.type === 'me' ? 'var(--gradient-main)' : msg.type === 'system' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              fontSize: msg.type === 'system' ? '0.875rem' : '1rem',
              textAlign: msg.type === 'system' ? 'center' : 'left',
              color: msg.type === 'system' ? 'var(--text-secondary)' : 'white'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </main>

      {/* Input Area */}
      <footer style={{
        padding: '24px',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(15, 23, 42, 0.3)'
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
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
