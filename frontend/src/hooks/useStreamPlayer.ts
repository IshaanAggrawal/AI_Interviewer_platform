import { useRef, useCallback, useEffect } from "react";

export function useStreamPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const queueRef = useRef<AudioBuffer[]>([]);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  // Initialize AudioContext on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || queueRef.current.length === 0) return;

    const ctx = audioContextRef.current;
    
    // Calculate when to start this chunk
    // Ensure we don't schedule in the past
    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    
    const buffer = queueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.start(startTime);
    sourceNodesRef.current.push(source);

    // Update the start time for the *next* chunk
    nextStartTimeRef.current = startTime + buffer.duration;

    source.onended = () => {
      // Remove from array when done
      sourceNodesRef.current = sourceNodesRef.current.filter((s) => s !== source);
      if (sourceNodesRef.current.length === 0 && queueRef.current.length === 0) {
        isPlayingRef.current = false;
      }
    };
  }, []);

  const addChunk = useCallback(async (base64Audio: string) => {
    initAudio();
    if (!audioContextRef.current) return;

    try {
      // Convert base64 to ArrayBuffer
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode the audio data (works for MP3, WAV, etc)
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      queueRef.current.push(audioBuffer);
      
      // If we're not currently playing anything, start the queue
      if (!isPlayingRef.current || nextStartTimeRef.current < audioContextRef.current.currentTime) {
        isPlayingRef.current = true;
        // Reset start time if it fell behind
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }
      
      playNextInQueue();
    } catch (err) {
      console.error("Failed to decode audio chunk:", err);
    }
  }, [initAudio, playNextInQueue]);

  const stop = useCallback(() => {
    // Stop all currently playing nodes
    sourceNodesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    });
    sourceNodesRef.current = [];
    queueRef.current = [];
    isPlayingRef.current = false;
    nextStartTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return { addChunk, stop, initAudio };
}
