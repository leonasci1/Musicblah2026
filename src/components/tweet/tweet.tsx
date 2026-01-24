import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import cn from 'clsx';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { delayScroll } from '@lib/utils';
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { ImagePreview } from '@components/input/image-preview';
import { UserAvatar } from '@components/user/user-avatar';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { TweetActions } from './tweet-actions';
import { TweetStatus } from './tweet-status';
import { TweetStats } from './tweet-stats';
import { TweetDate } from './tweet-date';
import { TweetReview } from './tweet-review';
import type { Variants } from 'framer-motion';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';

export type TweetProps = Tweet & {
  user: User;
  modal?: boolean;
  pinned?: boolean;
  profile?: User | null;
  parentTweet?: boolean;
};

export const variants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function Tweet(tweet: TweetProps): JSX.Element {
  const {
    id: tweetId,
    text,
    modal,
    images,
    parent,
    pinned,
    profile,
    userLikes,
    createdBy,
    createdAt,
    parentTweet,
    userReplies,
    userRetweets,
    user: tweetUserData,
    type = 'tweet',
    rating,
    album
  } = tweet;

  if (!tweetId) return <></>;

  const tweetLink = `/tweet/${tweetId}`;
  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();
  const userId = user?.id as string;
  const isOwner = userId === createdBy;

  // =====================================================================================
  //  LAYOUT DE REVIEW (MÚSICA) - CORRIGIDO PARA NÃO QUEBRAR
  // =====================================================================================
  if (type === 'review' && album && rating) {
    return (
      <motion.article
        {...(!modal ? { ...variants, layout: 'position' } : {})}
        animate={{
          ...variants.animate,
          ...(parentTweet && { transition: { duration: 0.2 } })
        }}
        className='border-b border-light-border dark:border-dark-border'
      >
        <Link href={tweetLink} scroll={!parent}>
          <a className='accent-tab hover-card relative flex flex-col gap-y-4 px-4 py-3 outline-none duration-200'>
            <div className='grid grid-cols-[auto,1fr] gap-x-3'>
              {/* Coluna do Avatar */}
              <div className='flex flex-col items-center'>
                <UserTooltip {...tweetUserData}>
                  <UserAvatar
                    src={tweetUserData.photoURL}
                    alt={tweetUserData.name}
                    username={tweetUserData.username}
                    className='h-12 w-12'
                    disableLink
                  />
                </UserTooltip>
              </div>

              {/* Coluna do Conteúdo */}
              <div className='flex min-w-0 flex-col'>
                <div className='flex items-start justify-between'>
                  <div className='flex gap-1 truncate'>
                    <UserName
                      name={tweetUserData.name}
                      username={tweetUserData.username}
                      verified={tweetUserData.verified}
                      disableLink
                    />
                    <UserUsername
                      username={tweetUserData.username}
                      disableLink
                    />
                    <TweetDate tweetLink={tweetLink} createdAt={createdAt} />
                  </div>
                  <div className='translate-x-2'>
                    <TweetActions
                      isOwner={isOwner}
                      ownerId={tweetUserData.id}
                      tweetId={tweetId}
                      createdBy={createdBy}
                      username={tweetUserData.username}
                      parentId={parent?.id}
                      hasImages={!!images}
                    />
                  </div>
                </div>

                {/* Review da Música alinhado com o conteúdo */}
                <div className='mt-2'>
                  <TweetReview tweet={tweet} />
                </div>
              </div>
            </div>

            <div className='sm:ml-12'>
              <TweetStats
                reply={!!parent}
                userId={userId}
                isOwner={isOwner}
                tweetId={tweetId}
                userLikes={userLikes}
                userReplies={userReplies}
                userRetweets={userRetweets}
              />
            </div>
          </a>
        </Link>
      </motion.article>
    );
  }

  // =====================================================================================
  //  LAYOUT PADRÃO (TWEET)
  // =====================================================================================
  const { id: ownerId, name, username, verified, photoURL } = tweetUserData;
  const { id: parentId, username: parentUsername = username } = parent ?? {};
  const {
    id: profileId,
    name: profileName,
    username: profileUsername
  } = profile ?? {};
  const reply = !!parent;
  const tweetIsRetweeted = userRetweets.includes(profileId ?? '');

  return (
    <motion.article
      {...(!modal ? { ...variants, layout: 'position' } : {})}
      animate={{
        ...variants.animate,
        ...(parentTweet && { transition: { duration: 0.2 } })
      }}
    >
      <Modal
        className='flex items-start justify-center'
        modalClassName='bg-main-background rounded-2xl max-w-xl w-full my-8 overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <TweetReplyModal tweet={tweet} closeModal={closeModal} />
      </Modal>
      <Link href={tweetLink} scroll={!reply}>
        <a
          className={cn(
            `accent-tab hover-card relative flex flex-col gap-y-4 px-4 py-3 outline-none duration-200`,
            parentTweet
              ? 'mt-0.5 pt-2.5 pb-0'
              : 'border-b border-light-border dark:border-dark-border'
          )}
          draggable={false}
          onClick={delayScroll(200)}
        >
          <div className='grid grid-cols-[auto,1fr] gap-x-3 gap-y-1'>
            <AnimatePresence initial={false}>
              {modal ? null : pinned ? (
                <TweetStatus type='pin'>
                  <p className='text-sm font-bold'>Pinned Tweet</p>
                </TweetStatus>
              ) : (
                tweetIsRetweeted &&
                profileUsername && (
                  <TweetStatus type='tweet'>
                    <Link href={`/user/${profileUsername}`}>
                      <a className='custom-underline truncate text-sm font-bold'>
                        {userId === profileId ? 'You' : profileName} Retweeted
                      </a>
                    </Link>
                  </TweetStatus>
                )
              )}
            </AnimatePresence>
            <div className='flex flex-col items-center gap-2'>
              <UserTooltip avatar modal={modal} {...tweetUserData}>
                <UserAvatar src={photoURL} alt={name} username={username} />
              </UserTooltip>
              {parentTweet && (
                <i className='hover-animation h-full w-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <div className='flex justify-between gap-2 text-light-secondary dark:text-dark-secondary'>
                <div className='flex gap-1 truncate xs:overflow-visible xs:whitespace-normal'>
                  <UserTooltip modal={modal} {...tweetUserData}>
                    <UserName
                      name={name}
                      username={username}
                      verified={verified}
                      className='font-bold text-light-primary dark:text-dark-primary'
                    />
                  </UserTooltip>
                  <UserTooltip modal={modal} {...tweetUserData}>
                    <UserUsername username={username} />
                  </UserTooltip>
                  <TweetDate tweetLink={tweetLink} createdAt={createdAt} />
                </div>
                <div className='px-4'>
                  {!modal && (
                    <TweetActions
                      isOwner={isOwner}
                      ownerId={ownerId}
                      tweetId={tweetId}
                      parentId={parentId}
                      username={username}
                      hasImages={!!images}
                      createdBy={createdBy}
                    />
                  )}
                </div>
              </div>
              {(reply || modal) && (
                <p
                  className={cn(
                    'text-light-secondary dark:text-dark-secondary',
                    modal && 'order-1 my-2'
                  )}
                >
                  Replying to{' '}
                  {parentUsername ? (
                    <Link href={`/user/${parentUsername}`}>
                      <a className='custom-underline text-main-accent'>
                        @{parentUsername}
                      </a>
                    </Link>
                  ) : (
                    <span className='text-main-accent'>@...</span>
                  )}
                </p>
              )}
              {text && (
                <p className='whitespace-pre-line break-words'>{text}</p>
              )}
              <div className='mt-1 flex flex-col gap-2'>
                {images && (
                  <ImagePreview
                    tweet
                    imagesPreview={images}
                    previewCount={images.length}
                  />
                )}
                {!modal && (
                  <TweetStats
                    reply={reply}
                    userId={userId}
                    isOwner={isOwner}
                    tweetId={tweetId}
                    userLikes={userLikes}
                    userReplies={userReplies}
                    userRetweets={userRetweets}
                    openModal={!parent ? openModal : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </a>
      </Link>
    </motion.article>
  );
}
