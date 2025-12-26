import { useCallback, useRef } from "react";

// Web Audio API-based celebration sound synthesizer
export const useCelebrationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create a magical sparkle/chime sound
  const playSparkle = useCallback((delay: number = 0, frequency: number = 800) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime + delay;

    // Oscillator for the main tone
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 0.3);

    // Gain envelope for sparkle effect
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }, [getAudioContext]);

  // Create a whoosh/explosion sound
  const playWhoosh = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // White noise for the whoosh
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for the whoosh effect
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.5);
  }, [getAudioContext]);

  // Create a triumphant chord
  const playTriumphantChord = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Major chord frequencies (C major with harmonics)
    const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i < 3 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      const volume = 0.08 / (i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.1);
      gain.gain.setValueAtTime(volume, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2);
    });
  }, [getAudioContext]);

  // Full celebration sequence
  const playCelebrationSequence = useCallback(() => {
    // Initial whoosh
    playWhoosh();

    // Sparkle cascade
    const sparkleNotes = [800, 1000, 1200, 1400, 1600, 1800, 2000];
    sparkleNotes.forEach((freq, i) => {
      playSparkle(0.1 + i * 0.08, freq);
    });

    // Triumphant chord
    setTimeout(() => {
      playTriumphantChord();
    }, 600);

    // Final sparkle flourish
    setTimeout(() => {
      [2000, 2200, 2400].forEach((freq, i) => {
        playSparkle(i * 0.1, freq);
      });
    }, 1500);
  }, [playWhoosh, playSparkle, playTriumphantChord]);

  return {
    playSparkle,
    playWhoosh,
    playTriumphantChord,
    playCelebrationSequence,
  };
};

export default useCelebrationSound;
