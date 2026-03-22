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
        frequencyEnd,
        type,
        noteStart,
        noteEnd,
        volume,
      }: {
        frequency: number;
        frequencyEnd?: number;
        type: OscillatorType;
        noteStart: number;
        noteEnd: number;
        volume: number;
      }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        if (typeof frequencyEnd === 'number' && frequencyEnd !== frequency) {
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(frequencyEnd, 1), noteEnd);
        }
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
      };

      const scheduleChord = ({
        frequencies,
        type,
        noteStart,
        noteEnd,
        volume,
      }: {
        frequencies: number[];
        type: OscillatorType;
        noteStart: number;
        noteEnd: number;
        volume: number;
      }) => {
        frequencies.forEach((frequency) => {
          scheduleTone({
            frequency,
            type,
            noteStart,
            noteEnd,
            volume,
          });
        });
      };

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
            frequency: note,
            frequencyEnd: note * 1.015,
            type: 'triangle',
            noteStart,
            noteEnd,
            volume: peakVolume,
          });
          scheduleTone({
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
          frequencies: [523, 659, 784, 1046],
          type: 'triangle',
          noteStart: finaleStart,
          noteEnd: finaleEnd,
          volume: peakVolume * 0.7,
        });
        scheduleChord({
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
            frequency: frequency * 1.05,
            frequencyEnd: frequency * 0.62,
            type: 'sawtooth',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.95,
          });
          scheduleTone({
            frequency: frequency / 2,
            frequencyEnd: frequency / 2.7,
            type: 'square',
            noteStart,
            noteEnd,
            volume: peakVolume * 0.48,
          });
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
