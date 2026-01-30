import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { query, where, orderBy, limit } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { useCollection } from '@lib/hooks/useCollection';
import { useAuth } from '@lib/context/auth-context';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { SearchBar } from '@components/aside/search-bar';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactElement, ReactNode } from 'react';

// Tipo completo com dados do Spotify
type SpotifyRecommendation = {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
  url: string;
  reason: string;
};

export default function Explore(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'recent'>(
    'forYou'
  );
  const [recommendations, setRecommendations] = useState<
    SpotifyRecommendation[]
  >([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback'>('fallback');
  const [aiMessage, setAiMessage] = useState<string>('');

  // Estado para player de música
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user } = useAuth();

  // Query para reviews do usuário (para IA) - sem usuário anexado
  const { data: userReviews } = useCollection(
    query(
      tweetsCollection,
      where('type', '==', 'review'),
      where('createdBy', '==', user?.id ?? ''),
      orderBy('createdAt', 'desc'),
      limit(10)
    ),
    { allowNull: true, disabled: !user?.id }
  );

  // Query para reviews (com usuário anexado)
  const { data: allReviews, loading: loadingReviews } = useInfiniteScroll(
    tweetsCollection,
    [where('type', '==', 'review'), orderBy('createdAt', 'desc')],
    { includeUser: true, allowNull: true }
  );

  // Ordenar trending por número de likes
  const sortedTrending = allReviews
    ?.slice()
    .sort((a, b) => (b.userLikes?.length || 0) - (a.userLikes?.length || 0))
    .slice(0, 10);

  // Reviews recentes (já ordenado por createdAt)
  const recentReviews = allReviews?.slice(0, 20);

  // Player de música
  const handlePlay = (track: SpotifyRecommendation): void => {
    if (!track.previewUrl) return;

    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(track.previewUrl);
    audio.volume = 0.4;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    audio.play().catch(() => {});
    audio.onended = (): void => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(track.id);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Buscar recomendações da IA
  const fetchRecommendations = async (): Promise<void> => {
    setLoadingAI(true);
    setAiError(null);

    try {
      // Enviar reviews se houver, senão API retorna genéricas
      const res = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userReviews: userReviews ?? [] })
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.error) {
        setAiError(data.error as string);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setRecommendations(
          (data.recommendations as SpotifyRecommendation[]) || []
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setAiSource(data.source || 'fallback');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setAiMessage(data.message || '');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching recommendations:', error);
      setAiError('Erro ao buscar recomendações');
    } finally {
      setLoadingAI(false);
    }
  };

  // Buscar recomendações quando trocar para aba "Para Você"
  useEffect(() => {
    if (activeTab === 'forYou' && recommendations.length === 0 && !loadingAI)
      void fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const tabs = [
    { id: 'forYou', label: 'Para Você', icon: 'SparklesIcon' },
    { id: 'trending', label: 'Em Alta', icon: 'FireIcon' },
    { id: 'recent', label: 'Recentes', icon: 'ClockIcon' }
  ] as const;

  return (
    <MainContainer>
      <SEO title='Explorar / MusicBlah' />

      <MainHeader useMobileSidebar title='Explorar' />

      <section className='mt-0.5 min-h-screen pb-20'>
        {/* Barra de Busca */}
        <div className='border-b border-light-border p-4 dark:border-dark-border'>
          <SearchBar />
        </div>

        {/* Tabs */}
        <div className='flex border-b border-light-border dark:border-dark-border'>
          {tabs.map((tab) => (
            <button
              type='button'
              key={tab.id}
              onClick={(): void => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center text-sm font-bold transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-b-2 border-main-accent text-main-accent'
                    : 'text-light-secondary hover:bg-light-primary/10 dark:text-dark-secondary dark:hover:bg-dark-primary/10'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB: Para Você (IA) */}
          {activeTab === 'forYou' && (
            <div>
              <div className='flex items-center gap-2 border-b border-light-border p-4 dark:border-dark-border'>
                <HeroIcon
                  iconName='SparklesIcon'
                  className='h-5 w-5 text-purple-500'
                />
                <div>
                  <h2 className='font-bold text-light-primary dark:text-dark-primary'>
                    Recomendado para Você
                  </h2>
                  <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                    IA analisa suas avaliações e sugere músicas
                  </p>
                </div>
              </div>

              {loadingAI ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loading className='mb-4' />
                  <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                    Analisando seu gosto musical...
                  </p>
                </div>
              ) : aiError ? (
                <div className='p-8 text-center'>
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='mx-auto mb-4 h-16 w-16 text-light-secondary dark:text-dark-secondary'
                  />
                  <h3 className='mb-2 text-xl font-bold text-light-primary dark:text-dark-primary'>
                    {aiError}
                  </h3>
                  <p className='text-light-secondary dark:text-dark-secondary'>
                    Avalie algumas músicas e volte aqui para recomendações
                    personalizadas!
                  </p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className='divide-y divide-light-border dark:divide-dark-border'>
                  {/* Status da IA */}
                  <div
                    className={`border-b border-light-border px-4 py-3 dark:border-dark-border ${
                      aiSource === 'gemini'
                        ? 'bg-green-500/10'
                        : 'bg-main-accent/5'
                    }`}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      {aiSource === 'gemini' ? (
                        <HeroIcon
                          iconName='SparklesIcon'
                          className='h-4 w-4 text-green-500'
                        />
                      ) : (
                        <HeroIcon
                          iconName='MusicalNoteIcon'
                          className='h-4 w-4 text-main-accent'
                        />
                      )}
                      <p className='text-center text-sm text-light-secondary dark:text-dark-secondary'>
                        {aiMessage ||
                          (aiSource === 'gemini'
                            ? 'Recomendações da IA baseadas nas suas reviews!'
                            : 'Avalie músicas para ter sugestões personalizadas.')}
                      </p>
                    </div>
                  </div>
                  {recommendations.map((track) => (
                    <div
                      key={track.id}
                      className='group flex items-center gap-3 p-3 transition-colors hover:bg-light-primary/5 dark:hover:bg-dark-primary/5'
                    >
                      {/* Capa com botão de play */}
                      <div
                        className='relative h-14 w-14 flex-shrink-0 cursor-pointer'
                        onClick={(): void => handlePlay(track)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.image}
                          alt={track.name}
                          className={`h-full w-full rounded-lg object-cover shadow-md transition-all duration-300
                            ${
                              playingId === track.id
                                ? 'brightness-50'
                                : 'group-hover:brightness-75'
                            }`}
                        />
                        {/* Ícone de play/pause */}
                        {track.previewUrl && (
                          <div
                            className={`absolute inset-0 flex items-center justify-center text-white
                              ${
                                playingId === track.id
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover:opacity-100'
                              }`}
                          >
                            <HeroIcon
                              iconName={
                                playingId === track.id
                                  ? 'PauseIcon'
                                  : 'PlayIcon'
                              }
                              className='h-6 w-6 drop-shadow-lg'
                            />
                          </div>
                        )}
                      </div>

                      {/* Info da música */}
                      <div className='min-w-0 flex-1'>
                        <a
                          href={track.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <p
                            className={`truncate text-sm font-bold transition-colors
                            ${
                              playingId === track.id
                                ? 'text-[#1DB954]'
                                : 'text-light-primary hover:text-main-accent dark:text-dark-primary'
                            }`}
                          >
                            {track.name}
                          </p>
                          <p className='truncate text-xs text-light-secondary dark:text-dark-secondary'>
                            {track.artist}
                          </p>
                        </a>
                        <p className='mt-0.5 truncate text-xs italic text-light-secondary dark:text-dark-secondary'>
                          {track.reason}
                        </p>
                      </div>

                      {/* Indicador tocando */}
                      {playingId === track.id && (
                        <span className='animate-pulse text-xs font-semibold text-[#1DB954]'>
                          ▶
                        </span>
                      )}

                      {/* Duração */}
                      <span className='text-xs text-light-secondary dark:text-dark-secondary'>
                        {track.duration}
                      </span>
                    </div>
                  ))}
                  <div className='border-t border-light-border p-4 text-center dark:border-dark-border'>
                    <button
                      type='button'
                      onClick={(): void => {
                        setRecommendations([]);
                        void fetchRecommendations();
                      }}
                      disabled={loadingAI}
                      className='rounded-full bg-main-accent px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-90 disabled:opacity-50'
                    >
                      {loadingAI ? 'Buscando...' : 'Novas Recomendações'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB: Em Alta */}
          {activeTab === 'trending' && (
            <div>
              <div className='flex items-center gap-2 border-b border-light-border p-4 dark:border-dark-border'>
                <HeroIcon
                  iconName='FireIcon'
                  className='h-5 w-5 text-orange-500'
                />
                <div>
                  <h2 className='font-bold text-light-primary dark:text-dark-primary'>
                    Reviews em Destaque
                  </h2>
                  <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                    As avaliações mais curtidas da comunidade
                  </p>
                </div>
              </div>

              {loadingReviews ? (
                <Loading className='mt-10' />
              ) : sortedTrending && sortedTrending.length > 0 ? (
                <div>
                  {sortedTrending.map((tweet) => (
                    <Tweet key={tweet.id} {...tweet} />
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='mx-auto mb-4 h-16 w-16 text-light-secondary dark:text-dark-secondary'
                  />
                  <h3 className='mb-2 text-xl font-bold text-light-primary dark:text-dark-primary'>
                    Nenhuma review ainda
                  </h3>
                  <p className='text-light-secondary dark:text-dark-secondary'>
                    Seja o primeiro a avaliar uma música ou álbum!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Recentes */}
          {activeTab === 'recent' && (
            <div>
              <div className='flex items-center gap-2 border-b border-light-border p-4 dark:border-dark-border'>
                <HeroIcon
                  iconName='ClockIcon'
                  className='h-5 w-5 text-blue-500'
                />
                <div>
                  <h2 className='font-bold text-light-primary dark:text-dark-primary'>
                    Descobertas Recentes
                  </h2>
                  <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                    O que a comunidade está ouvindo agora
                  </p>
                </div>
              </div>

              {loadingReviews ? (
                <Loading className='mt-10' />
              ) : recentReviews && recentReviews.length > 0 ? (
                <div>
                  {recentReviews.map((tweet) => (
                    <Tweet key={tweet.id} {...tweet} />
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='mx-auto mb-4 h-16 w-16 text-light-secondary dark:text-dark-secondary'
                  />
                  <h3 className='mb-2 text-xl font-bold text-light-primary dark:text-dark-primary'>
                    Nenhuma review ainda
                  </h3>
                  <p className='text-light-secondary dark:text-dark-secondary'>
                    Seja o primeiro a avaliar uma música ou álbum!
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
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
