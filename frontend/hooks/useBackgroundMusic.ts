import { useEffect, useRef, useState } from 'react';

export function useBackgroundMusic(musicPath: string, options?: {
    volume?: number;
    loop?: boolean;
    autoPlay?: boolean;
}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Create audio element
        const audio = new Audio(musicPath);
        audio.loop = options?.loop ?? true;
        audio.volume = options?.volume ?? 0.3;
        audioRef.current = audio;

        // Auto play if enabled
        if (options?.autoPlay !== false) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.log('Auto-play prevented:', error);
                        // Auto-play was prevented, user needs to interact first
                    });
            }
        }

        // Cleanup on unmount
        return () => {
            audio.pause();
            audio.currentTime = 0;
            audioRef.current = null;
        };
    }, [musicPath, options?.loop, options?.volume, options?.autoPlay]);

    const play = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const setVolume = (volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    return {
        isPlaying,
        isMuted,
        play,
        pause,
        togglePlay,
        toggleMute,
        setVolume,
    };
}
