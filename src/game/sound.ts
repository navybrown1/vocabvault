import { SOUND_MANIFEST } from './constants';
import type { SoundEvent } from './types';

export interface SoundController {
  play: (event: SoundEvent, enabled: boolean) => void;
  dispose: () => void;
}

export function createSoundController(): SoundController {
  let context: AudioContext | null = null;

  const ensureContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!context) {
      const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) {
        return null;
      }
      context = new AudioContextConstructor();
    }

    if (context.state === 'suspended') {
      void context.resume();
    }

    return context;
  };

  return {
    play(event, enabled) {
      if (!enabled) {
        return;
      }

      const audioContext = ensureContext();
      if (!audioContext) {
        return;
      }

      const manifest = SOUND_MANIFEST[event];
      const startAt = audioContext.currentTime;
      const peakVolume = manifest.volume ?? 0.08;
      const noteGap = manifest.gap ?? 0.05;

      const scheduleTone = ({
        frequency,
        type,
        noteStart,
        noteEnd,
        volume,
      }: {
        frequency: number;
        type: OscillatorType;
        noteStart: number;
        noteEnd: number;
        volume: number;
      }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
      };

      manifest.frequencies.forEach((frequency, index) => {
        const noteStart = startAt + index * noteGap;
        const noteEnd = noteStart + manifest.duration;
        scheduleTone({
          frequency,
          type: manifest.type ?? 'triangle',
          noteStart,
          noteEnd,
          volume: peakVolume,
        });

        if (event === 'correctAnswer') {
          scheduleTone({
            frequency: frequency / 2,
            type: 'sine',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.4,
          });
        }

        if (event === 'wrongAnswer') {
          scheduleTone({
            frequency: Math.max(frequency / 2, 98),
            type: 'square',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.45,
          });
        }
      });
    },
    dispose() {
      if (context) {
        void context.close();
        context = null;
      }
    },
  };
}
