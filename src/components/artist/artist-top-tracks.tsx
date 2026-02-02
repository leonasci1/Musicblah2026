import { useState, useRef } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import type { SpotifyTopTrack } from '@lib/types/artist';

type ArtistTopTracksProps = {
  tracks: SpotifyTopTrack[];
  artistName: string;
};

export function ArtistTopTracks({
  tracks,
  artistName
}: ArtistTopTracksProps): JSX.Element {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (track: SpotifyTopTrack) => {
    if (!track.previewUrl) return;

    if (playingId === track.id) {
      // Pause
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.previewUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(track.id);
    }
  };

  return (
    <section className='border-t border-light-border px-4 py-4 dark:border-dark-border'>
      <h2 className='mb-4 text-lg font-bold text-light-primary dark:text-dark-primary'>
        Músicas Populares
      </h2>

      <div className='flex flex-col gap-1'>
        {tracks.slice(0, 5).map((track, index) => (
          <div
            key={track.id}
            className='group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-main-sidebar-background'
          >
            {/* Number / Play */}
            <div className='relative flex h-8 w-8 items-center justify-center'>
              <span className='text-sm text-light-secondary group-hover:hidden dark:text-dark-secondary'>
                {index + 1}
              </span>
              <button
                onClick={() => handlePlay(track)}
                className={`absolute inset-0 hidden items-center justify-center group-hover:flex ${
                  !track.previewUrl ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={!track.previewUrl}
              >
                <HeroIcon
                  iconName={playingId === track.id ? 'PauseIcon' : 'PlayIcon'}
                  className='h-5 w-5 text-light-primary dark:text-dark-primary'
                  solid
                />
              </button>
            </div>

            {/* Image */}
            <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded'>
              {track.image ? (
                <img
                  src={track.image}
                  alt={track.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-main-sidebar-background'>
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='h-5 w-5 text-light-secondary'
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className='min-w-0 flex-1'>
              <h3 className='line-clamp-1 text-sm font-medium text-light-primary dark:text-dark-primary'>
                {track.name}
              </h3>
            </div>

            {/* Popularity bar */}
            <div className='hidden w-24 items-center gap-2 sm:flex'>
              <div className='h-1 flex-1 overflow-hidden rounded-full bg-light-border dark:bg-dark-border'>
                <div
                  className='h-full rounded-full bg-main-accent'
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
            </div>

            {/* Duration */}
            <span className='text-sm text-light-secondary dark:text-dark-secondary'>
              {formatDuration(track.durationMs)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
