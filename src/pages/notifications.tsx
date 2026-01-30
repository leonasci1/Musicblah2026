import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useNotifications } from '@lib/hooks/useNotifications';
import { markAllNotificationsAsRead } from '@lib/firebase/notifications';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { NotificationCard } from '@components/notification/notification-card';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { SEO } from '@components/common/seo';
import type { ReactElement, ReactNode } from 'react';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Notifications(): JSX.Element {
  const { user } = useAuth();
  const { notifications, unreadCount, loading } = useNotifications(user?.id);

  // Marcar todas como lidas quando sair da página
  useEffect(() => {
    return () => {
      if (user?.id && unreadCount > 0) {
        void markAllNotificationsAsRead(user.id);
      }
    };
  }, [user?.id, unreadCount]);

  const handleMarkAllRead = (): void => {
    if (user?.id) {
      void markAllNotificationsAsRead(user.id);
    }
  };

  return (
    <MainContainer>
      <SEO title='Notificações / MusicBlah' />
      <MainHeader className='flex items-center justify-between'>
        <div className='-mb-1 flex flex-col'>
          <h2 className='-mt-1 text-xl font-bold'>Notificações</h2>
          {unreadCount > 0 && (
            <p className='text-xs text-light-secondary dark:text-dark-secondary'>
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            className='dark-bg-tab group relative p-2 hover:bg-light-primary/10 
              active:bg-light-primary/20 dark:hover:bg-dark-primary/10 
              dark:active:bg-dark-primary/20'
            onClick={handleMarkAllRead}
          >
            <HeroIcon iconName='CheckIcon' className='h-5 w-5' />
            <span
              className='invisible absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap 
              rounded bg-black px-2 py-1 text-xs text-white group-hover:visible'
            >
              Marcar todas como lidas
            </span>
          </Button>
        )}
      </MainHeader>

      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-8 py-16'>
            <HeroIcon
              iconName='BellIcon'
              className='h-16 w-16 text-light-secondary dark:text-dark-secondary'
            />
            <h3 className='mt-4 text-xl font-bold text-light-primary dark:text-dark-primary'>
              Nenhuma notificação ainda
            </h3>
            <p className='mt-2 text-center text-light-secondary dark:text-dark-secondary'>
              Quando alguém curtir, repostar ou responder seus posts, você verá
              aqui.
            </p>
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                {...variants}
                transition={{ duration: 0.2 }}
              >
                <NotificationCard
                  notification={notification}
                  userId={user?.id as string}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </section>
    </MainContainer>
  );
}

Notifications.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
