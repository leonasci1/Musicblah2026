import { useState } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import type { SpotifyAlbum } from '@lib/types/artist';

type ArtistDiscographyProps = {
  albums: SpotifyAlbum[];
  artistName: string;
};

export function ArtistDiscography({
  albums,
  artistName
}: ArtistDiscographyProps): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  const displayedAlbums = showAll ? albums : albums.slice(0, 6);

  const getAlbumTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      album: 'Álbum',
      single: 'Single',
      ep: 'EP',
      compilation: 'Coletânea'
    };
    return labels[type] || type;
  };

  const formatDate = (date: string): string => {
    const year = date.split('-')[0];
    return year;
  };

  return (
    <section className='border-t border-light-border px-4 py-4 dark:border-dark-border'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-bold text-light-primary dark:text-dark-primary'>
          Discografia
        </h2>
        {albums.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className='text-sm text-main-accent hover:underline'
          >
            {showAll ? 'Ver menos' : `Ver todos (${albums.length})`}
          </button>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
        {displayedAlbums.map((album) => (
          <div
            key={album.id}
            className='group cursor-pointer rounded-lg p-2 transition-colors hover:bg-main-sidebar-background'
          >
            <div className='relative mb-2 aspect-square overflow-hidden rounded-lg'>
              {album.image ? (
                <img
                  src={album.image}
                  alt={album.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-main-sidebar-background'>
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='h-12 w-12 text-light-secondary'
                  />
                </div>
              )}

              {/* Play button overlay */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <div className='rounded-full bg-main-accent p-3'>
                  <HeroIcon
                    iconName='PlayIcon'
                    className='h-6 w-6 text-white'
                    solid
                  />
                </div>
              </div>
            </div>

            <h3 className='line-clamp-1 text-sm font-semibold text-light-primary dark:text-dark-primary'>
              {album.name}
            </h3>
            <p className='text-xs text-light-secondary dark:text-dark-secondary'>
              {formatDate(album.releaseDate)} •{' '}
              {getAlbumTypeLabel(album.albumType)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
