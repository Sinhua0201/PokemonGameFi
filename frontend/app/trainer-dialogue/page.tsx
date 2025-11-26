'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function TrainerDialoguePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello there! Welcome to the world of Pokémon! I'm Professor Oak. I'm here to help you become a great Pokémon Trainer! Ask me anything about Pokémon, battles, types, or strategies!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('type') || lowerQuestion.includes('advantage')) {
      return "Type advantages are crucial in battles! For example, Water beats Fire, Fire beats Grass, and Grass beats Water. Electric is super effective against Water and Flying types.";
    } else if (lowerQuestion.includes('evolve') || lowerQuestion.includes('evolution')) {
      return "Pokémon evolve when they reach certain levels! Most starter Pokémon evolve at level 16, then again at level 36. Evolution makes your Pokémon stronger with better stats.";
    } else if (lowerQuestion.includes('breed') || lowerQuestion.includes('breeding')) {
      return "Breeding allows you to create new Pokémon eggs! Select two compatible Pokémon from your collection, and they'll produce an egg.";
    } else if (lowerQuestion.includes('battle') || lowerQuestion.includes('strategy')) {
      return "Good battle strategy involves knowing type matchups, managing your Pokémon's HP, and choosing the right moves!";
    } else {
      return "That's a great question! Try asking about type advantages, evolution, breeding, or battle strategies!";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/trainer/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();

      if (!data.success && data.error) {
        const fallbackContent = getFallbackResponse(userMessage.content);
        const assistantMessage: Message = {
          role: 'assistant',
          content: fallbackContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const fallbackContent = getFallbackResponse(userMessage.content);
      const errorMessage: Message = {
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What are type advantages?",
    "How do I evolve my Pokémon?",
    "Tell me about breeding",
    "What's a good battle strategy?",
  ];

  return (
    <WalletGuard>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .floating-orb {
          animation: float 6s ease-in-out infinite;
        }
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .message-user {
          animation: slide-in-right 0.4s ease-out;
        }
        .message-assistant {
          animation: slide-in-left 0.4s ease-out;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 floating-orb"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 floating-orb" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 floating-orb" style={{ animationDelay: '4s' }}></div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full sparkle"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full sparkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-green-400 rounded-full sparkle" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[calc(100vh-2rem)] flex flex-col">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block relative">
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 gradient-animate flex items-center justify-center gap-4 mb-3 drop-shadow-2xl">
                  <span className="text-7xl animate-bounce">👨‍🔬</span>
                  <span>Professor Oak&apos;s Lab</span>
                </h1>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full sparkle"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full sparkle" style={{ animationDelay: '1s' }}></div>
              </div>
              <p className="text-xl text-gray-700 font-semibold drop-shadow-lg">✨ Your AI Pokémon Training Assistant ✨</p>
            </div>

            {/* Main Chat Container */}
            <div className="flex-1 glass-effect rounded-3xl shadow-2xl p-8 flex flex-col overflow-hidden pulse-glow">
              
              {/* Professor Header */}
              <div className="flex items-center gap-4 pb-6 border-b-2 border-blue-200 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-5xl shadow-2xl pulse-glow">
                    👨‍🔬
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-4 border-white animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-800 drop-shadow-lg">Professor Oak</h2>
                  <p className="text-gray-600 text-sm font-semibold">🎓 Pokémon Research Expert  •  Master Trainer</p>
                </div>
                <span className="px-5 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-black shadow-lg animate-pulse">
                  ● ONLINE
                </span>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-black transition-all transform hover:scale-105 shadow-xl"
                >
                  ← Back
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                      message.role === 'user' ? 'message-user' : 'message-assistant'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-2xl transform hover:scale-105 transition-transform ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white'
                          : 'bg-white text-gray-900 border-2 border-blue-200'
                      }`}
                    >
                      <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                      <p className={`text-xs mt-2 font-semibold ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        🕐 {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start message-assistant">
                    <div className="bg-white border-2 border-blue-200 rounded-3xl px-6 py-4 shadow-2xl">
                      <div className="flex gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="mb-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 backdrop-blur-sm">
                  <p className="text-gray-800 font-black mb-3 text-sm flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <span>QUICK START QUESTIONS:</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-900 text-sm px-4 py-3 rounded-xl transition-all transform hover:scale-105 text-left border-2 border-blue-300 font-bold shadow-lg"
                      >
                        ✨ {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="✍️ Ask Professor Oak anything..."
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-blue-300 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-300/50 text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:bg-gray-100 font-semibold text-lg bg-white backdrop-blur-sm shadow-xl transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-110 disabled:cursor-not-allowed disabled:scale-100 shadow-2xl"
                >
                  {isLoading ? '⏳' : 'Send 🚀'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}

export default TrainerDialoguePage;
