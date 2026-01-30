import { useRef } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { doc, query, where, orderBy } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import { useCollection } from '@lib/hooks/useCollection';
import { useDocument } from '@lib/hooks/useDocument';
import { isPlural } from '@lib/utils';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { ViewTweet } from '@components/view/view-tweet';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { ViewParentTweet } from '@components/view/view-parent-tweet';
import type { ReactElement, ReactNode } from 'react';

export default function TweetId(): JSX.Element {
  const {
    query: { id },
    back
  } = useRouter();

  const { data: tweetData, loading: tweetLoading } = useDocument(
    doc(tweetsCollection, id as string),
    { includeUser: true, allowNull: true }
  );

  const viewTweetRef = useRef<HTMLElement>(null);

  // Query das replies - sempre executa quando temos um ID válido
  const { data: repliesData, loading: repliesLoading } = useCollection(
    query(
      tweetsCollection,
      where('parent.id', '==', (id as string) || ''),
      orderBy('createdAt', 'desc')
    ),
    { includeUser: true, allowNull: true }
  );

  const { text, images } = tweetData ?? {};

  const imagesLength = images?.length ?? 0;
  const parentId = tweetData?.parent?.id;

  console.log('🔍 [id].tsx - Dados carregados:', {
    tweetId: tweetData?.id,
    tweetLoading,
    repliesLoading,
    repliesCount: repliesData?.length ?? 0,
    tweetType: tweetData?.type,
    tweetText: text?.substring(0, 30),
    hasAlbum: !!tweetData?.album,
    hasTrack: !!tweetData?.track,
    hasRating: !!tweetData?.rating,
    fullTweetData: JSON.stringify(tweetData, null, 2).substring(0, 500)
  });

  const pageTitle = tweetData
    ? `${tweetData.user.name} on MusicBlah: "${text ?? ''}${
        images ? ` (${imagesLength} image${isPlural(imagesLength)})` : ''
      }" / MusicBlah`
    : null;

  return (
    <MainContainer className='!pb-[1280px]'>
      <MainHeader
        useActionButton
        title={parentId ? 'Thread' : 'Postar'}
        action={back}
      />
      <section>
        {tweetLoading ? (
          <Loading className='mt-5' />
        ) : !tweetData || !tweetData.id ? (
          <>
            <SEO title='Post not found' />
            <Error message='Post não encontrado ou não foi carregado' />
            <div className='mt-4 px-4 text-sm text-gray-400'>
              ID: {id} | Carregando: {tweetLoading ? 'sim' : 'não'}
            </div>
          </>
        ) : (
          <>
            {pageTitle && <SEO title={pageTitle} />}
            {parentId && (
              <ViewParentTweet
                parentId={parentId}
                viewTweetRef={viewTweetRef}
              />
            )}
            {/* DEBUG: Verificar se tweetData existe */}
            {!tweetData.id && (
              <div className='mb-4 rounded border border-red-500 bg-red-500/20 p-4 text-red-400'>
                ⚠️ Erro: Tweet sem ID. Dados:{' '}
                {JSON.stringify(tweetData).substring(0, 200)}
              </div>
            )}
            <ViewTweet viewTweetRef={viewTweetRef} {...tweetData} />
            {/* Seção de Replies */}
            {repliesLoading ? (
              <Loading className='mt-5' />
            ) : repliesData && repliesData.length > 0 ? (
              <AnimatePresence mode='popLayout'>
                {repliesData.map((tweet) => (
                  <Tweet {...tweet} key={tweet.id} />
                ))}
              </AnimatePresence>
            ) : (
              <div className='border-t border-light-border px-4 py-8 text-center text-gray-500 dark:border-dark-border'>
                <p>Sem respostas ainda. Seja o primeiro a responder! 🎵</p>
              </div>
            )}
          </>
        )}
      </section>
    </MainContainer>
  );
}

TweetId.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
