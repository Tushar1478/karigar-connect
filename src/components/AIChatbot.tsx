import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    onError(errData.error || 'Something went wrong');
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json, skip */ }
    }
  }
  onDone();
}

const QUICK_PROMPTS = [
  '🔧 Find an electrician',
  '🚿 Plumbing help',
  '📋 How to book?',
  '💰 Pricing info',
];

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';
    const allMessages = [...messages, userMsg];

    await streamChat({
      messages: allMessages,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      },
      onDone: () => setLoading(false),
      onError: (msg) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
        setLoading(false);
      },
    });
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
            transition: 'transform .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 380, maxWidth: 'calc(100vw - 32px)',
          height: 520, maxHeight: 'calc(100vh - 48px)',
          borderRadius: 20, overflow: 'hidden',
          background: 'rgba(10,10,15,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Sora', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.06))',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>KarigarHub AI</p>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Your smart assistant</p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)',
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 4px' }}>
                  Namaste! I'm KarigarHub AI
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: '0 0 16px' }}>
                  Ask me anything about our services
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)}
                      style={{
                        padding: '6px 12px', borderRadius: 999,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem',
                        cursor: 'pointer', fontFamily: "'Sora',sans-serif",
                        transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)'; e.currentTarget.style.color = '#fb923c'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: 12,
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.4))'
                    : 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.4))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.role === 'user' ? <User size={12} color="#38bdf8" /> : <Bot size={12} color="#fb923c" />}
                </div>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.08))'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                  <p style={{
                    fontSize: '0.82rem', lineHeight: 1.55, margin: 0,
                    color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.4))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={12} color="#fb923c" />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '4px 14px 14px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <Loader2 size={14} color="rgba(255,255,255,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', display: 'flex', gap: 8,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask anything..."
              style={{
                flex: 1, height: 38,
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '0 12px',
                color: '#fff', fontSize: '0.82rem',
                fontFamily: "'Sora',sans-serif",
                outline: 'none', transition: 'border-color .2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                background: loading || !input.trim()
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #f97316, #fb923c)',
                color: loading || !input.trim() ? 'rgba(255,255,255,0.2)' : '#fff',
                transition: 'all .2s',
              }}
            >
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default AIChatbot;
