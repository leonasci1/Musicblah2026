import Link from 'next/link';
import cn from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeroIcon } from '@components/ui/hero-icon';
import { UserAvatar } from '@components/user/user-avatar';
import { markNotificationAsRead } from '@lib/firebase/notifications';
import type { Notification as NotificationType } from '@lib/types/notification';
import type { IconName } from '@components/ui/hero-icon';

type NotificationCardProps = {
  notification: NotificationType;
  userId: string;
};

const notificationConfig: Record<
  NotificationType['type'],
  { icon: IconName; color: string; text: string }
> = {
  like: {
    icon: 'HeartIcon',
    color: 'text-pink-500',
    text: 'curtiu seu post'
  },
  retweet: {
    icon: 'ArrowPathRoundedSquareIcon',
    color: 'text-green-500',
    text: 'repostou seu post'
  },
  reply: {
    icon: 'ChatBubbleLeftIcon',
    color: 'text-blue-500',
    text: 'respondeu seu post'
  },
  follow: {
    icon: 'UserPlusIcon',
    color: 'text-main-accent',
    text: 'começou a te seguir'
  },
  mention: {
    icon: 'AtSymbolIcon',
    color: 'text-yellow-500',
    text: 'mencionou você'
  },
  review: {
    icon: 'MusicalNoteIcon',
    color: 'text-purple-500',
    text: 'também avaliou esta música'
  }
};

export function NotificationCard({
  notification,
  userId
}: NotificationCardProps): JSX.Element {
  const {
    id,
    type,
    fromUserName,
    fromUserUsername,
    fromUserPhoto,
    tweetId,
    tweetText,
    read,
    createdAt
  } = notification;

  const config = notificationConfig[type];

  const handleClick = (): void => {
    if (!read) {
      void markNotificationAsRead(userId, id);
    }
  };

  const timeAgo = createdAt?.toDate
    ? formatDistanceToNowStrict(createdAt.toDate(), {
        locale: ptBR,
        addSuffix: false
      })
    : '';

  const href =
    type === 'follow'
      ? `/user/${fromUserUsername}`
      : tweetId
      ? `/tweet/${tweetId}`
      : '#';

  return (
    <Link href={href}>
      <a
        onClick={handleClick}
        className={cn(
          'flex gap-3 border-b border-light-border px-4 py-3 transition-colors',
          'hover:bg-light-primary/5 dark:border-dark-border dark:hover:bg-dark-primary/5',
          !read && 'bg-main-accent/5'
        )}
      >
        {/* Ícone da notificação */}
        <div className='flex flex-col items-center'>
          <div
            className={cn('rounded-full p-2', config.color, 'bg-current/10')}
          >
            <HeroIcon
              iconName={config.icon}
              solid
              className={cn('h-5 w-5', config.color)}
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <UserAvatar
              src={fromUserPhoto}
              alt={fromUserName}
              username={fromUserUsername}
              className='h-8 w-8'
            />
            {!read && <span className='h-2 w-2 rounded-full bg-main-accent' />}
          </div>

          <p className='mt-1 text-light-primary dark:text-dark-primary'>
            <span className='font-bold'>{fromUserName}</span>{' '}
            <span className='text-light-secondary dark:text-dark-secondary'>
              {config.text}
            </span>
          </p>

          {tweetText && (
            <p className='line-clamp-2 mt-1 text-sm text-light-secondary dark:text-dark-secondary'>
              {tweetText}
            </p>
          )}

          <p className='mt-1 text-xs text-light-secondary dark:text-dark-secondary'>
            {timeAgo}
          </p>
        </div>
      </a>
    </Link>
  );
}
