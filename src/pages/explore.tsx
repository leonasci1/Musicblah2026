import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'clsx';
import { exploreData } from '@lib/data/explore-data';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { HeroIcon } from '@components/ui/hero-icon';
import { UserAvatar } from '@components/user/user-avatar';
import { Loading } from '@components/ui/loading';
import type { ReactElement, ReactNode } from 'react';
import type { Genre } from '@lib/data/explore-data';

// Tipo para os dados que vêm da API
type SpotifyArtist = {
  id: string;
  name: string;
  username: string;
  listeners: string;
  image: string;
  popularity: number;
};

export default function Explore(): JSX.Element {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBack = (): void => {
    setSelectedGenre(null);
    setArtists([]);
  };

  // Busca os dados quando um gênero é selecionado
  useEffect(() => {
    if (!selectedGenre) return;

    const fetchArtists = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/spotify/explore?genre=${selectedGenre.id}`
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setArtists(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchArtists();
  }, [selectedGenre]);

  return (
    <MainContainer>
      <SEO title='Explore / MusicBlah' />

      <MainHeader
        useMobileSidebar
        title={selectedGenre ? selectedGenre.name : 'Explore'}
        className='flex items-center gap-4'
      >
        {selectedGenre && (
          <button
            onClick={handleBack}
            className='custom-button p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10'
          >
            <HeroIcon iconName='ArrowLeftIcon' className='h-5 w-5' />
          </button>
        )}
      </MainHeader>

      <section className='mt-0.5 min-h-screen pb-20 xs:mt-0'>
        <AnimatePresence mode='wait'>
          {!selectedGenre ? (
            // VIEW 1: GRID DE GÊNEROS (Novo Design)
            <motion.div
              key='grid'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2'
            >
              {exploreData.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre)}
                  className={cn(
                    `group relative flex h-48 w-full flex-col overflow-hidden rounded-2xl text-left shadow-md
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95`
                  )}
                >
                  {/* Imagem de Fundo com efeito de zoom no hover */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={genre.imageUrl}
                    alt={genre.name}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />

                  {/* Overlay Escuro e Texto */}
                  <div className='absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6'>
                    <h3 className='text-2xl font-bold text-white drop-shadow-md'>
                      {genre.name}
                    </h3>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            // VIEW 2: LISTA DE ARTISTAS (Mantida a estrutura anterior)
            <motion.div
              key='list'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Genre Banner - Agora usa a imagem do gênero também */}
              <div className='relative mb-4 h-40 w-full overflow-hidden'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedGenre.imageUrl}
                  alt={selectedGenre.name}
                  className='absolute inset-0 h-full w-full object-cover'
                />
                <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent p-6'>
                  <h2 className='mb-1 text-3xl font-bold text-white'>
                    {selectedGenre.name}
                  </h2>
                  <p className='font-medium text-white/80'>
                    Trending Artists on Spotify
                  </p>
                </div>
              </div>

              {loading ? (
                <Loading className='mt-10' />
              ) : (
                <div className='flex flex-col'>
                  {artists.map((artist, index) => (
                    <Link href={`/user/${artist.id}`} key={artist.id}>
                      <a className='hover-animation flex items-center gap-4 border-b border-light-border px-4 py-3 hover:bg-light-primary/5 dark:border-dark-border dark:hover:bg-dark-primary/5'>
                        <span className='w-4 text-center font-bold text-light-secondary dark:text-dark-secondary'>
                          {index + 1}
                        </span>
                        <UserAvatar
                          src={artist.image}
                          alt={artist.name}
                          size={50}
                          username={artist.name}
                          disableLink
                        />
                        <div className='flex min-w-0 flex-col'>
                          <div className='flex items-center gap-1'>
                            <span className='truncate font-bold text-light-primary dark:text-dark-primary'>
                              {artist.name}
                            </span>
                            {artist.popularity > 80 && (
                              <HeroIcon
                                iconName='CheckBadgeIcon'
                                className='h-4 w-4 shrink-0 text-main-accent'
                                solid
                              />
                            )}
                          </div>
                          <span className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
                            {artist.listeners} followers
                          </span>
                        </div>

                        <button className='ml-auto shrink-0 rounded-full border border-light-line-reply px-4 py-1.5 font-bold text-main-accent hover:bg-main-accent/10 dark:border-light-secondary'>
                          View
                        </button>
                      </a>
                    </Link>
                  ))}

                  {artists.length === 0 && (
                    <div className='p-8 text-center text-light-secondary dark:text-dark-secondary'>
                      No artists found for this genre.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MainContainer>
  );
}

Explore.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
