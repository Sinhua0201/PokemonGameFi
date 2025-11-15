'use client';

import { useState, useCallback } from 'react';

interface Message {
  role: 'player' | 'trainer';
  message: string;
}

interface UseTrainerDialogueProps {
  personality?: 'friendly' | 'competitive' | 'mysterious';
  context?: any;
}

export function useTrainerDialogue({ 
  personality = 'friendly',
  context 
}: UseTrainerDialogueProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (playerMessage: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/ai/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_message: playerMessage,
          trainer_personality: personality,
          conversation_history: conversationHistory,
          context: context || {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get trainer response');
      }

      const data = await response.json();
      
      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'player' as const, message: playerMessage },
        { role: 'trainer' as const, message: data.response }
      ];
      
      setConversationHistory(newHistory);
      
      return data.response;
    } catch (error) {
      console.error('Error in trainer dialogue:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [personality, conversationHistory, context]);

  const openDialogue = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialogue = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetConversation = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    isOpen,
    openDialogue,
    closeDialogue,
    sendMessage,
    conversationHistory,
    isLoading,
    resetConversation
  };
}
