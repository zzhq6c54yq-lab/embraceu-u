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

  // Create a deep bass impact sound
  const playBassImpact = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Deep bass oscillator
    const bassOsc = ctx.createOscillator();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(80, now);
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    // Sub-bass layer
    const subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(50, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

    // Bass gain envelope
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.4, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    bassOsc.connect(bassGain);
    subOsc.connect(subGain);
    bassGain.connect(ctx.destination);
    subGain.connect(ctx.destination);

    bassOsc.start(now);
    subOsc.start(now);
    bassOsc.stop(now + 0.5);
    subOsc.stop(now + 0.6);
  }, [getAudioContext]);

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
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }, [getAudioContext]);

  // Create shimmer arpeggios
  const playShimmerArpeggio = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // High frequency shimmer cascade
    const shimmerFreqs = [1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400];
    
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.4);
    });
  }, [getAudioContext]);

  // Create a whoosh/explosion sound
  const playWhoosh = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // White noise for the whoosh
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for the whoosh effect
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    filter.Q.setValueAtTime(1, now);

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
  }, [getAudioContext]);

  // Create a deep gong/bell sound
  const playGong = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fundamental gong frequency
    const frequencies = [120, 180, 240, 360];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 2);

      const gain = ctx.createGain();
      const vol = 0.15 / (i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.05);
      gain.gain.setValueAtTime(vol, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }, [getAudioContext]);

  // Create a triumphant chord with richer harmonics
  const playTriumphantChord = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Extended major chord frequencies with harmonics (C major with 9th)
    const frequencies = [
      130.81, // C3
      164.81, // E3
      196.00, // G3
      261.63, // C4
      293.66, // D4 (add 9)
      329.63, // E4
      392.00, // G4
      523.25, // C5
      659.25, // E5
      783.99, // G5
    ];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i < 4 ? "sine" : i < 7 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      const volume = 0.06 / Math.sqrt(i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.15);
      gain.gain.setValueAtTime(volume * 0.9, now + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3);
    });
  }, [getAudioContext]);

  // Create victory fanfare
  const playFanfare = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rising fanfare notes
    const fanfareNotes = [
      { freq: 392, time: 0, duration: 0.15 },     // G4
      { freq: 523.25, time: 0.12, duration: 0.15 }, // C5
      { freq: 659.25, time: 0.24, duration: 0.15 }, // E5
      { freq: 783.99, time: 0.36, duration: 0.5 },  // G5 (held)
    ];

    fanfareNotes.forEach(note => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.1, now + note.time + 0.02);
      gain.gain.setValueAtTime(0.1, now + note.time + note.duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    });
  }, [getAudioContext]);

  // Full celebration sequence - Enhanced luxurious version
  const playCelebrationSequence = useCallback(() => {
    // Initial deep bass impact
    playBassImpact();

    // Whoosh with bass
    setTimeout(() => {
      playWhoosh();
    }, 100);

    // Shimmer arpeggio cascade
    setTimeout(() => {
      playShimmerArpeggio();
    }, 300);

    // Sparkle cascade
    const sparkleNotes = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200];
    sparkleNotes.forEach((freq, i) => {
      playSparkle(0.15 + i * 0.06, freq);
    });

    // Deep gong for impact
    setTimeout(() => {
      playGong();
    }, 500);

    // Victory fanfare
    setTimeout(() => {
      playFanfare();
    }, 700);

    // Triumphant chord
    setTimeout(() => {
      playTriumphantChord();
    }, 1000);

    // Final sparkle flourish
    setTimeout(() => {
      [2400, 2600, 2800, 3000, 3200].forEach((freq, i) => {
        playSparkle(i * 0.08, freq);
      });
    }, 2000);

    // Ending shimmer
    setTimeout(() => {
      playShimmerArpeggio();
    }, 2500);
  }, [playBassImpact, playWhoosh, playShimmerArpeggio, playSparkle, playGong, playFanfare, playTriumphantChord]);

  return {
    playSparkle,
    playWhoosh,
    playTriumphantChord,
    playCelebrationSequence,
    playBassImpact,
    playGong,
    playFanfare,
    playShimmerArpeggio,
  };
};

export default useCelebrationSound;
