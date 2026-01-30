import { useState, useEffect } from 'react';
import { query, where, orderBy, limit } from 'firebase/firestore';
import { useCollection } from '@lib/hooks/useCollection';
import { tweetsCollection } from '@lib/firebase/collections';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import type { IconName } from '@components/ui/hero-icon';

type UserMusicStatsProps = {
  userId: string;
};

type ReviewData = {
  artistName?: string;
  trackName?: string;
  albumName?: string;
  rating?: number;
  track?: {
    name?: string;
    artist?: string;
  };
  album?: {
    name?: string;
    artist?: string;
  };
};

type Badge = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  description: string;
};

type Genre = { name: string; count: number };

// Função para calcular badges baseado nas estatísticas
function calculateBadges(
  reviews: unknown[],
  avgRating: number | null,
  topArtists: [string, number][],
  artistCount: number,
  genres: Genre[]
): Badge[] {
  const badges: Badge[] = [];

  // Badge por quantidade de reviews
  if (reviews.length >= 50) {
    badges.push({
      id: 'expert',
      name: 'Expert Musical',
      icon: 'AcademicCapIcon',
      color: 'bg-yellow-500',
      description: '50+ reviews'
    });
  } else if (reviews.length >= 20) {
    badges.push({
      id: 'melomano',
      name: 'Melômano',
      icon: 'MusicalNoteIcon',
      color: 'bg-purple-500',
      description: '20+ reviews'
    });
  } else if (reviews.length >= 5) {
    badges.push({
      id: 'descobridor',
      name: 'Descobridor',
      icon: 'MagnifyingGlassIcon',
      color: 'bg-blue-500',
      description: '5+ reviews'
    });
  }

  // Badge por nota média
  if (avgRating !== null) {
    if (avgRating <= 2.5) {
      badges.push({
        id: 'critico',
        name: 'Crítico Exigente',
        icon: 'HandThumbDownIcon',
        color: 'bg-red-500',
        description: 'Nota média baixa'
      });
    } else if (avgRating >= 4.5) {
      badges.push({
        id: 'entusiasta',
        name: 'Entusiasta',
        icon: 'HeartIcon',
        color: 'bg-pink-500',
        description: 'Ama quase tudo!'
      });
    } else if (avgRating >= 3.5 && avgRating < 4.5) {
      badges.push({
        id: 'equilibrado',
        name: 'Ouvido Apurado',
        icon: 'ScaleIcon',
        color: 'bg-green-500',
        description: 'Avaliações equilibradas'
      });
    }
  }

  // Badge por diversidade
  if (artistCount >= 10) {
    badges.push({
      id: 'ecletico',
      name: 'Eclético',
      icon: 'GlobeAltIcon',
      color: 'bg-cyan-500',
      description: '10+ artistas diferentes'
    });
  }

  // Badge de super fã (avaliou muito um artista)
  if (topArtists.length > 0 && topArtists[0][1] >= 5) {
    badges.push({
      id: 'superfa',
      name: `Fã de ${topArtists[0][0]}`,
      icon: 'StarIcon',
      color: 'bg-orange-500',
      description: `5+ reviews de ${topArtists[0][0]}`
    });
  }

  // Badges de gênero baseado nos gêneros mais ouvidos
  if (genres.length > 0) {
    const topGenre = genres[0].name.toLowerCase();

    // Mapeamento de gêneros para badges
    const genreBadges: Record<
      string,
      { name: string; icon: IconName; color: string }
    > = {
      pop: { name: 'Pop Star', icon: 'SparklesIcon', color: 'bg-pink-400' },
      rock: { name: 'Rockeiro', icon: 'FireIcon', color: 'bg-red-600' },
      'hip hop': {
        name: 'Hip Hop Head',
        icon: 'MicrophoneIcon',
        color: 'bg-amber-600'
      },
      rap: { name: 'Rap God', icon: 'MicrophoneIcon', color: 'bg-amber-600' },
      mpb: { name: 'MPB Roots', icon: 'HeartIcon', color: 'bg-green-600' },
      sertanejo: {
        name: 'Sertanejo',
        icon: 'HomeIcon',
        color: 'bg-yellow-600'
      },
      funk: {
        name: 'Funkeiro',
        icon: 'SpeakerWaveIcon',
        color: 'bg-purple-600'
      },
      eletronica: { name: 'Eletro', icon: 'BoltIcon', color: 'bg-cyan-400' },
      electronic: { name: 'Eletro', icon: 'BoltIcon', color: 'bg-cyan-400' },
      indie: {
        name: 'Indie Soul',
        icon: 'MusicalNoteIcon',
        color: 'bg-indigo-500'
      },
      'r&b': { name: 'R&B Lover', icon: 'HeartIcon', color: 'bg-rose-500' },
      jazz: {
        name: 'Jazzista',
        icon: 'MusicalNoteIcon',
        color: 'bg-amber-500'
      },
      classical: {
        name: 'Clássico',
        icon: 'AcademicCapIcon',
        color: 'bg-slate-500'
      },
      metal: { name: 'Metalhead', icon: 'FireIcon', color: 'bg-zinc-700' },
      reggae: { name: 'Reggae Vibes', icon: 'SunIcon', color: 'bg-green-500' },
      pagode: {
        name: 'Pagodeiro',
        icon: 'MusicalNoteIcon',
        color: 'bg-orange-500'
      },
      samba: {
        name: 'Sambista',
        icon: 'MusicalNoteIcon',
        color: 'bg-yellow-500'
      },
      trap: {
        name: 'Trap Lord',
        icon: 'SpeakerWaveIcon',
        color: 'bg-purple-700'
      },
      'k-pop': {
        name: 'K-Pop Stan',
        icon: 'SparklesIcon',
        color: 'bg-pink-500'
      },
      latin: { name: 'Latino', icon: 'SunIcon', color: 'bg-orange-400' }
    };

    // Procurar badge correspondente ao gênero principal
    for (const [genreKey, badgeInfo] of Object.entries(genreBadges)) {
      if (topGenre.includes(genreKey)) {
        badges.push({
          id: `genre-${genreKey}`,
          name: badgeInfo.name,
          icon: badgeInfo.icon,
          color: badgeInfo.color,
          description: `Curte ${genres[0].name}`
        });
        break;
      }
    }
  }

  return badges;
}

export function UserMusicStats({
  userId
}: UserMusicStatsProps): JSX.Element | null {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);

  // Buscar reviews do usuário
  const { data: reviews, loading } = useCollection(
    query(
      tweetsCollection,
      where('type', '==', 'review'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    ),
    { allowNull: true }
  );

  // Processar estatísticas (fora do useEffect para evitar problemas)
  const artistCount: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;
  const recentTracks: string[] = [];

  if (reviews && reviews.length > 0) {
    reviews.forEach((review) => {
      const data = review as unknown as ReviewData;

      // Extrair artista
      const artist =
        data.artistName || data.track?.artist || data.album?.artist;
      if (artist) {
        artistCount[artist] = (artistCount[artist] || 0) + 1;
      }

      // Calcular nota média
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
      }

      // Tracks recentes
      const trackName = data.trackName || data.track?.name;
      if (trackName && recentTracks.length < 3) {
        recentTracks.push(trackName);
      }
    });
  }

  const artistList = Object.keys(artistCount);

  // Buscar gêneros quando tiver artistas
  useEffect(() => {
    if (artistList.length === 0) return;

    const fetchGenres = async (): Promise<void> => {
      setLoadingGenres(true);
      try {
        const res = await fetch('/api/spotify/artist-genres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artists: artistList })
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        if (data.genres) setGenres(data.genres);
      } catch {
        // Ignorar erros
      } finally {
        setLoadingGenres(false);
      }
    };

    void fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistList.length]);

  if (loading) {
    return (
      <div className='border-b border-light-border p-4 dark:border-dark-border'>
        <Loading className='h-8 w-8' />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Top 5 artistas
  const topArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgRating = ratingCount > 0 ? totalRating / ratingCount : null;
  const avgRatingDisplay = avgRating ? avgRating.toFixed(1) : null;

  // Calcular badges (inclui gêneros)
  const badges = calculateBadges(
    reviews,
    avgRating,
    topArtists,
    Object.keys(artistCount).length,
    genres
  );

  return (
    <div className='border-b border-light-border dark:border-dark-border'>
      <div className='p-4'>
        <div className='mb-3 flex items-center gap-2'>
          <HeroIcon
            iconName='ChartBarIcon'
            className='h-5 w-5 text-main-accent'
          />
          <h3 className='font-bold text-light-primary dark:text-dark-primary'>
            Gosto Musical
          </h3>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className='mb-4 flex flex-wrap gap-2'>
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`group relative flex items-center gap-1.5 rounded-full ${badge.color} px-3 py-1.5 text-xs font-semibold text-white shadow-sm`}
              >
                <HeroIcon iconName={badge.icon} className='h-3.5 w-3.5' solid />
                <span>{badge.name}</span>
                {/* Tooltip */}
                <div className='absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className='mb-4 grid grid-cols-3 gap-2'>
          <div className='rounded-lg bg-main-accent/10 p-3 text-center'>
            <div className='text-2xl font-bold text-main-accent'>
              {reviews.length}
            </div>
            <div className='text-xs text-light-secondary dark:text-dark-secondary'>
              Reviews
            </div>
          </div>
          <div className='rounded-lg bg-main-accent/10 p-3 text-center'>
            <div className='text-2xl font-bold text-main-accent'>
              {Object.keys(artistCount).length}
            </div>
            <div className='text-xs text-light-secondary dark:text-dark-secondary'>
              Artistas
            </div>
          </div>
          <div className='rounded-lg bg-main-accent/10 p-3 text-center'>
            <div className='flex items-center justify-center gap-1 text-2xl font-bold text-main-accent'>
              {avgRatingDisplay || '-'}
              <HeroIcon iconName='StarIcon' className='h-4 w-4' solid />
            </div>
            <div className='text-xs text-light-secondary dark:text-dark-secondary'>
              Nota Média
            </div>
          </div>
        </div>

        {/* Top Artistas */}
        {topArtists.length > 0 && (
          <div className='mb-3'>
            <h4 className='mb-2 text-sm font-semibold text-light-secondary dark:text-dark-secondary'>
              Artistas Favoritos
            </h4>
            <div className='flex flex-wrap gap-2'>
              {topArtists.map(([artist, count], index) => (
                <div
                  key={artist}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm
                    ${
                      index === 0
                        ? 'bg-main-accent text-white'
                        : 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/10 dark:text-dark-primary'
                    }`}
                >
                  {index === 0 && (
                    <HeroIcon
                      iconName='TrophyIcon'
                      className='h-3.5 w-3.5'
                      solid
                    />
                  )}
                  <span className='font-medium'>{artist}</span>
                  <span className='opacity-60'>({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gêneros Musicais */}
        {(genres.length > 0 || loadingGenres) && (
          <div className='mb-3'>
            <h4 className='mb-2 text-sm font-semibold text-light-secondary dark:text-dark-secondary'>
              Gêneros Musicais
            </h4>
            {loadingGenres ? (
              <div className='flex items-center gap-2 text-sm text-light-secondary'>
                <Loading className='h-4 w-4' />
                <span>Analisando gêneros...</span>
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {genres.map((genre, index) => {
                  // Cores diferentes para cada gênero
                  const colors = [
                    'bg-pink-500/20 text-pink-500 border-pink-500/30',
                    'bg-blue-500/20 text-blue-500 border-blue-500/30',
                    'bg-green-500/20 text-green-500 border-green-500/30',
                    'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                    'bg-purple-500/20 text-purple-500 border-purple-500/30',
                    'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
                    'bg-orange-500/20 text-orange-500 border-orange-500/30',
                    'bg-red-500/20 text-red-500 border-red-500/30'
                  ];
                  return (
                    <div
                      key={genre.name}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                        colors[index % colors.length]
                      }`}
                    >
                      <HeroIcon iconName='HashtagIcon' className='h-3 w-3' />
                      <span>{genre.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Músicas Recentes */}
        {recentTracks.length > 0 && (
          <div>
            <h4 className='mb-2 text-sm font-semibold text-light-secondary dark:text-dark-secondary'>
              Avaliou Recentemente
            </h4>
            <div className='flex flex-col gap-1'>
              {recentTracks.map((track, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 text-sm text-light-primary dark:text-dark-primary'
                >
                  <HeroIcon
                    iconName='MusicalNoteIcon'
                    className='h-4 w-4 text-main-accent'
                  />
                  <span className='truncate'>{track}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
