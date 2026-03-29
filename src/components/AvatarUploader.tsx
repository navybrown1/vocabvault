import { Camera, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Language, Player } from '@/game/types';
import { FallbackAvatar } from './FallbackAvatar';
import { getPlayerTheme } from './player-theme';

export interface AvatarUploaderProps {
  language?: Language;
  player: Player;
  error?: string | null;
  helperText?: string;
  onSelect: (file: File) => void;
}

export function AvatarUploader({ language = 'en', player, error, helperText, onSelect }: AvatarUploaderProps) {
  const theme = getPlayerTheme(player.color);
  const inputId = `${player.id}-avatar-input`;

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
        {language === 'en' ? 'Photo Upload' : 'Foto del jugador'}
      </label>
      <div className="flex items-center gap-4">
        {player.avatarDataUrl ? (
          <img
            src={player.avatarDataUrl}
            alt={`${player.name || `Player ${player.seat}`} avatar preview`}
            className="h-[4.5rem] w-[4.5rem] rounded-full border-[4px] border-white object-cover shadow-[0_8px_0_rgba(15,7,24,0.9)]"
          />
        ) : (
          <FallbackAvatar name={player.name || `P${player.seat}`} color={player.color} />
        )}

        <div className="min-w-0 flex-1">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onSelect(file);
              }
              event.currentTarget.value = '';
            }}
          />
          <motion.label
            htmlFor={inputId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className="arcade-button arcade-button--neutral inline-flex cursor-pointer px-4 py-3 text-[0.7rem] text-on-surface"
            style={{ background: `linear-gradient(135deg, ${theme.hex}, rgba(45,27,66,0.96))` }}
          >
            <UploadCloud className="h-4 w-4 text-white" />
            {player.hasUploadedImage
              ? language === 'en'
                ? 'Swap Photo'
                : 'Cambiar foto'
              : language === 'en'
                ? 'Upload Photo'
                : 'Subir foto'}
          </motion.label>
          <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
            <Camera className="h-3.5 w-3.5" />
            <span>{helperText ?? (language === 'en' ? 'Square crops look best on the scoreboard.' : 'Los recortes cuadrados se ven mejor en el marcador.')}</span>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-[#ff9baa]">{error}</p> : null}
    </div>
  );
}
