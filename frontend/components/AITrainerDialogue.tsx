'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, X } from 'lucide-react';

interface Message {
  role: 'player' | 'trainer';
  message: string;
  timestamp: Date;
}

interface TrainerProfile {
  id: string;
  name: string;
  personality: 'friendly' | 'competitive' | 'mysterious';
  avatar: string;
  description: string;
}

interface AITrainerDialogueProps {
  trainer?: TrainerProfile;
  trigger?: 'before_battle' | 'after_victory' | 'after_defeat' | 'random_encounter';
  context?: {
    player_team?: any[];
    battle_result?: string;
    [key: string]: any;
  };
  onClose?: () => void;
  autoGreet?: boolean;
}

const DEFAULT_TRAINERS: TrainerProfile[] = [
  {
    id: 'friendly',
    name: 'Trainer Alex',
    personality: 'friendly',
    avatar: '😊',
    description: 'A supportive trainer who loves to help others grow'
  },
  {
    id: 'competitive',
    name: 'Trainer Blaze',
    personality: 'competitive',
    avatar: '🔥',
    description: 'A fierce competitor focused on becoming the best'
  },
  {
    id: 'mysterious',
    name: 'Trainer Shadow',
    personality: 'mysterious',
    avatar: '🌙',
    description: 'An enigmatic trainer with hidden knowledge'
  }
];

export default function AITrainerDialogue({
  trainer,
  trigger,
  context,
  onClose,
  autoGreet = true
}: AITrainerDialogueProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile>(
    trainer || DEFAULT_TRAINERS[0]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-greet when component mounts
  useEffect(() => {
    if (autoGreet && messages.length === 0) {
      sendGreeting();
    }
  }, [autoGreet]);

  const sendGreeting = async () => {
    setIsLoading(true);
    try {
      const greetingContext = {
        trigger: trigger || 'random_encounter',
        ...context
      };

      const response = await fetch('http://localhost:8000/api/ai/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_message: 'Hello!',
          trainer_personality: selectedTrainer.personality,
          conversation_history: [],
          context: greetingContext
        })
      });

      if (!response.ok) throw new Error('Failed to get greeting');

      const data = await response.json();
      
      setMessages([{
        role: 'trainer',
        message: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting greeting:', error);
      setMessages([{
        role: 'trainer',
        message: getFallbackGreeting(),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackGreeting = () => {
    const greetings = {
      friendly: "Hey there! It's great to meet you! Ready for an adventure?",
      competitive: "So you're my next challenger? Let's see what you've got!",
      mysterious: "Our paths cross at an interesting time... What brings you here?"
    };
    return greetings[selectedTrainer.personality];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const playerMessage: Message = {
      role: 'player',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        message: msg.message
      }));

      const response = await fetch('http://localhost:8000/api/ai/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_message: inputMessage,
          trainer_personality: selectedTrainer.personality,
          conversation_history: history,
          context: context || {}
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const trainerMessage: Message = {
        role: 'trainer',
        message: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, trainerMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        role: 'trainer',
        message: "Hmm, I seem to have lost my train of thought. What were we talking about?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{selectedTrainer.avatar}</div>
            <div>
              <h2 className="text-xl font-bold">{selectedTrainer.name}</h2>
              <p className="text-sm text-blue-100">{selectedTrainer.description}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Trainer Selector */}
        {!trainer && (
          <div className="p-3 border-b bg-gray-50">
            <div className="flex gap-2">
              {DEFAULT_TRAINERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTrainer(t);
                    setMessages([]);
                    sendGreeting();
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedTrainer.id === t.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{t.avatar}</span>
                  <span className="text-sm font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'player'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.role === 'trainer' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{selectedTrainer.avatar}</span>
                    <span className="text-xs font-semibold">{selectedTrainer.name}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <span className="text-lg">{selectedTrainer.avatar}</span>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
