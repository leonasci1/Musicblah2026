import { doc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router'; // Importar useRouter
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@lib/context/user-context';
import { useCollection } from '@lib/hooks/useCollection';
import { useDocument } from '@lib/hooks/useDocument';
import { tweetsCollection } from '@lib/firebase/collections';
import { mergeData } from '@lib/merge';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { Loading } from '@components/ui/loading';
import { Tweet } from '@components/tweet/tweet';
import type { ReactElement, ReactNode } from 'react';

export default function UserTweets(): JSX.Element {
  const { user } = useUser();
  const {
    query: { id }
  } = useRouter();

  // O user vem do contexto e contém o ID real do Firebase
  // O 'id' da URL é o username, não o ID do documento
  const userId = user?.id || 'loading';

  const { username, pinnedTweet } = user ?? {};

  const { data: pinnedData } = useDocument(
    doc(tweetsCollection, pinnedTweet ?? 'null'),
    {
      disabled: !pinnedTweet,
      allowNull: true,
      includeUser: true
    }
  );

  // Buscar tweets do usuário pelo ID real
  const { data: ownerTweets, loading: ownerLoading } = useCollection(
    query(tweetsCollection, where('createdBy', '==', userId)),
    { includeUser: true, allowNull: true, disabled: !user?.id }
  );

  const { data: peopleTweets, loading: peopleLoading } = useCollection(
    query(tweetsCollection, where('userRetweets', 'array-contains', userId)),
    { includeUser: true, allowNull: true, disabled: !user?.id }
  );

  const mergedTweets = mergeData(true, ownerTweets, peopleTweets);

  // Filtramos posts (sem parent = não é reply)
  // Ordenamos por data de criação (mais recente primeiro)
  // Removemos o post fixado da lista normal (será mostrado separadamente)
  const postsOnly = mergedTweets
    ?.filter((tweet) => !tweet.parent && tweet.id !== pinnedTweet)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  // Se ainda não tem user, mostra loading
  const isLoading = !user?.id || ownerLoading || peopleLoading;

  return (
    <section>
      {isLoading ? (
        <Loading className='mt-5' />
      ) : (!postsOnly || postsOnly.length === 0) && !pinnedData ? (
        <StatsEmpty
          title={`@${username as string} ainda não postou`}
          description='Quando postarem, os posts aparecerão aqui.'
        />
      ) : (
        <AnimatePresence mode='popLayout'>
          {/* Post fixado sempre primeiro */}
          {pinnedData && (
            <Tweet pinned {...pinnedData} key={`pinned-${pinnedData.id}`} />
          )}
          {/* Demais posts em ordem cronológica */}
          {postsOnly?.map((tweet) => (
            <Tweet {...tweet} profile={user} key={tweet.id} />
          ))}
        </AnimatePresence>
      )}
    </section>
  );
}

UserTweets.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
          <UserHomeLayout>{page}</UserHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
