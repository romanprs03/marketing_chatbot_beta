'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Íconos simples en SVG ───────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <line x1="12" y1="7" x2="12" y2="11"/>
      <line x1="8" y1="16" x2="8" y2="16"/>
      <line x1="16" y1="16" x2="16" y2="16"/>
    </svg>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'white', flexShrink: 0
      }}>
        <BotIcon />
      </div>
      <div style={{
        background: 'var(--bot-bubble)',
        border: '1px solid var(--border)',
        borderRadius: '4px 16px 16px 16px',
        padding: '12px 16px',
        display: 'flex', gap: 5, alignItems: 'center'
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            animation: `bounce 1.2s ease-in-out ${delay}s infinite`,
            display: 'inline-block'
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const time = new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 10,
      marginBottom: 8
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', flexShrink: 0
        }}>
          <BotIcon />
        </div>
      )}
      <div style={{ maxWidth: '72%' }}>
        <div style={{
          background: isUser ? 'var(--user-bubble)' : 'var(--bot-bubble)',
          color: isUser ? 'var(--user-text)' : 'var(--bot-text)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '11px 16px',
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {msg.content}
        </div>
        <p style={{
          fontSize: 11,
          color: 'var(--text-faint)',
          textAlign: isUser ? 'right' : 'left',
          marginTop: 4
        }}>
          {time}
        </p>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu agente de marketing. Puedo ayudarte a crear campañas, analizar tu audiencia o redactar contenido. ¿Por dónde empezamos?',
      createdAt: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg = { role: 'user', content: text, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // ─── Llamada al webhook de n8n ───────────────────────────────────────────
      // Reemplazá esta URL con tu webhook de n8n
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,           // Para mantener contexto por conversación
          message: text,       // El mensaje del usuario
          history: messages    // Historial para que n8n tenga contexto
        })
      })

      if (!res.ok) throw new Error('Error del webhook')

      // n8n devuelve la respuesta en un campo "output" o "text", ajustá según tu workflow
      const data = await res.json()
      const reply = data.output || data.text || data.message || 'Sin respuesta del agente.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString()
      }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al conectar con el agente. Intentá de nuevo.',
        createdAt: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      maxWidth: 780,
      margin: '0 auto',
    }}>

      {/* ── Header ── */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--surface)',
        flexShrink: 0
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          <BotIcon />
        </div>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Agente de Marketing
          </h1>
          <p style={{ fontSize: 12, color: '#639922', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#639922', display: 'inline-block' }}/>
            En línea
          </p>
        </div>
      </header>

      {/* ── Mensajes ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 24px 8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </main>

      {/* ── Input ── */}
      <footer style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '8px 8px 8px 18px',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu mensaje... (Enter para enviar)"
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.5,
              paddingTop: 4,
              fontFamily: 'inherit',
              maxHeight: 120,
              overflowY: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--surface)',
              color: input.trim() && !isLoading ? 'white' : 'var(--text-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              border: '1px solid var(--border)'
            }}
          >
            <SendIcon />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginTop: 10 }}>
          Shift+Enter para nueva línea · Enter para enviar
        </p>
      </footer>
    </div>
  )
}
