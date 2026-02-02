import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { orderBy } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { useWindow } from '@lib/context/window-context';
import { useAuth } from '@lib/context/auth-context';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
import { db } from '@lib/firebase/app';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { FriendsListeningMobile } from '@components/home/friends-listening-mobile';
import { Input } from '@components/input/input';
import { UpdateUsername } from '@components/home/update-username';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import type { ReactElement, ReactNode } from 'react';

export default function Home(): JSX.Element {
  const { isMobile } = useWindow();
  const { user } = useAuth();
  const router = useRouter();

  // Tratar callback do Spotify OAuth
  useEffect(() => {
    const {
      spotify_connected,
      access_token,
      refresh_token,
      expires_in,
      spotify_error
    } = router.query;

    if (spotify_error) {
      console.error('Erro na conexão Spotify:', spotify_error);
      // Limpar a URL
      router.replace('/home', undefined, { shallow: true });
      return;
    }

    if (
      spotify_connected === 'true' &&
      access_token &&
      refresh_token &&
      user?.id
    ) {
      const saveTokens = async () => {
        try {
          const spotifyTokens = {
            accessToken: access_token as string,
            refreshToken: refresh_token as string,
            expiresAt: Date.now() + Number(expires_in) * 1000
          };

          await updateDoc(doc(db, 'users', user.id), {
            spotifyTokens
          });

          console.log('✅ Spotify conectado com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar tokens Spotify:', error);
        }

        // Limpar a URL após salvar
        router.replace('/home', undefined, { shallow: true });
      };

      saveTokens();
    }
  }, [router.query, user?.id, router]);

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
      <FriendsListeningMobile />
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
