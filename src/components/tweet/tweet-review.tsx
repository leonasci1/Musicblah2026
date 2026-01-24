import { HeroIcon } from '@components/ui/hero-icon';
import { useRef, useState } from 'react';

type TweetReviewProps = {
  tweet: any;
};

export function TweetReview({ tweet }: TweetReviewProps) {
  const { album, track, rating, text } = tweet;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede que o clique no play abra o tweet

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Se não tiver nem álbum nem track, não renderiza nada
  if (!album && !track) return null;

  // =========================================================================
  // RENDERIZAÇÃO DE ÁLBUM (Layout Original)
  // =========================================================================
  if (album) {
    return (
      <article className='flex flex-col gap-4'>
        {text && (
          <p className='whitespace-pre-wrap break-words text-base text-light-primary dark:text-white'>
            {text}
          </p>
        )}

        <div className='hover:to-main-accent/15 flex cursor-pointer gap-4 rounded-2xl border border-main-accent/30 bg-gradient-to-br from-main-accent/5 to-main-accent/10 p-4 transition-all duration-200 hover:border-main-accent/60 hover:bg-gradient-to-br hover:from-main-accent/10'>
          {/* Capa do Álbum */}
          <div className='relative flex-shrink-0'>
            <img
              src={album.image}
              alt={album.name}
              className='h-28 w-28 rounded-lg object-cover shadow-lg ring-2 ring-main-accent/20'
            />
            {/* Badge de Rating */}
            <div className='absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-main-accent text-lg font-bold text-black shadow-lg'>
              {rating}
            </div>
          </div>

          {/* Informações do Álbum */}
          <div className='flex flex-col justify-between py-1'>
            <div>
              <h3 className='text-lg font-bold leading-tight text-light-primary transition-colors hover:text-main-accent dark:text-white'>
                {album.name}
              </h3>
              <p className='mt-1 text-sm text-gray-400'>{album.artist}</p>
              <p className='mt-0.5 text-xs text-gray-500'>{album.year}</p>
            </div>

            {/* Estrelas de Rating */}
            <div className='mt-2 flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <HeroIcon
                  key={star}
                  iconName='StarIcon'
                  className={`h-5 w-5 transition-colors ${
                    star <= rating
                      ? 'fill-main-accent text-main-accent'
                      : 'fill-gray-700 text-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // RENDERIZAÇÃO DE MÚSICA (Track com Player)
  // =========================================================================
  return (
    <article className='flex flex-col gap-4'>
      {text && (
        <p className='whitespace-pre-wrap break-words text-base text-light-primary dark:text-white'>
          {text}
        </p>
      )}

      <div className='flex w-full max-w-lg items-center gap-4 rounded-xl border border-gray-700 bg-main-search-background p-3 transition-colors hover:bg-main-sidebar-background'>
        {/* Capa Pequena com Player */}
        <div className='group relative flex-shrink-0'>
          <img
            src={track.image}
            alt={track.name}
            className='h-16 w-16 rounded-md object-cover shadow-md'
          />
          {/* Botão de Play sobre a capa (só aparece se tiver previewUrl) */}
          {track.previewUrl && (
            <button
              onClick={togglePlay}
              className='absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100'
            >
              <HeroIcon
                iconName={isPlaying ? 'PauseIcon' : 'PlayIcon'}
                className='h-8 w-8 text-white drop-shadow-lg'
                solid
              />
            </button>
          )}
        </div>

        {/* Elemento de Áudio (Invisível) */}
        {track.previewUrl && (
          <audio
            ref={audioRef}
            src={track.previewUrl}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Informações da Música */}
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-base font-bold text-light-primary dark:text-white'>
            {track.name}
          </h3>
          <p className='truncate text-sm text-gray-400'>{track.artist}</p>
          <div className='mt-1 flex items-center gap-2'>
            <HeroIcon
              iconName='MusicalNoteIcon'
              className='h-3 w-3 text-main-accent'
            />
            <p className='max-w-[150px] truncate text-xs text-gray-500'>
              {track.album}
            </p>
          </div>
        </div>

        {/* Rating e Duração */}
        <div className='flex flex-col items-end gap-1'>
          <div className='flex items-center gap-1 rounded-full bg-main-accent/20 px-2 py-1'>
            <span className='text-sm font-bold text-main-accent'>{rating}</span>
            <HeroIcon
              iconName='StarIcon'
              solid
              className='h-3 w-3 text-main-accent'
            />
          </div>
          <span className='text-xs text-gray-500'>{track.duration}</span>
        </div>
      </div>
    </article>
  );
}
