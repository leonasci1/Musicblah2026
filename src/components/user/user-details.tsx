import { formatDate } from '@lib/date';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { UserName } from './user-name';
import { UserFollowing } from './user-following';
import { UserFollowStats } from './user-follow-stats';
import type { IconName } from '@components/ui/hero-icon';
import type { User } from '@lib/types/user';

type UserDetailsProps = Pick<
  User,
  | 'id'
  | 'bio'
  | 'name'
  | 'website'
  | 'username'
  | 'location'
  | 'verified'
  | 'createdAt'
  | 'following'
  | 'followers'
  | 'favoriteArtist'
  | 'musicGenres'
  | 'favoriteAlbum'
  | 'favoriteTrack'
>;

type DetailIcon = [string | null, IconName];

export function UserDetails({
  id,
  bio,
  name,
  website,
  username,
  location,
  verified,
  createdAt,
  following,
  followers,
  favoriteArtist,
  musicGenres,
  favoriteAlbum,
  favoriteTrack
}: UserDetailsProps): JSX.Element {
  const detailIcons: Readonly<DetailIcon[]> = [
    [location, 'MapPinIcon'],
    [website, 'LinkIcon'],
    [`Joined ${formatDate(createdAt, 'joined')}`, 'CalendarDaysIcon']
  ];

  return (
    <>
      <div>
        <UserName
          className='-mb-1 text-xl'
          name={name}
          iconClassName='w-6 h-6'
          verified={verified}
        />
        <div className='flex items-center gap-1 text-light-secondary dark:text-dark-secondary'>
          <p>@{username}</p>
          <UserFollowing userTargetId={id} />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {bio && <p className='whitespace-pre-line break-words'>{bio}</p>}

        {/* --- SEÇÃO DE IDENTIDADE MUSICAL --- */}
        {(favoriteArtist || musicGenres || favoriteAlbum || favoriteTrack) && (
          <div className='my-2 flex flex-col gap-2 rounded-xl border border-main-accent/10 bg-main-accent/5 p-3 text-sm'>
            {favoriteArtist && (
              <div className='flex items-center gap-2 text-light-primary dark:text-white'>
                <HeroIcon
                  iconName='StarIcon'
                  className='h-4 w-4 text-main-accent'
                  solid
                />
                <span className='font-bold opacity-80'>Favorite Artist:</span>
                <span>{favoriteArtist}</span>
              </div>
            )}
            {favoriteAlbum && (
              <div className='flex items-center gap-2 text-light-primary dark:text-white'>
                {/* Ícone customizado de Disco/Álbum */}
                <div className='flex h-4 w-4 select-none items-center justify-center rounded-full bg-main-accent text-[9px] font-bold text-white'>
                  A
                </div>
                <span className='font-bold opacity-80'>Top Album:</span>
                <span>{favoriteAlbum}</span>
              </div>
            )}
            {favoriteTrack && (
              <div className='flex items-center gap-2 text-light-primary dark:text-white'>
                <HeroIcon
                  iconName='PlayIcon'
                  className='h-4 w-4 text-main-accent'
                  solid
                />
                <span className='font-bold opacity-80'>On Repeat:</span>
                <span>{favoriteTrack}</span>
              </div>
            )}
            {musicGenres && (
              <div className='mt-1 flex items-center gap-2 text-light-primary dark:text-white'>
                <HeroIcon
                  iconName='MusicalNoteIcon'
                  className='h-4 w-4 text-main-accent'
                />
                <div className='flex flex-wrap gap-1'>
                  {musicGenres.split(',').map((genre, index) => (
                    <span
                      key={index}
                      className='rounded-full bg-main-accent/10 px-2 py-0.5 text-xs text-main-accent'
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className='flex flex-wrap gap-x-3 gap-y-1 text-light-secondary dark:text-dark-secondary'>
          {detailIcons.map(
            ([detail, icon], index) =>
              detail && (
                <div className='flex items-center gap-1' key={icon}>
                  <i>
                    <HeroIcon className='h-5 w-5' iconName={icon} />
                  </i>
                  {index === 1 ? (
                    <a
                      className='custom-underline text-main-accent'
                      href={`https://${detail}`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {detail}
                    </a>
                  ) : index === 2 ? (
                    <button className='custom-underline group relative'>
                      {detail}
                      <ToolTip
                        className='translate-y-1'
                        tip={formatDate(createdAt, 'full')}
                      />
                    </button>
                  ) : (
                    <p>{detail}</p>
                  )}
                </div>
              )
          )}
        </div>
      </div>
      <UserFollowStats following={following} followers={followers} />
    </>
  );
}
