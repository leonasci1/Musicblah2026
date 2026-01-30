import {
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { userNotificationsCollection } from '@lib/firebase/collections';
import { db } from '@lib/firebase/app';
import type { NotificationType } from '@lib/types/notification';
import type { User } from '@lib/types/user';

type CreateNotificationParams = {
  type: NotificationType;
  toUserId: string; // Quem recebe
  fromUser: User; // Quem gerou
  tweetId?: string;
  tweetText?: string;
};

/**
 * Cria uma notificação para um usuário
 */
export async function createNotification({
  type,
  toUserId,
  fromUser,
  tweetId,
  tweetText
}: CreateNotificationParams): Promise<void> {
  // Não notificar a si mesmo
  if (toUserId === fromUser.id) return;

  try {
    const notificationsRef = userNotificationsCollection(toUserId);

    await addDoc(notificationsRef, {
      type,
      userId: toUserId,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      fromUserUsername: fromUser.username,
      fromUserPhoto: fromUser.photoURL,
      tweetId: tweetId ?? undefined,
      tweetText: tweetText?.substring(0, 100) ?? undefined,
      read: false,
      createdAt: serverTimestamp()
    });

    console.log(`✅ Notificação criada: ${type} para ${toUserId}`);
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const notificationRef = doc(
      db,
      `users/${userId}/notifications`,
      notificationId
    );
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    const notificationsRef = userNotificationsCollection(userId);
    const q = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });

    await batch.commit();
    console.log(`✅ ${snapshot.size} notificações marcadas como lidas`);
  } catch (error) {
    console.error('❌ Erro ao marcar todas notificações:', error);
  }
}

/**
 * Remove uma notificação (ex: quando dá unlike)
 */
export async function removeNotification(
  toUserId: string,
  fromUserId: string,
  type: NotificationType,
  tweetId?: string
): Promise<void> {
  try {
    const notificationsRef = userNotificationsCollection(toUserId);

    let q = query(
      notificationsRef,
      where('fromUserId', '==', fromUserId),
      where('type', '==', type)
    );

    if (tweetId) {
      q = query(
        notificationsRef,
        where('fromUserId', '==', fromUserId),
        where('type', '==', type),
        where('tweetId', '==', tweetId)
      );
    }

    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('❌ Erro ao remover notificação:', error);
  }
}
