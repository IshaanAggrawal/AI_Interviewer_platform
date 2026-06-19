import { useState, useRef, useCallback } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBase64Audio = useCallback((base64String: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const audioSrc = `data:audio/wav;base64,${base64String}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          resolve();
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
          reject(e);
        };

        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => {
          console.error("Audio play error:", e);
          setIsPlaying(false);
          reject(e);
        });
      } catch (err) {
        setIsPlaying(false);
        reject(err);
      }
    });
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playBase64Audio, stopAudio };
}
