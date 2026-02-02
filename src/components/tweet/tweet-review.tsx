import { useRouter } from 'next/router';
import { HeroIcon } from '@components/ui/hero-icon';
import { useRef, useState } from 'react';

type TweetReviewProps = {
  tweet: any;
};

export function TweetReview({ tweet }: TweetReviewProps) {
  const router = useRouter();
  const { album, track, rating, text } = tweet;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const navigateToArtist = (e: React.MouseEvent, artistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/artist/${artistId}`);
  };

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
              {album.artistId ? (
                <span
                  onClick={(e) => navigateToArtist(e, album.artistId)}
                  className='mt-1 block cursor-pointer text-sm text-gray-400 transition-colors hover:text-main-accent hover:underline'
                >
                  {album.artist}
                </span>
              ) : (
                <p className='mt-1 text-sm text-gray-400'>{album.artist}</p>
              )}
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
  if (track) {
    return (
      <article className='flex flex-col gap-4'>
        {text && (
          <p className='whitespace-pre-wrap break-words text-base text-light-primary dark:text-white'>
            {text}
          </p>
        )}

        <div className='hover:to-main-accent/15 flex cursor-pointer gap-4 rounded-2xl border border-main-accent/30 bg-gradient-to-br from-main-accent/5 to-main-accent/10 p-4 transition-all duration-200 hover:border-main-accent/60 hover:bg-gradient-to-br hover:from-main-accent/10'>
          {/* Capa da Música */}
          <div className='relative flex-shrink-0'>
            <img
              src={track.image}
              alt={track.name}
              className='h-28 w-28 rounded-lg object-cover shadow-lg ring-2 ring-main-accent/20'
            />
            {/* Badge de Rating */}
            <div className='absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-main-accent text-lg font-bold text-black shadow-lg'>
              {rating}
            </div>
          </div>

          {/* Informações da Música */}
          <div className='flex flex-col justify-between py-1'>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-bold leading-tight text-light-primary transition-colors hover:text-main-accent dark:text-white'>
                  {track.name}
                </h3>
                {track.isIndependent && (
                  <span className='flex-shrink-0 whitespace-nowrap rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400'>
                    Indie
                  </span>
                )}
              </div>
              {track.artistId ? (
                <span
                  onClick={(e) => navigateToArtist(e, track.artistId)}
                  className='mt-1 block cursor-pointer text-sm text-gray-400 transition-colors hover:text-main-accent hover:underline'
                >
                  {track.artist}
                </span>
              ) : (
                <p className='mt-1 text-sm text-gray-400'>{track.artist}</p>
              )}
              <p className='mt-0.5 text-xs text-gray-500'>{track.album}</p>
            </div>

            {/* Estrelas de Rating + Player */}
            <div className='mt-2 flex items-center gap-3'>
              <div className='flex gap-1'>
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

              {/* Botão de Play (se tiver preview) */}
              {track.previewUrl && (
                <button
                  onClick={togglePlay}
                  className='flex items-center gap-1 rounded-full bg-main-accent/20 px-2 py-1 transition-colors hover:bg-main-accent/30'
                  title='Ouvir preview'
                >
                  <HeroIcon
                    iconName={isPlaying ? 'PauseIcon' : 'PlayIcon'}
                    className='h-4 w-4 text-main-accent'
                    solid
                  />
                  <span className='text-xs font-bold text-main-accent'>
                    {track.duration}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Elemento de Áudio (Invisível) */}
          {track.previewUrl && (
            <audio
              ref={audioRef}
              src={track.previewUrl}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      </article>
    );
  }

  // Fallback: se chegou aqui, algo deu errado
  return null;
}
