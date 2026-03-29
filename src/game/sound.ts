import { SOUND_MANIFEST } from './constants';
import type { MusicScene, SoundEvent } from './types';

interface MusicConfig {
  scene: MusicScene;
  intensity: number;
}

interface ScenePattern {
  tempo: number;
  lead: Array<number | null>;
  bass: Array<number | null>;
  harmony?: Array<number | null>;
  leadType: OscillatorType;
  bassType: OscillatorType;
  harmonyType?: OscillatorType;
  leadVolume: number;
  bassVolume: number;
  harmonyVolume?: number;
}

export interface SoundController {
  play: (event: SoundEvent, enabled: boolean) => void;
  syncMusic: (config: MusicConfig | null, enabled: boolean) => void;
  dispose: () => void;
}

const MUSIC_PATTERNS: Record<MusicScene, ScenePattern> = {
  menu: {
    tempo: 112,
    lead: [659, 784, 988, 784, 659, 784, 1046, 784],
    bass: [220, null, 196, null, 174, null, 196, null],
    harmony: [392, null, 349, null, 330, null, 349, null],
    leadType: 'triangle',
    bassType: 'sine',
    harmonyType: 'triangle',
    leadVolume: 0.023,
    bassVolume: 0.018,
    harmonyVolume: 0.012,
  },
  setup: {
    tempo: 118,
    lead: [740, 880, 988, 880, 784, 880, 1046, 1175],
    bass: [247, null, 220, null, 196, null, 220, null],
    harmony: [440, null, 392, null, 370, null, 392, null],
    leadType: 'triangle',
    bassType: 'sine',
    harmonyType: 'square',
    leadVolume: 0.026,
    bassVolume: 0.018,
    harmonyVolume: 0.011,
  },
  staging: {
    tempo: 122,
    lead: [784, 988, 1175, 988, 880, 988, 1318, 1175],
    bass: [247, null, 220, null, 196, null, 220, null],
    harmony: [440, null, 392, null, 370, null, 392, null],
    leadType: 'triangle',
    bassType: 'sine',
    harmonyType: 'triangle',
    leadVolume: 0.027,
    bassVolume: 0.019,
    harmonyVolume: 0.013,
  },
  question: {
    tempo: 126,
    lead: [784, null, 880, 988, 880, null, 1046, 988],
    bass: [220, null, null, 196, null, null, 247, null],
    harmony: [392, null, null, 349, null, null, 440, null],
    leadType: 'square',
    bassType: 'sine',
    harmonyType: 'triangle',
    leadVolume: 0.025,
    bassVolume: 0.018,
    harmonyVolume: 0.01,
  },
  clutch: {
    tempo: 138,
    lead: [988, 1175, 1318, 1175, 988, 1175, 1396, 1568],
    bass: [247, 247, null, 220, 220, null, 196, 196],
    harmony: [440, 440, null, 392, 392, null, 370, 370],
    leadType: 'sawtooth',
    bassType: 'square',
    harmonyType: 'triangle',
    leadVolume: 0.028,
    bassVolume: 0.02,
    harmonyVolume: 0.011,
  },
  paused: {
    tempo: 84,
    lead: [659, null, null, 784, null, null, 659, null],
    bass: [174, null, null, 147, null, null, 174, null],
    leadType: 'triangle',
    bassType: 'sine',
    leadVolume: 0.018,
    bassVolume: 0.014,
  },
  result: {
    tempo: 108,
    lead: [784, null, 988, null, 1175, null, 988, null],
    bass: [196, null, 220, null, 247, null, 220, null],
    harmony: [392, null, 440, null, 494, null, 440, null],
    leadType: 'triangle',
    bassType: 'sine',
    harmonyType: 'triangle',
    leadVolume: 0.022,
    bassVolume: 0.015,
    harmonyVolume: 0.01,
  },
  winner: {
    tempo: 132,
    lead: [1046, 1175, 1318, 1568, 1318, 1175, 1046, 1568],
    bass: [262, null, 294, null, 330, null, 392, null],
    harmony: [523, null, 587, null, 659, null, 784, null],
    leadType: 'triangle',
    bassType: 'square',
    harmonyType: 'triangle',
    leadVolume: 0.03,
    bassVolume: 0.022,
    harmonyVolume: 0.014,
  },
};

export function createSoundController(): SoundController {
  let context: AudioContext | null = null;
  let musicLoopTimer: number | null = null;
  let musicToken = 0;
  let currentMusicKey: string | null = null;
  let pendingMusicConfig: MusicConfig | null = null;

  const ensureContext = (allowCreate = false) => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!context) {
      if (!allowCreate) {
        return null;
      }

      const AudioContextConstructor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) {
        return null;
      }
      context = new AudioContextConstructor();
    }

    if (allowCreate && context.state === 'suspended') {
      void context.resume();
    }

    return context;
  };

  const scheduleTone = ({
    audioContext,
    frequency,
    frequencyEnd,
    type,
    noteStart,
    noteEnd,
    volume,
  }: {
    audioContext: AudioContext;
    frequency: number;
    frequencyEnd?: number;
    type: OscillatorType;
    noteStart: number;
    noteEnd: number;
    volume: number;
  }) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    if (typeof frequencyEnd === 'number' && frequencyEnd !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(frequencyEnd, 1), noteEnd);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'square' || type === 'sawtooth' ? 1800 : 2800, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  };

  const scheduleChord = ({
    audioContext,
    frequencies,
    type,
    noteStart,
    noteEnd,
    volume,
  }: {
    audioContext: AudioContext;
    frequencies: number[];
    type: OscillatorType;
    noteStart: number;
    noteEnd: number;
    volume: number;
  }) => {
    frequencies.forEach((frequency) => {
      scheduleTone({
        audioContext,
        frequency,
        type,
        noteStart,
        noteEnd,
        volume,
      });
    });
  };

  const stopMusic = () => {
    if (musicLoopTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(musicLoopTimer);
      musicLoopTimer = null;
    }
    currentMusicKey = null;
    musicToken += 1;
  };

  const startMusicLoopIfReady = () => {
    if (musicLoopTimer !== null || !pendingMusicConfig) {
      return;
    }

    const audioContext = ensureContext();
    if (!audioContext || audioContext.state !== 'running') {
      return;
    }

    musicToken += 1;
    scheduleMusicBar(pendingMusicConfig, musicToken);
  };

  const scheduleMusicBar = (config: MusicConfig, token: number) => {
    const audioContext = ensureContext();
    if (!audioContext || token !== musicToken) {
      return;
    }

    const pattern = MUSIC_PATTERNS[config.scene];
    const stepDuration = 30 / pattern.tempo;
    const barDuration = stepDuration * pattern.lead.length;
    const startAt = audioContext.currentTime + 0.04;
    const intensityMultiplier = 1 + Math.max(config.intensity - 1, 0) * 0.12;

    pattern.lead.forEach((frequency, index) => {
      if (!frequency) {
        return;
      }

      const noteStart = startAt + index * stepDuration;
      const noteEnd = noteStart + stepDuration * 0.86;
      scheduleTone({
        audioContext,
        frequency,
        frequencyEnd: frequency * 1.004,
        type: pattern.leadType,
        noteStart,
        noteEnd,
        volume: pattern.leadVolume * intensityMultiplier,
      });
    });

    pattern.bass.forEach((frequency, index) => {
      if (!frequency) {
        return;
      }

      const noteStart = startAt + index * stepDuration;
      const noteEnd = noteStart + stepDuration * 1.45;
      scheduleTone({
        audioContext,
        frequency,
        type: pattern.bassType,
        noteStart,
        noteEnd,
        volume: pattern.bassVolume * Math.min(intensityMultiplier, 1.24),
      });
    });

    const harmony = pattern.harmony;
    const harmonyType = pattern.harmonyType;
    const harmonyVolume = pattern.harmonyVolume;

    if (harmony && harmonyType && harmonyVolume) {
      harmony.forEach((frequency, index) => {
        if (!frequency || config.intensity < 2) {
          return;
        }

        const noteStart = startAt + index * stepDuration;
        const noteEnd = noteStart + stepDuration * 0.92;
        scheduleChord({
          audioContext,
          frequencies: [frequency, frequency * 1.25],
          type: harmonyType,
          noteStart,
          noteEnd,
          volume: harmonyVolume * Math.min(intensityMultiplier, 1.18),
        });
      });
    }

    if (typeof window !== 'undefined') {
      musicLoopTimer = window.setTimeout(() => {
        scheduleMusicBar(config, token);
      }, Math.max(barDuration * 1000 - 90, 300));
    }
  };

  return {
    play(event, enabled) {
      if (!enabled) {
        return;
      }

      const audioContext = ensureContext(true);
      if (!audioContext) {
        return;
      }

      startMusicLoopIfReady();

      const manifest = SOUND_MANIFEST[event];
      const startAt = audioContext.currentTime;
      const peakVolume = manifest.volume ?? 0.08;
      const noteGap = manifest.gap ?? 0.05;

      const playCorrectFanfare = () => {
        const fanfareNotes = [
          { note: 523, bass: 262 },
          { note: 659, bass: 330 },
          { note: 784, bass: 392 },
          { note: 1046, bass: 523 },
        ];

        fanfareNotes.forEach(({ note, bass }, index) => {
          const noteStart = startAt + index * 0.075;
          const noteEnd = noteStart + 0.19;
          scheduleTone({
            audioContext,
            frequency: note,
            frequencyEnd: note * 1.015,
            type: 'triangle',
            noteStart,
            noteEnd,
            volume: peakVolume,
          });
          scheduleTone({
            audioContext,
            frequency: bass,
            type: 'sine',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.34,
          });
        });

        const finaleStart = startAt + fanfareNotes.length * 0.078;
        const finaleEnd = finaleStart + 0.42;
        scheduleChord({
          audioContext,
          frequencies: [523, 659, 784, 1046],
          type: 'triangle',
          noteStart: finaleStart,
          noteEnd: finaleEnd,
          volume: peakVolume * 0.7,
        });
        scheduleChord({
          audioContext,
          frequencies: [262, 392, 523],
          type: 'sine',
          noteStart: finaleStart,
          noteEnd: finaleEnd,
          volume: peakVolume * 0.22,
        });
      };

      const playWrongSting = () => {
        const wahWahNotes = [349, 294, 247];

        wahWahNotes.forEach((frequency, index) => {
          const noteStart = startAt + index * 0.18;
          const noteEnd = noteStart + 0.2;
          scheduleTone({
            audioContext,
            frequency: frequency * 1.05,
            frequencyEnd: frequency * 0.62,
            type: 'sawtooth',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.95,
          });
          scheduleTone({
            audioContext,
            frequency: frequency / 2,
            frequencyEnd: frequency / 2.7,
            type: 'square',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.48,
          });
        });
      };

      const playWinnerCelebration = () => {
        const brassLine = [523, 659, 784, 988, 1175, 1568];
        brassLine.forEach((frequency, index) => {
          const noteStart = startAt + index * 0.07;
          const noteEnd = noteStart + 0.24;
          scheduleTone({
            audioContext,
            frequency,
            frequencyEnd: frequency * 1.018,
            type: 'triangle',
            noteStart,
            noteEnd,
            volume: peakVolume,
          });
          scheduleTone({
            audioContext,
            frequency: frequency / 2,
            type: 'square',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.22,
          });
        });

        const finaleStart = startAt + brassLine.length * 0.072;
        const finaleEnd = finaleStart + 0.72;
        scheduleChord({
          audioContext,
          frequencies: [523, 659, 784, 1046, 1318],
          type: 'triangle',
          noteStart: finaleStart,
          noteEnd: finaleEnd,
          volume: peakVolume * 0.78,
        });
        scheduleChord({
          audioContext,
          frequencies: [262, 392, 523],
          type: 'sine',
          noteStart: finaleStart,
          noteEnd: finaleEnd,
          volume: peakVolume * 0.28,
        });
      };

      const playStealActivation = () => {
        const alertNotes = [440, 554, 698];

        alertNotes.forEach((frequency, index) => {
          const noteStart = startAt + index * 0.08;
          const noteEnd = noteStart + 0.17;
          scheduleTone({
            audioContext,
            frequency,
            frequencyEnd: frequency * 1.09,
            type: 'sawtooth',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.82,
          });
          scheduleTone({
            audioContext,
            frequency: frequency / 2,
            type: 'square',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.32,
          });
        });

        const handoffStart = startAt + alertNotes.length * 0.082;
        const handoffEnd = handoffStart + 0.32;
        scheduleChord({
          audioContext,
          frequencies: [784, 988, 1318],
          type: 'triangle',
          noteStart: handoffStart,
          noteEnd: handoffEnd,
          volume: peakVolume * 0.7,
        });
        scheduleTone({
          audioContext,
          frequency: 196,
          frequencyEnd: 220,
          type: 'square',
          noteStart: handoffStart,
          noteEnd: handoffEnd,
          volume: peakVolume * 0.22,
        });
      };

      if (event === 'correctAnswer') {
        playCorrectFanfare();
        return;
      }

      if (event === 'wrongAnswer') {
        playWrongSting();
        return;
      }

      if (event === 'winnerCelebration') {
        playWinnerCelebration();
        return;
      }

      if (event === 'stealActivation') {
        playStealActivation();
        return;
      }

      manifest.frequencies.forEach((frequency, index) => {
        const noteStart = startAt + index * noteGap;
        const noteEnd = noteStart + manifest.duration;
        scheduleTone({
          audioContext,
          frequency,
          type: manifest.type ?? 'triangle',
          noteStart,
          noteEnd,
          volume: peakVolume,
        });
      });
    },
    syncMusic(config, enabled) {
      const nextKey = enabled && config ? `${config.scene}:${config.intensity}` : null;
      if (nextKey === currentMusicKey) {
        pendingMusicConfig = enabled ? config : null;
        startMusicLoopIfReady();
        return;
      }

      stopMusic();
      pendingMusicConfig = enabled ? config : null;

      if (!enabled || !config) {
        return;
      }

      currentMusicKey = nextKey;
      startMusicLoopIfReady();
    },
    dispose() {
      stopMusic();
      pendingMusicConfig = null;
      if (context) {
        void context.close();
        context = null;
      }
    },
  };
}
