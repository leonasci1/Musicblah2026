import { useState, useEffect } from 'react';
import { query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { userNotificationsCollection } from '@lib/firebase/collections';
import type { Notification } from '@lib/types/notification';

type UseNotificationsReturn = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
};

export function useNotifications(
  userId: string | undefined,
  limitCount = 50
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = userNotificationsCollection(userId);
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];

        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar notificações:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading };
}

export function useUnreadNotifications(userId: string | undefined): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const notificationsRef = userNotificationsCollection(userId);
    const q = query(notificationsRef, where('read', '==', false), limit(99));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        console.error('Erro ao contar notificações:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return unreadCount;
}
