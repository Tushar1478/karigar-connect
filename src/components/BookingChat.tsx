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

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col bg-transparent">
      {/* MESSAGE LIST */}
      <ScrollArea className="h-[260px] px-4 py-3">
        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="text-2xl">💬</div>
              <p className="text-xs font-light text-muted-foreground">
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
                className={`flex items-end gap-2 animate-fade-in ${isMe ? 'flex-row-reverse' : 'flex-row'} ${prevSame ? 'mt-0.5' : 'mt-2'}`}
              >
                {!prevSame ? (
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[0.55rem] font-bold ${
                    isMe ? 'border-primary/40 bg-primary-soft text-primary' : 'border-border bg-muted text-foreground'
                  }`}>
                    {initials(m.sender_name)}
                  </div>
                ) : (
                  <div className="w-7 flex-shrink-0" />
                )}

                <div className={`flex max-w-[72%] flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  {!prevSame && (
                    <span className={`text-[0.62rem] font-semibold ${isMe ? 'pr-1 text-primary/70' : 'pl-1 text-muted-foreground'}`}>
                      {isMe ? 'You' : m.sender_name}
                    </span>
                  )}

                  <div className={`rounded-2xl px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>

                  <span className={`text-[0.6rem] font-light text-muted-foreground/60 ${isMe ? 'pr-1' : 'pl-1'}`}>
                    {time}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* INPUT ROW */}
      <div className="flex gap-2 border-t border-border bg-secondary/40 px-3.5 py-2.5">
        <input
          placeholder="Type a message..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="uc-input h-[38px] flex-1"
        />

        <button
          onClick={handleSend}
          disabled={sending || !newMsg.trim()}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {sending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
};

export default BookingChat;
