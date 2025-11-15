'use client';

import { CharacterPreview } from '@/components/CharacterPreview';

export default function TestCharacterPage() {
    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <h1 className="text-white text-3xl mb-8">Character Preview Test</h1>
            <div className="grid grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((id) => (
                    <div key={id} className="bg-gray-800 p-4 rounded-lg">
                        <h2 className="text-white text-xl mb-4">Character {id}</h2>
                        <CharacterPreview characterId={id} isSelected={false} />
                    </div>
                ))}
            </div>
            <div className="mt-8 text-white">
                <p>Open browser console (F12) to see loading logs</p>
            </div>
        </div>
    );
}
