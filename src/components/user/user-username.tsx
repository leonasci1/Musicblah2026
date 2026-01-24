import Link from 'next/link';
import cn from 'clsx';

type UserUsernameProps = {
  username: string;
  className?: string;
  disableLink?: boolean;
};

export function UserUsername({
  username,
  className,
  disableLink
}: UserUsernameProps): JSX.Element {
  const content = (
    <span className='text-light-secondary dark:text-dark-secondary'>
      @{username}
    </span>
  );

  if (disableLink) {
    return <div className={cn('truncate', className)}>{content}</div>;
  }

  return (
    <Link href={`/user/${username}`}>
      <a
        className={cn('truncate transition-colors hover:underline', className)}
      >
        {content}
      </a>
    </Link>
  );
}
