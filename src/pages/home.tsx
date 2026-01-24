import { AnimatePresence } from 'framer-motion';
import { orderBy } from 'firebase/firestore';
import { useWindow } from '@lib/context/window-context';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { Input } from '@components/input/input';
import { UpdateUsername } from '@components/home/update-username';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import type { ReactElement, ReactNode } from 'react';

export default function Home(): JSX.Element {
  const { isMobile } = useWindow();

  // CORREÇÃO: Removemos "where('parent', '==', null)"
  // Isso evita o erro "failed-precondition" (falta de índice no Firebase).
  // O hook agora baixa os posts misturados (posts + respostas)
  const { data, loading, LoadMore } = useInfiniteScroll(
    tweetsCollection,
    [orderBy('createdAt', 'desc')],
    { includeUser: true, allowNull: true, preserve: true }
  );

  // FILTRO CLIENT-SIDE:
  // Aqui removemos as respostas (replies) antes de mostrar na tela.
  const homeTweets = data?.filter((tweet) => !tweet.parent);

  return (
    <MainContainer>
      <SEO title='Home / MusicBlah' />
      <MainHeader
        useMobileSidebar
        title='Home'
        className='flex items-center justify-between'
      >
        <UpdateUsername />
      </MainHeader>
      {!isMobile && <Input />}
      <section className='mt-0.5 xs:mt-0'>
        {loading ? (
          <Loading className='mt-5' />
        ) : !homeTweets ? (
          <Error message='Something went wrong' />
        ) : (
          <>
            <AnimatePresence mode='popLayout'>
              {homeTweets.map((tweet) => (
                <Tweet {...tweet} key={tweet.id} />
              ))}
            </AnimatePresence>
            <LoadMore />
          </>
        )}
      </section>
    </MainContainer>
  );
}

Home.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
