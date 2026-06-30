import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2, Mic, Volume2 } from 'lucide-react';
import { sendMessage } from './api/inference';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import Orb from './Orb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError("Accès au microphone refusé. Veuillez l'autoriser dans votre navigateur.");
        } else {
          setError(`Erreur de reconnaissance vocale : ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        setError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
        return;
      }
      try {
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: unknown) {
        console.error(e);
        setIsListening(false);
        setError("Impossible de démarrer le microphone. Vérifiez vos permissions.");
      }
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

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

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
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
    <div className="relative flex flex-col h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Orb isThinking={isLoading} />
          </Float>
          <Environment preset="city">
            <Lightformer form="rect" intensity={1} position={[10, 5, 10]} scale={[10, 50, 1]} target={[0, 0, 0]} />
          </Environment>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      {/* Glassmorphism Chat Container */}
      <div className="relative z-20 flex flex-col h-full w-full max-w-5xl mx-auto bg-black/20 border-x border-white/5 shadow-2xl">
        
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden">
              <Bot size={24} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-wide">
                TechCorp AI
              </h1>
              <p className="text-xs text-blue-400 font-medium tracking-wider uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Système en ligne
              </p>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                <Bot size={40} className="text-blue-400 opacity-80" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Comment puis-je vous aider ?</h2>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                Interagissez avec votre modèle Ollama local. Posez vos questions d'ordre financier ou stratégique.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.02, rotate: msg.role === 'user' ? -1 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  drag
                  dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  dragElastic={0.15}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className={`flex w-full cursor-grab active:cursor-grabbing ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ zIndex: 10 }}
                >
                  <div
                    className={`flex max-w-[85%] sm:max-w-[75%] gap-4 p-5 shadow-xl group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl rounded-tr-sm'
                        : 'bg-white/5 backdrop-blur-md text-gray-200 rounded-3xl rounded-tl-sm border border-white/10 relative'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                          <Bot size={16} className="text-blue-400" />
                        </div>
                        {/* Bouton de lecture audio */}
                        <button 
                          onClick={() => speakMessage(msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                          title="Écouter le message"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-light">
                      {msg.content}
                    </div>

                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                          <User size={16} className="text-blue-100" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex w-full justify-start"
            >
              <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-md rounded-3xl rounded-tl-sm border border-white/10 shadow-xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Bot size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="flex gap-2 items-center h-6">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex w-full justify-center my-4"
              >
                <div className="flex items-center gap-3 px-5 py-4 bg-red-500/10 backdrop-blur-md text-red-400 rounded-2xl border border-red-500/30 max-w-lg shadow-lg shadow-red-500/5">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border-t border-white/10 shrink-0">
          <div className={`max-w-4xl mx-auto relative flex items-end gap-3 bg-white/5 backdrop-blur-md rounded-3xl p-2 border transition-all duration-300 shadow-inner ${isListening ? 'border-purple-500 shadow-purple-500/20' : 'border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/10'}`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Écoute en cours..." : "Initier une analyse..."}
              className="flex-1 max-h-48 min-h-[52px] bg-transparent resize-none p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 leading-tight rounded-2xl scrollbar-thin scrollbar-thumb-white/20"
              rows={1}
              disabled={isLoading}
            />
            
            {/* Bouton micro */}
            <motion.button
              onClick={toggleListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 mb-1 rounded-2xl transition-all duration-300 flex-shrink-0 flex items-center justify-center ${
                isListening 
                  ? 'bg-purple-600 text-white animate-pulse shadow-lg shadow-purple-500/50' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
              title="Dicter un message"
            >
              <Mic size={22} className={isListening ? "animate-bounce" : ""} />
            </motion.button>

            {/* Bouton envoyer */}
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="p-4 mb-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:hover:shadow-none transition-shadow duration-300 flex-shrink-0 flex items-center justify-center group"
              title="Envoyer"
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
            </motion.button>
          </div>
          <div className="text-center mt-3 text-xs font-medium text-gray-500 tracking-wide uppercase">
            TechCorp AI · Accès Sécurisé
          </div>
        </footer>
      </div>
    </div>
  );
}
