import Link from 'next/link';
import { motion } from 'framer-motion';
import cn from 'clsx';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { ImagePreview } from '@components/input/image-preview';
import { UserAvatar } from '@components/user/user-avatar';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { variants } from '@components/tweet/tweet';
import { TweetActions } from '@components/tweet/tweet-actions';
import { TweetStats } from '@components/tweet/tweet-stats';
import { TweetDate } from '@components/tweet/tweet-date';
import { TweetReview } from '@components/tweet/tweet-review'; // ✅ Suporte para reviews
import { LyricCard } from '@components/tweet/lyric-card'; // ✅ Suporte para letras
import { Input } from '@components/input/input';
import type { RefObject } from 'react';
import type { User } from '@lib/types/user';
import type { Tweet } from '@lib/types/tweet';

type ViewTweetProps = Tweet & {
  user: User;
  viewTweetRef?: RefObject<HTMLElement>;
};

export function ViewTweet(tweet: ViewTweetProps): JSX.Element {
  const {
    id: tweetId,
    text,
    images,
    parent,
    userLikes,
    createdBy,
    createdAt,
    userRetweets,
    userReplies,
    viewTweetRef,
    user: tweetUserData,
    type, // ✅ Identifica se é música
    album, // ✅ Dados do Spotify
    track, // ✅ Dados da track
    rating, // ✅ Estrelas
    lyric // ✅ Dados da letra
  } = tweet;

  // Guard: Verificar se temos dados mínimos
  if (!tweetId || !tweetUserData) {
    console.error('❌ ViewTweet: Dados incompletos', {
      tweetId,
      hasUserData: !!tweetUserData
    });
    return <div className='p-4 text-red-400'>Erro ao carregar post</div>;
  }

  console.log('📺 ViewTweet renderizado:', {
    tweetId,
    type,
    hasAlbum: !!album,
    hasTrack: !!track,
    hasRating: !!rating,
    text: text?.substring(0, 30),
    userName: tweetUserData?.name
  });

  const { id: ownerId, name, username, verified, photoURL } = tweetUserData;
  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();

  const tweetLink = `/tweet/${tweetId}`;
  const userId = user?.id as string;
  const isOwner = userId === createdBy;
  const reply = !!parent;
  const { id: parentId, username: parentUsername = username } = parent ?? {};

  return (
    <motion.article
      className={cn(
        `accent-tab relative flex cursor-default flex-col gap-3 border-b
         border-light-border px-4 py-4 outline-none dark:border-dark-border`,
        reply && 'scroll-m-[3.25rem] pt-0'
      )}
      {...variants}
      animate={{ ...variants.animate, transition: { duration: 0.2 } }}
      exit={undefined}
      ref={viewTweetRef}
    >
      <Modal
        className='flex items-start justify-center'
        modalClassName='bg-main-background rounded-2xl max-w-xl w-full mt-8 overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <TweetReplyModal tweet={tweet} closeModal={closeModal} />
      </Modal>

      <div className='flex flex-col gap-2'>
        {reply && (
          <div className='flex w-12 items-center justify-center'>
            <i className='hover-animation h-2 w-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
          </div>
        )}

        {/* PERFIL MELHORADO: Alinhamento horizontal e contexto visual */}
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <UserTooltip avatar {...tweetUserData}>
              <UserAvatar
                src={photoURL}
                alt={name}
                username={username}
                className='h-12 w-12 ring-4 ring-main-accent/10'
              />
            </UserTooltip>

            <div className='flex min-w-0 flex-col leading-tight'>
              <UserTooltip {...tweetUserData}>
                <UserName
                  className='-mb-0.5 text-lg font-bold text-light-primary dark:text-dark-primary'
                  name={name}
                  username={username}
                  verified={verified}
                />
              </UserTooltip>
              <UserTooltip {...tweetUserData}>
                <UserUsername
                  className='text-[15px] text-light-secondary dark:text-dark-secondary'
                  username={username}
                />
              </UserTooltip>
            </div>
          </div>

          <div className='self-start'>
            <TweetActions
              viewTweet
              isOwner={isOwner}
              ownerId={ownerId}
              tweetId={tweetId}
              parentId={parentId}
              username={username}
              hasImages={!!images}
              createdBy={createdBy}
            />
          </div>
        </div>
      </div>

      {reply && (
        <p className='text-light-secondary dark:text-dark-secondary'>
          Respondendo a{' '}
          <Link href={`/user/${parentUsername}`}>
            <a className='custom-underline text-main-accent'>
              @{parentUsername}
            </a>
          </Link>
        </p>
      )}

      {/* CONTEÚDO PRINCIPAL: Texto, Música ou Letra */}
      <div className='mt-2'>
        {type === 'lyric' && lyric ? (
          <div className='mb-4'>
            <LyricCard
              lyricText={lyric.text}
              trackName={lyric.trackName}
              artistName={lyric.artistName}
              albumImage={lyric.albumImage}
              spotifyUrl={lyric.spotifyUrl}
              backgroundColor={lyric.backgroundColor}
            />
          </div>
        ) : type === 'review' && (album || track) && rating ? (
          <div className='mb-4'>
            {/* Renderiza o card da música com a sua nota */}
            <TweetReview tweet={tweet} />
          </div>
        ) : type === 'review' && !album && !track ? (
          <div className='mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400'>
            ⚠️ Dados de review não carregados. Tente recarregar a página.
          </div>
        ) : (
          text && (
            <p className='mb-4 whitespace-pre-line break-words text-2xl'>
              {text}
            </p>
          )
        )}

        {images && (
          <div className='mb-4'>
            <ImagePreview
              viewTweet
              imagesPreview={images}
              previewCount={images.length}
            />
          </div>
        )}

        <div className='inner:hover-animation inner:border-b inner:border-light-border dark:inner:border-dark-border'>
          <TweetDate viewTweet tweetLink={tweetLink} createdAt={createdAt} />
          <TweetStats
            viewTweet
            reply={reply}
            userId={userId}
            isOwner={isOwner}
            tweetId={tweetId}
            userLikes={userLikes}
            userRetweets={userRetweets}
            userReplies={userReplies}
            openModal={openModal}
            tweetOwnerId={createdBy}
            tweetText={text}
          />
        </div>
        <Input reply parent={{ id: tweetId, username: username }} />
      </div>
    </motion.article>
  );
}
