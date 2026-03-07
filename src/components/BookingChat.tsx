import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

const BookingChat = ({ bookingId }: { bookingId: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg]     = useState('');
  const [sending, setSending]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = user?.authUser?.id;

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
      setMessages((data as Message[]) || []);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !userId || !user?.profile) return;
    setSending(true);
    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: userId,
      sender_name: user.profile.name,
      text: newMsg.trim(),
    } as any);
    setNewMsg('');
    setSending(false);
  };

  /* ── initials helper ── */
  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Sora', sans-serif",
      background: 'transparent',
    }}>

      {/* ── MESSAGE LIST ── */}
      <ScrollArea style={{ height: 260, padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {messages.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '48px 0', gap: 8,
            }}>
              <div style={{ fontSize: '1.6rem' }}>💬</div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                No messages yet. Start the conversation!
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const isMe = m.sender_id === userId;
            const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const prevSame = i > 0 && messages[i - 1].sender_id === m.sender_id;

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                  animation: 'msgPop .25s cubic-bezier(.22,1,.36,1) both',
                  marginTop: prevSame ? 2 : 8,
                }}
              >
                {/* Avatar — only show on first of a group */}
                {!prevSame ? (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: isMe
                      ? 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))'
                      : 'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(56,189,248,0.4))',
                    border: `1.5px solid ${isMe ? 'rgba(251,146,60,0.4)' : 'rgba(56,189,248,0.35)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 700,
                    color: isMe ? '#fb923c' : '#38bdf8',
                    fontFamily: "'Space Mono',monospace",
                    flexDirection: 'column',
                  }}>
                    {initials(m.sender_name)}
                  </div>
                ) : (
                  <div style={{ width: 28, flexShrink: 0 }} />
                )}

                {/* Bubble */}
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isMe ? 'flex-end' : 'flex-start' }}>

                  {/* Sender name — only on first of group */}
                  {!prevSame && (
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600,
                      color: isMe ? 'rgba(251,146,60,0.7)' : 'rgba(56,189,248,0.7)',
                      paddingLeft: isMe ? 0 : 4,
                      paddingRight: isMe ? 4 : 0,
                    }}>
                      {isMe ? 'You' : m.sender_name}
                    </span>
                  )}

                  <div style={{
                    padding: '8px 12px',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isMe
                      ? 'linear-gradient(135deg,rgba(249,115,22,0.25),rgba(251,146,60,0.18))'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isMe ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    backdropFilter: 'blur(8px)',
                    boxShadow: isMe
                      ? '0 4px 16px rgba(249,115,22,0.1)'
                      : '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'box-shadow .2s',
                  }}>
                    <p style={{
                      fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400,
                      color: isMe ? '#fff' : 'rgba(255,255,255,0.85)',
                      margin: 0,
                    }}>
                      {m.text}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 300,
                    color: 'rgba(255,255,255,0.22)',
                    paddingLeft: isMe ? 0 : 4,
                    paddingRight: isMe ? 4 : 0,
                    fontFamily: "'Space Mono',monospace",
                  }}>
                    {time}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── INPUT ROW ── */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px',
        borderTop: '1px solid rgba(56,189,248,0.1)',
        background: 'rgba(56,189,248,0.03)',
      }}>
        <input
          placeholder="Type a message..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, height: 38,
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${focused ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10, padding: '0 12px',
            color: '#fff', fontSize: '0.875rem',
            fontFamily: "'Sora',sans-serif",
            outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: focused ? '0 0 0 3px rgba(56,189,248,0.08)' : 'none',
          }}
        />

        <button
          onClick={handleSend}
          disabled={sending || !newMsg.trim()}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: sending || !newMsg.trim() ? 'not-allowed' : 'pointer',
            background: sending || !newMsg.trim()
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg,#f97316,#fb923c)',
            color: sending || !newMsg.trim() ? 'rgba(255,255,255,0.2)' : '#fff',
            transition: 'all .2s',
            boxShadow: !sending && newMsg.trim() ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
          }}
          onMouseEnter={e => { if (!sending && newMsg.trim()) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          {sending
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={15} />
          }
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes msgPop { from { opacity:0; transform:scale(.94) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BookingChat;
