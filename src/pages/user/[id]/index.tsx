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

  // FIX 1: Evita erro 400. Se não tiver ID ainda, usa 'loading' que não quebra o banco.
  const userId = (id as string) || user?.id || 'loading';

  const { username, pinnedTweet } = user ?? {};

  const { data: pinnedData } = useDocument(
    doc(tweetsCollection, pinnedTweet ?? 'null'),
    {
      disabled: !pinnedTweet,
      allowNull: true,
      includeUser: true
    }
  );

  // FIX 2: Removi "where('parent', '==', null)". Baixamos tudo do usuário.
  const { data: ownerTweets, loading: ownerLoading } = useCollection(
    query(tweetsCollection, where('createdBy', '==', userId)),
    { includeUser: true, allowNull: true }
  );

  const { data: peopleTweets, loading: peopleLoading } = useCollection(
    query(tweetsCollection, where('userRetweets', 'array-contains', userId)),
    { includeUser: true, allowNull: true }
  );

  const mergedTweets = mergeData(true, ownerTweets, peopleTweets);

  // FIX 3: Filtramos e ordenamos aqui no código (Client-Side)
  // Isso resolve o "failed-precondition" e mostra os posts na ordem certa.
  const postsOnly = mergedTweets
    ?.filter((tweet) => !tweet.parent)
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  return (
    <section>
      {ownerLoading || peopleLoading ? (
        <Loading className='mt-5' />
      ) : !postsOnly || postsOnly.length === 0 ? (
        <StatsEmpty
          title={`@${username as string} ainda não postou`}
          description='Quando postarem, os posts aparecerão aqui.'
        />
      ) : (
        <AnimatePresence mode='popLayout'>
          {pinnedData && (
            <Tweet pinned {...pinnedData} key={`pinned-${pinnedData.id}`} />
          )}
          {postsOnly.map((tweet) => (
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
