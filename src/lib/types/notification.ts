import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type NotificationType =
  | 'like' // Alguém curtiu seu post
  | 'retweet' // Alguém repostou
  | 'reply' // Alguém respondeu
  | 'follow' // Alguém te seguiu
  | 'mention' // Alguém te mencionou
  | 'review'; // Alguém avaliou a mesma música

export type Notification = {
  id: string;
  type: NotificationType;
  userId: string; // Quem recebe a notificação
  fromUserId: string; // Quem gerou a notificação
  fromUserName: string; // Nome de quem gerou
  fromUserUsername: string; // Username de quem gerou
  fromUserPhoto: string; // Foto de quem gerou
  tweetId?: string; // ID do tweet relacionado (se houver)
  tweetText?: string; // Preview do texto do tweet
  read: boolean; // Se foi lida
  createdAt: Timestamp;
};

export const notificationConverter: FirestoreDataConverter<Notification> = {
  toFirestore(notification) {
    return { ...notification };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Notification;
  }
};
