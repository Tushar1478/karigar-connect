import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Speech recognition language codes
const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', bn: 'bn-IN',
  or: 'or-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
  mr: 'mr-IN', gu: 'gu-IN',
};

async function streamChat({
  messages, onDelta, onDone, onError,
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
      } catch { /* partial json */ }
    }
  }
  onDone();
}

const AIChatbot = () => {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS for assistant messages
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang]);

  // Speech recognition
  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, lang]);

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
      onDone: () => {
        setLoading(false);
        if (assistantSoFar) speak(assistantSoFar);
      },
      onError: (msg) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
        setLoading(false);
      },
    });
  };

  const quickPrompts = [
    t('find_electrician'), t('plumbing_help'), t('how_to_book'), t('pricing_info'),
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[9999] flex h-[540px] max-h-[calc(100vh-48px)] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border bg-primary-soft px-4 py-3.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary">
              <Bot className="h-[18px] w-[18px] text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="m-0 text-sm font-bold text-foreground">KarigarHub AI</p>
              <p className="m-0 text-xs text-muted-foreground">
                {isListening ? '🎤 Listening...' : t('chatbot_subtitle')}
              </p>
            </div>
            {/* TTS toggle */}
            <button
              onClick={() => { setTtsEnabled(e => !e); window.speechSynthesis.cancel(); }}
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border transition-colors ${
                ttsEnabled ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'
              }`}
              title={ttsEnabled ? 'Disable voice' : 'Enable voice'}
            >
              <Volume2 className="h-[13px] w-[13px]" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3.5 pb-2 pt-3.5">
            {messages.length === 0 && (
              <div className="p-3 text-center">
                <div className="mb-2 text-3xl">🤖</div>
                <p className="m-0 mb-1 text-sm font-medium text-foreground">
                  {t('chatbot_greeting')}
                </p>
                <p className="m-0 mb-4 text-xs text-muted-foreground">
                  {t('chatbot_subtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {quickPrompts.map(p => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary"
                    >{p}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full ${
                  m.role === 'user' ? 'bg-muted' : 'bg-primary-soft'
                }`}>
                  {m.role === 'user' ? <User className="h-3 w-3 text-foreground" /> : <Bot className="h-3 w-3 text-primary" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
                {/* Speak button for assistant messages */}
                {m.role === 'assistant' && (
                  <button
                    onClick={() => speak(m.content)}
                    className="mt-1 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    title="Listen"
                  >
                    <Volume2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="rounded-2xl border border-border bg-muted px-3.5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border bg-secondary/40 px-3 py-2.5">
            {/* Mic button */}
            <button
              onClick={toggleListening}
              className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                isListening ? 'animate-pulse bg-destructive text-destructive-foreground' : 'bg-background text-muted-foreground border border-border'
              }`}
              title={isListening ? t('stop_recording') : t('voice_input')}
            >
              {isListening ? <MicOff className="h-[15px] w-[15px]" /> : <Mic className="h-[15px] w-[15px]" />}
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder={t('ask_anything')}
              className="uc-input h-[38px] flex-1"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {loading ? <Loader2 className="h-[15px] w-[15px] animate-spin" /> : <Send className="h-[15px] w-[15px]" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
