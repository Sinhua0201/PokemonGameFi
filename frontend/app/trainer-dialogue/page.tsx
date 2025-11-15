'use client';

import { useState } from 'react';
import AITrainerDialogue from '@/components/AITrainerDialogue';
import { MessageCircle, Swords, Trophy, Sparkles } from 'lucide-react';

export default function TrainerDialoguePage() {
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueConfig, setDialogueConfig] = useState<any>({
    trainer: null,
    trigger: 'random_encounter',
    context: {}
  });

  const openDialogue = (trigger: string, context: any = {}) => {
    setDialogueConfig({
      trainer: null,
      trigger,
      context
    });
    setShowDialogue(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Trainer Dialogue System
          </h1>
          <p className="text-lg text-gray-600">
            Chat with AI-powered trainers with unique personalities
          </p>
        </div>

        {/* Trainer Personalities */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Meet the Trainers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">😊</div>
              <h3 className="font-bold text-lg mb-1">Trainer Alex</h3>
              <p className="text-sm text-gray-600 mb-2">Friendly</p>
              <p className="text-xs text-gray-500">
                Supportive and encouraging, loves to help others grow
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="font-bold text-lg mb-1">Trainer Blaze</h3>
              <p className="text-sm text-gray-600 mb-2">Competitive</p>
              <p className="text-xs text-gray-500">
                Fierce competitor focused on becoming the best
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">🌙</div>
              <h3 className="font-bold text-lg mb-1">Trainer Shadow</h3>
              <p className="text-sm text-gray-600 mb-2">Mysterious</p>
              <p className="text-xs text-gray-500">
                Enigmatic trainer with hidden knowledge
              </p>
            </div>
          </div>
        </div>

        {/* Dialogue Triggers */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Try Different Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => openDialogue('random_encounter', {})}
              className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-bold text-gray-800">Random Encounter</h3>
                <p className="text-sm text-gray-600">
                  Meet a trainer on your journey
                </p>
              </div>
            </button>

            <button
              onClick={() => openDialogue('before_battle', {})}
              className="flex items-center gap-3 p-4 border-2 border-red-500 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <Swords className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="font-bold text-gray-800">Before Battle</h3>
                <p className="text-sm text-gray-600">
                  Pre-battle conversation
                </p>
              </div>
            </button>

            <button
              onClick={() => openDialogue('after_victory', { battle_result: 'victory' })}
              className="flex items-center gap-3 p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors text-left"
            >
              <Trophy className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-bold text-gray-800">After Victory</h3>
                <p className="text-sm text-gray-600">
                  Celebrate your win
                </p>
              </div>
            </button>

            <button
              onClick={() => openDialogue('after_defeat', { battle_result: 'defeat' })}
              className="flex items-center gap-3 p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors text-left"
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-bold text-gray-800">After Defeat</h3>
                <p className="text-sm text-gray-600">
                  Learn from your loss
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Features
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong>Three Unique Personalities:</strong> Friendly, Competitive, and Mysterious trainers with distinct dialogue styles
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong>Context-Aware Responses:</strong> Trainers respond differently based on battle outcomes and game events
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong>Conversation History:</strong> AI maintains context from previous messages for natural dialogue flow
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong>Fast Response Time:</strong> AI-generated responses within 3 seconds using Gemini 2.0 Flash
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong>Beautiful UI:</strong> Speech bubble interface with trainer avatars and smooth animations
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Dialogue Modal */}
      {showDialogue && (
        <AITrainerDialogue
          trigger={dialogueConfig.trigger}
          context={dialogueConfig.context}
          onClose={() => setShowDialogue(false)}
          autoGreet={true}
        />
      )}
    </div>
  );
}
