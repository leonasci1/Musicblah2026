import Link from 'next/link';
import cn from 'clsx';
import { formatDate } from '@lib/date';
import { ToolTip } from '@components/ui/tooltip';
import type { Tweet } from '@lib/types/tweet';

type TweetDateProps = Pick<Tweet, 'createdAt'> & {
  tweetLink: string;
  viewTweet?: boolean;
  disableLink?: boolean;
};

export function TweetDate({
  createdAt,
  tweetLink,
  viewTweet,
  disableLink
}: TweetDateProps): JSX.Element {
  const dateText = formatDate(createdAt, viewTweet ? 'full' : 'tweet');

  const dateClasses = cn(
    'custom-underline peer whitespace-nowrap',
    viewTweet && 'text-light-secondary dark:text-dark-secondary'
  );

  return (
    <div className={cn('flex gap-1', viewTweet && 'py-4')}>
      {!viewTweet && <i>·</i>}
      <div className='group relative'>
        {disableLink ? (
          <span className={dateClasses}>{dateText}</span>
        ) : (
          <Link href={tweetLink}>
            <a className={dateClasses}>{dateText}</a>
          </Link>
        )}
        <ToolTip
          className='translate-y-1 peer-focus:opacity-100 peer-focus-visible:visible
                     peer-focus-visible:delay-200'
          tip={formatDate(createdAt, 'full')}
        />
      </div>
    </div>
  );
}
