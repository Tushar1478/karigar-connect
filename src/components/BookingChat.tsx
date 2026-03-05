import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
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

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground">Chat</h3>
      </div>
      <ScrollArea className="h-64 px-4 py-2">
        <div className="space-y-2">
          {messages.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
          )}
          {messages.map(m => {
            const isMe = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  <p className={`text-[10px] font-medium ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{m.sender_name}</p>
                  <p className="text-sm">{m.text}</p>
                  <p className={`mt-0.5 text-[9px] ${isMe ? 'text-primary-foreground/50' : 'text-muted-foreground/70'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="flex gap-2 border-t border-border p-3">
        <Input
          placeholder="Type a message..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !newMsg.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BookingChat;
