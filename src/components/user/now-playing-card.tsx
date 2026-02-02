import Link from 'next/link';
import { useSpotifyNowPlaying } from '@lib/hooks/useSpotifyNowPlaying';
import { useUserNowPlaying } from '@lib/hooks/useUserNowPlaying';
import { HeroIcon } from '@components/ui/hero-icon';

type NowPlayingCardProps = {
  userId: string;
  isOwner?: boolean;
};

export function NowPlayingCard({
  userId,
  isOwner = false
}: NowPlayingCardProps): JSX.Element | null {
  // Se é o dono, usa o hook com controles (connect/disconnect)
  // Se é visitante, usa o hook que só lê os dados do usuário
  const ownerHook = useSpotifyNowPlaying();
  const visitorHook = useUserNowPlaying(isOwner ? null : userId);

  // Selecionar o hook correto
  const { nowPlaying, isConnected, isLoading } = isOwner
    ? ownerHook
    : visitorHook;
  const { connect, disconnect } = ownerHook;

  // Se não é o dono e não está conectado, não mostra nada
  if (!isOwner && !isConnected) return null;

  // Loading
  if (isLoading)
    return (
      <div className='animate-pulse rounded-2xl border border-light-border p-4 dark:border-dark-border'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-lg bg-light-secondary/20' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-3/4 rounded bg-light-secondary/20' />
            <div className='h-3 w-1/2 rounded bg-light-secondary/20' />
          </div>
        </div>
      </div>
    );

  // Se é o dono mas não está conectado, mostra opção de conectar
  if (isOwner && !isConnected)
    return (
      <button
        onClick={connect}
        className='flex w-full items-center gap-3 rounded-2xl border border-dashed border-light-border p-4 transition-colors hover:border-[#1DB954] hover:bg-[#1DB954]/5 dark:border-dark-border'
      >
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#1DB954]/10'>
          <svg
            className='h-6 w-6 text-[#1DB954]'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' />
          </svg>
        </div>
        <div className='flex-1 text-left'>
          <p className='text-sm font-bold text-light-primary dark:text-dark-primary'>
            Conectar Spotify
          </p>
          <p className='text-xs text-light-secondary dark:text-dark-secondary'>
            Mostre o que você está ouvindo
          </p>
        </div>
        <HeroIcon
          iconName='ArrowRightIcon'
          className='h-5 w-5 text-light-secondary'
        />
      </button>
    );

  // Se está conectado mas não está tocando nada
  if (!nowPlaying?.isPlaying || !nowPlaying.track)
    return (
      <div className='flex items-center gap-3 rounded-2xl border border-light-border p-4 dark:border-dark-border'>
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-light-secondary/10'>
          <HeroIcon
            iconName='MusicalNoteIcon'
            className='h-6 w-6 text-light-secondary'
          />
        </div>
        <div className='flex-1'>
          <p className='text-sm text-light-secondary dark:text-dark-secondary'>
            Nenhuma música tocando
          </p>
        </div>
        {isOwner && (
          <button
            onClick={disconnect}
            className='text-xs text-light-secondary hover:text-accent-red'
          >
            Desconectar
          </button>
        )}
      </div>
    );

  // Mostrando música atual
  const { track } = nowPlaying;
  const progressPercent = nowPlaying.progressMs
    ? (nowPlaying.progressMs / track.durationMs) * 100
    : 0;

  return (
    <div className='overflow-hidden rounded-2xl border border-[#1DB954]/30 bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-[#1DB954]/20 px-4 py-2'>
        <div className='relative flex h-3 w-3 items-center justify-center'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]' />
        </div>
        <span className='text-xs font-semibold text-[#1DB954]'>
          Ouvindo agora
        </span>

        {isOwner && (
          <button
            onClick={disconnect}
            className='ml-auto text-xs text-light-secondary hover:text-accent-red'
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className='flex items-center gap-3 p-4'>
        {/* Album Art */}
        <Link href={`/artist/${track.artistId}`}>
          <a className='relative flex-shrink-0'>
            {track.image ? (
              <img
                src={track.image}
                alt={track.album}
                className='h-14 w-14 rounded-lg object-cover shadow-lg transition-transform hover:scale-105'
              />
            ) : (
              <div className='flex h-14 w-14 items-center justify-center rounded-lg bg-[#1DB954]/20'>
                <HeroIcon
                  iconName='MusicalNoteIcon'
                  className='h-6 w-6 text-[#1DB954]'
                />
              </div>
            )}

            {/* Equalizer animation */}
            <div className='absolute -right-1 -top-1 flex h-4 items-end gap-0.5 rounded bg-[#1DB954] px-1'>
              <span
                className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite] bg-white'
                style={{ height: '40%' }}
              />
              <span
                className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite_0.1s] bg-white'
                style={{ height: '70%' }}
              />
              <span
                className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite_0.2s] bg-white'
                style={{ height: '50%' }}
              />
            </div>
          </a>
        </Link>

        {/* Track Info */}
        <div className='min-w-0 flex-1'>
          <a
            href={track.spotifyUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='block truncate text-sm font-bold text-light-primary transition-colors hover:text-[#1DB954] dark:text-dark-primary'
          >
            {track.name}
          </a>
          <Link href={`/artist/${track.artistId}`}>
            <a className='block truncate text-xs text-light-secondary transition-colors hover:text-[#1DB954] dark:text-dark-secondary'>
              {track.artist}
            </a>
          </Link>

          {/* Progress bar */}
          <div className='mt-2 h-1 overflow-hidden rounded-full bg-[#1DB954]/20'>
            <div
              className='h-full bg-[#1DB954] transition-all duration-1000'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Spotify Link */}
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
