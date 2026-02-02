import Link from 'next/link';
import { useSpotifyNowPlaying } from '@lib/hooks/useSpotifyNowPlaying';
import { HeroIcon } from '@components/ui/hero-icon';

/**
 * Barra fixa no rodapé mostrando a música atual do usuário
 * Aparece apenas quando está tocando algo
 */
export function NowPlayingBar(): JSX.Element | null {
  const { nowPlaying, isConnected, isLoading } = useSpotifyNowPlaying();

  // Não mostrar se não conectou ou não está tocando
  if (
    !isConnected ||
    isLoading ||
    !nowPlaying?.isPlaying ||
    !nowPlaying.track
  ) {
    return null;
  }

  const { track } = nowPlaying;
  const progressPercent = nowPlaying.progressMs
    ? (nowPlaying.progressMs / track.durationMs) * 100
    : 0;

  return (
    // Em mobile, fica acima da barra de navegação (bottom-16 = 64px)
    // Em desktop (xs:), fica no rodapé normal (bottom-0)
    <div className='fixed bottom-16 left-0 right-0 z-40 border-t border-[#1DB954]/30 bg-main-background/95 backdrop-blur-md xs:bottom-0 xs:z-50'>
      {/* Barra de progresso no topo */}
      <div className='h-1 w-full bg-[#1DB954]/20'>
        <div
          className='h-full bg-[#1DB954] transition-all duration-1000'
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-2'>
        {/* Indicador pulsante */}
        <div className='relative hidden h-3 w-3 items-center justify-center xs:flex'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]' />
        </div>

        {/* Capa do álbum */}
        <div className='flex-shrink-0'>
          {track.image ? (
            <img
              src={track.image}
              alt={track.album}
              className='h-10 w-10 rounded object-cover shadow-lg xs:h-12 xs:w-12'
            />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded bg-[#1DB954]/20 xs:h-12 xs:w-12'>
              <HeroIcon
                iconName='MusicalNoteIcon'
                className='h-5 w-5 text-[#1DB954]'
              />
            </div>
          )}
        </div>

        {/* Info da música */}
        <div className='min-w-0 flex-1'>
          <a
            href={track.spotifyUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='block truncate text-sm font-bold text-light-primary transition-colors hover:text-[#1DB954] dark:text-dark-primary'
          >
            {track.name}
          </a>
          <p className='truncate text-xs text-light-secondary dark:text-dark-secondary'>
            {track.artist} • {track.album}
          </p>
        </div>

        {/* Equalizer animado */}
        <div className='hidden h-4 items-end gap-0.5 sm:flex'>
          <span
            className='w-1 animate-[equalizer_0.5s_ease-in-out_infinite] rounded-full bg-[#1DB954]'
            style={{ height: '40%' }}
          />
          <span
            className='w-1 animate-[equalizer_0.5s_ease-in-out_infinite_0.1s] rounded-full bg-[#1DB954]'
            style={{ height: '70%' }}
          />
          <span
            className='w-1 animate-[equalizer_0.5s_ease-in-out_infinite_0.2s] rounded-full bg-[#1DB954]'
            style={{ height: '50%' }}
          />
          <span
            className='w-1 animate-[equalizer_0.5s_ease-in-out_infinite_0.15s] rounded-full bg-[#1DB954]'
            style={{ height: '80%' }}
          />
        </div>

        {/* Botão Spotify */}
        <a
          href={track.spotifyUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex-shrink-0 rounded-full bg-[#1DB954] p-2 transition-transform hover:scale-110'
          title='Abrir no Spotify'
        >
          <svg
            className='h-4 w-4 text-white'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' />
          </svg>
        </a>
      </div>
    </div>
  );
}
