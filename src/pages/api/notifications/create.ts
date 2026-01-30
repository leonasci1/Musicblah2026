import { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { userNotificationsCollection } from '@lib/firebase/collections';
import type { NotificationType } from '@lib/types/notification';

// API para criar notificações
// POST /api/notifications/create
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    type,
    toUserId,
    fromUserId,
    fromUserName,
    fromUserUsername,
    fromUserPhoto,
    tweetId,
    tweetText
  } = req.body;

  // Validação
  if (!type || !toUserId || !fromUserId) {
    return res
      .status(400)
      .json({ error: 'Campos obrigatórios: type, toUserId, fromUserId' });
  }

  // Não notificar a si mesmo
  if (toUserId === fromUserId) {
    return res
      .status(200)
      .json({ message: 'Notificação ignorada (mesmo usuário)' });
  }

  try {
    const notificationsRef = userNotificationsCollection(toUserId);

    await addDoc(notificationsRef, {
      type: type as NotificationType,
      userId: toUserId,
      fromUserId,
      fromUserName: fromUserName || 'Usuário',
      fromUserUsername: fromUserUsername || 'user',
      fromUserPhoto: fromUserPhoto || '/assets/default-avatar.png',
      tweetId: tweetId || null,
      tweetText: tweetText?.substring(0, 100) || null,
      read: false,
      createdAt: serverTimestamp()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return res.status(500).json({ error: 'Erro ao criar notificação' });
  }
}
