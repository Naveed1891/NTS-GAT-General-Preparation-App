import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { chatWithTutor } from '../services/gemini';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '../components/ui/card';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AITutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your AI Tutor for the NTS GAT General Test. How can I help you today? You can ask me to explain concepts, solve problems step-by-step, or give you shortcuts.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const responseText = await chatWithTutor(history, userMsg.text);
      
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: "I'm sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Tutor</h1>
        <p className="text-slate-500 mt-2 mb-6">Ask questions, get step-by-step solutions, and learn shortcuts.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[80%] space-x-3",
                msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
              )}>
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="markdown-body prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex max-w-[80%] space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-slate-500 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center space-x-2 max-w-4xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question..."
              className="flex-1 resize-none overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px] max-h-32 pr-12"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">
            AI Tutor can make mistakes. Verify important information.
          </p>
        </div>
      </Card>
    </div>
  );
}
