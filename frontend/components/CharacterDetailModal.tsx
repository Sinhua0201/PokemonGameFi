'use client';

import { CharacterModel3D } from './CharacterModel3D';

interface CharacterDetailModalProps {
  characterId: number;
  username: string;
  onClose: () => void;
}

export function CharacterDetailModal({ characterId, username, onClose }: CharacterDetailModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{username}'s Character</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 3D Character Display */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8">
          <div className="w-full h-96 bg-white rounded-lg shadow-inner overflow-hidden">
            <CharacterModel3D characterId={characterId} autoRotate={false} scale={0.012} />
          </div>
          <p className="text-center text-gray-600 mt-4 text-sm">
            🖱️ Drag to rotate • Scroll to zoom
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
