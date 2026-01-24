import Link from 'next/link';
import cn from 'clsx';
import { HeroIcon } from '@components/ui/hero-icon';

type UserNameProps = {
  name: string;
  username?: string;
  verified?: boolean;
  className?: string;
  iconClassName?: string;
  disableLink?: boolean; // ✨ Nova prop
};

export function UserName({
  name,
  username,
  verified,
  className,
  iconClassName,
  disableLink
}: UserNameProps): JSX.Element {
  const content = (
    <>
      <span className='truncate'>{name}</span>
      {verified && (
        <HeroIcon
          className={cn('h-5 w-5 text-main-accent', iconClassName)}
          iconName='CheckBadgeIcon'
          solid
        />
      )}
    </>
  );

  // Se não tiver username OU disableLink for true, vira texto comum
  if (!username || disableLink) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 truncate font-bold text-light-primary dark:text-dark-primary',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={`/user/${username}`}>
      <a
        className={cn(
          'flex items-center gap-1 truncate font-bold text-light-primary decoration-2 underline-offset-2 hover:underline dark:text-dark-primary',
          className
        )}
      >
        {content}
      </a>
    </Link>
  );
}
