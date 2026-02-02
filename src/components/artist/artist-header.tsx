import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { ToolTip } from '@components/ui/tooltip';
import { useFollowArtist } from '@lib/hooks/useFollowArtist';
import { getAffinityEmoji, getAffinityLabel } from '@lib/types/artist';
import type { SpotifyArtist } from '@lib/types/artist';

type ArtistHeaderProps = {
  artist: SpotifyArtist;
};

export function ArtistHeader({ artist }: ArtistHeaderProps): JSX.Element {
  const {
    isFollowing,
    isLoading,
    followData,
    follow,
    unfollow,
    toggleNotifications
  } = useFollowArtist(artist.id);

  const handleFollow = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow(artist);
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div className='relative'>
      {/* Banner gradient */}
      <div
        className='h-36 bg-gradient-to-br from-main-accent/50 to-main-accent/20'
        style={{
          backgroundImage: artist.image
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${artist.image})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className='px-4 pb-4'>
        {/* Avatar */}
        <div className='-mt-16 mb-3 flex items-end justify-between'>
          <div className='relative'>
            {artist.image ? (
              <img
                src={artist.image}
                alt={artist.name}
                className='h-32 w-32 rounded-full border-4 border-main-background object-cover'
              />
            ) : (
              <div className='flex h-32 w-32 items-center justify-center rounded-full border-4 border-main-background bg-main-sidebar-background'>
                <HeroIcon
                  iconName='MusicalNoteIcon'
                  className='h-16 w-16 text-main-accent'
                />
              </div>
            )}

            {/* Badge de verificado (popular) */}
            {artist.popularity >= 70 && (
              <div className='absolute bottom-0 right-0 rounded-full bg-main-accent p-1'>
                <HeroIcon
                  iconName='CheckBadgeIcon'
                  className='h-6 w-6 text-white'
                  solid
                />
              </div>
            )}
          </div>

          {/* Botões */}
          <div className='flex items-center gap-2'>
            {/* Notificações (só aparece se estiver seguindo) */}
            {isFollowing && (
              <ToolTip
                tip={
                  followData?.notifications
                    ? 'Desativar alertas'
                    : 'Ativar alertas'
                }
              >
                <Button
                  className='dark-bg-tab group relative p-2 hover:bg-main-accent/10'
                  onClick={toggleNotifications}
                >
                  <HeroIcon
                    iconName={
                      followData?.notifications ? 'BellIcon' : 'BellSlashIcon'
                    }
                    className='h-5 w-5 text-light-primary dark:text-dark-primary'
                    solid={followData?.notifications}
                  />
                </Button>
              </ToolTip>
            )}

            {/* Spotify */}
            <ToolTip tip='Abrir no Spotify'>
              <a
                href={artist.spotifyUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='dark-bg-tab flex items-center justify-center rounded-full p-2 hover:bg-main-accent/10'
              >
                <svg
                  className='h-5 w-5 text-[#1DB954]'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' />
                </svg>
              </a>
            </ToolTip>

            {/* Seguir */}
            <Button
              className={`min-w-[100px] self-start border px-4 py-1.5 font-bold transition-colors ${
                isFollowing
                  ? 'border-light-line-reply hover:border-accent-red hover:bg-accent-red/10 hover:text-accent-red dark:border-light-secondary'
                  : 'border-main-accent bg-main-accent text-white hover:bg-main-accent/90'
              }`}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center gap-1'>
                  <HeroIcon
                    iconName='ArrowPathIcon'
                    className='h-4 w-4 animate-spin'
                  />
                </span>
              ) : isFollowing ? (
                <span className='group-hover:hidden'>Seguindo</span>
              ) : (
                'Seguir'
              )}
            </Button>
          </div>
        </div>

        {/* Nome e info */}
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-bold text-light-primary dark:text-dark-primary'>
            {artist.name}
          </h1>

          {/* Stats */}
          <div className='flex flex-wrap items-center gap-3 text-sm text-light-secondary dark:text-dark-secondary'>
            <span className='flex items-center gap-1'>
              <HeroIcon iconName='UsersIcon' className='h-4 w-4' />
              {formatFollowers(artist.followersCount)} seguidores
            </span>

            <span className='flex items-center gap-1'>
              <HeroIcon iconName='ChartBarIcon' className='h-4 w-4' />
              {artist.popularity}% popularidade
            </span>
          </div>

          {/* Gêneros */}
          {artist.genres.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {artist.genres.slice(0, 5).map((genre) => (
                <span
                  key={genre}
                  className='rounded-full bg-main-accent/10 px-3 py-1 text-xs font-medium text-main-accent'
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Card de afinidade (se estiver seguindo) */}
          {isFollowing && followData && (
            <div className='mt-4 rounded-xl border border-light-border p-4 dark:border-dark-border'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>
                    {getAffinityEmoji(followData.affinityLevel)}
                  </span>
                  <div>
                    <p className='text-sm font-bold text-light-primary dark:text-dark-primary'>
                      {getAffinityLabel(followData.affinityLevel)}
                    </p>
                    <p className='text-xs text-light-secondary dark:text-dark-secondary'>
                      {followData.reviewsCount} avaliações
                    </p>
                  </div>
                </div>

                {followData.reviewsCount > 0 && (
                  <div className='text-right'>
                    <p className='text-lg font-bold text-main-accent'>
                      {followData.averageRating.toFixed(1)} ⭐
                    </p>
                    <p className='text-xs text-light-secondary dark:text-dark-secondary'>
                      sua média
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
