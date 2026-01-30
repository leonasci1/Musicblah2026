import cn from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { Loading } from '@components/ui/loading';
import { variants } from '@components/user/user-header';
import { UserCard } from './user-card';
import type { User } from '@lib/types/user';
import type { StatsType } from '@components/view/view-tweet-stats';
import type { StatsEmptyProps } from '@components/tweet/stats-empty';

type FollowType = 'following' | 'followers';

type CombinedTypes = StatsType | FollowType;

type UserCardsProps = {
  data: User[] | null;
  type: CombinedTypes;
  follow?: boolean;
  loading: boolean;
};

type NoStatsData = Record<CombinedTypes, StatsEmptyProps>;

const allNoStatsData: Readonly<NoStatsData> = {
  retweets: {
    title: 'Compartilhe posts que você curte',
    imageData: { src: '/assets/no-retweets.png', alt: 'Sem reposts' },
    description:
      'Compartilhe o post de outra pessoa na sua timeline repostando. Quando fizer isso, aparecerá aqui.'
  },
  likes: {
    title: 'Nenhuma curtida ainda',
    imageData: { src: '/assets/no-likes.png', alt: 'Sem curtidas' },
    description: 'Quando você curtir um post, ele aparecerá aqui.'
  },
  following: {
    title: 'Fique por dentro',
    description:
      'Seguir contas é uma forma fácil de personalizar sua timeline e saber o que está acontecendo com os tópicos e pessoas que te interessam.'
  },
  followers: {
    title: 'Procurando seguidores?',
    imageData: { src: '/assets/no-followers.png', alt: 'Sem seguidores' },
    description:
      'Quando alguém seguir esta conta, aparecerá aqui. Postar e interagir com outros ajuda a aumentar seguidores.'
  }
};

export function UserCards({
  data,
  type,
  follow,
  loading
}: UserCardsProps): JSX.Element {
  const noStatsData = allNoStatsData[type];
  const modal = ['retweets', 'likes'].includes(type);

  return (
    <section
      className={cn(
        modal && 'h-full overflow-y-auto [&>div:first-child>a]:mt-[52px]',
        loading && 'flex items-center justify-center'
      )}
    >
      {loading ? (
        <Loading className={modal ? 'mt-[52px]' : 'mt-5'} />
      ) : (
        <AnimatePresence mode='popLayout'>
          {data?.length ? (
            data.map((userData) => (
              <motion.div layout='position' key={userData.id} {...variants}>
                <UserCard {...userData} follow={follow} modal={modal} />
              </motion.div>
            ))
          ) : (
            <StatsEmpty {...noStatsData} modal={modal} />
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
