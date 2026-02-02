import Link from 'next/link';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import { useFollowedArtists } from '@lib/hooks/useFollowedArtists';
import { getAffinityEmoji, getAffinityLabel } from '@lib/types/artist';
import { ProtectedLayout, HomeLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import type { ReactElement, ReactNode } from 'react';

export default function ArtistsPage(): JSX.Element {
  const { artists, isLoading } = useFollowedArtists();

  return (
    <MainContainer>
      <SEO title='Seus Artistas / MusicBlah' />

      <MainHeader title='Seus Artistas' />

      {isLoading ? (
        <Loading className='mt-5' />
      ) : artists.length === 0 ? (
        <div className='flex flex-col items-center justify-center px-8 py-16 text-center'>
          <div className='mb-4 rounded-full bg-main-accent/10 p-6'>
            <HeroIcon
              iconName='MusicalNoteIcon'
              className='h-12 w-12 text-main-accent'
            />
          </div>
          <h2 className='mb-2 text-xl font-bold text-light-primary dark:text-dark-primary'>
            Nenhum artista seguido
          </h2>
          <p className='mb-4 max-w-sm text-light-secondary dark:text-dark-secondary'>
            Siga artistas para acompanhar seus lançamentos e ver o que a
            comunidade está falando sobre eles.
          </p>
          <Link href='/explore'>
            <a className='rounded-full bg-main-accent px-6 py-2 font-bold text-white transition hover:bg-main-accent/90'>
              Explorar Música
            </a>
          </Link>
        </div>
      ) : (
        <div className='flex flex-col'>
          {/* Stats header */}
          <div className='border-b border-light-border px-4 py-3 dark:border-dark-border'>
            <p className='text-sm text-light-secondary dark:text-dark-secondary'>
              Você segue{' '}
              <span className='font-bold text-main-accent'>
                {artists.length}
              </span>{' '}
              artistas
            </p>
          </div>

          {/* Artists list */}
          <div className='divide-y divide-light-border dark:divide-dark-border'>
            {artists.map((artist) => (
              <Link key={artist.docId} href={`/artist/${artist.artistId}`}>
                <a className='flex items-center gap-4 p-4 transition-colors hover:bg-main-sidebar-background'>
                  {/* Avatar */}
                  <div className='relative'>
                    {artist.artistImage ? (
                      <img
                        src={artist.artistImage}
                        alt={artist.artistName}
                        className='h-14 w-14 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-main-sidebar-background'>
                        <HeroIcon
                          iconName='MusicalNoteIcon'
                          className='h-6 w-6 text-main-accent'
                        />
                      </div>
                    )}

                    {/* Notification badge */}
                    {artist.notifications && (
                      <div className='absolute -right-1 -top-1 rounded-full bg-main-accent p-1'>
                        <HeroIcon
                          iconName='BellIcon'
                          className='h-3 w-3 text-white'
                          solid
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='truncate font-bold text-light-primary dark:text-dark-primary'>
                        {artist.artistName}
                      </h3>
                      <span
                        className='text-lg'
                        title={getAffinityLabel(artist.affinityLevel)}
                      >
                        {getAffinityEmoji(artist.affinityLevel)}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary'>
                      <span>{artist.reviewsCount} avaliações</span>
                      {artist.averageRating > 0 && (
                        <>
                          <span>•</span>
                          <span className='text-main-accent'>
                            {artist.averageRating.toFixed(1)} ⭐
                          </span>
                        </>
                      )}
                    </div>

                    {/* Genres */}
                    {artist.genres.length > 0 && (
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {artist.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className='rounded-full bg-main-accent/10 px-2 py-0.5 text-xs text-main-accent'
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <HeroIcon
                    iconName='ChevronRightIcon'
                    className='h-5 w-5 text-light-secondary dark:text-dark-secondary'
                  />
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </MainContainer>
  );
}

ArtistsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
