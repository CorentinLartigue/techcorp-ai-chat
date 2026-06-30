import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { sendMessage } from './api/inference';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Ajuster la hauteur du textarea après l'envoi
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Préparer l'historique pour l'API (sans les IDs)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessage(apiMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Impossible de joindre le serveur d'inférence.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Bot size={20} className="text-blue-400" />
          </div>
          <h1 className="text-lg font-medium tracking-wide">TechCorp AI</h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
            <Bot size={48} className="text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Bienvenue sur l'assistant TechCorp</h2>
            <p className="text-gray-400 max-w-md">
              Posez vos questions d'ordre financier. Je suis propulsé par Phi-3.5-Financial.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-[75%] gap-4 p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700/50'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <Bot size={20} className="text-blue-400" />
                  </div>
                )}
                
                <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    <User size={20} className="text-blue-200" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-2xl rounded-bl-sm border border-gray-700/50">
              <div className="flex-shrink-0">
                <Bot size={20} className="text-blue-400" />
              </div>
              <div className="flex gap-1 items-center h-6">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex w-full justify-center my-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 text-red-400 rounded-lg border border-red-900/50 max-w-lg text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-gray-900 border-t border-gray-800 w-full">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-800/80 rounded-2xl p-2 border border-gray-700 focus-within:border-blue-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Envoyez un message..."
            className="flex-1 max-h-48 min-h-[44px] bg-transparent resize-none p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 leading-tight rounded-xl scrollbar-thin scrollbar-thumb-gray-600"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 mb-1 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex-shrink-0 flex items-center justify-center"
            title="Envoyer"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500">
          Entrée pour envoyer, Maj+Entrée pour un saut de ligne.
        </div>
      </footer>
    </div>
  );
}
