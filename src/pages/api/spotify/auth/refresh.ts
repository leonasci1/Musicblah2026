import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Refresh do token do Spotify
// Tokens expiram em 1 hora, então precisamos renovar

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Inicializar Firebase Admin (se ainda não foi)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.NEXT_PUBLIC_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token, user_id } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token é obrigatório' });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: 'Configurações do Spotify não encontradas' });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao renovar token:', errorData);
      return res.status(400).json({ error: 'Falha ao renovar token' });
    }

    const data = await response.json();

    const newTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000
    };

    // Salvar novos tokens no Firebase se user_id foi passado
    if (user_id) {
      try {
        const db = getFirestore();
        await db.collection('users').doc(user_id).update({
          spotifyTokens: newTokens
        });
      } catch (e) {
        console.warn('Não foi possível atualizar tokens no Firebase:', e);
      }
    }

    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token || refresh_token
    });
  } catch (error) {
    console.error('Erro ao renovar token Spotify:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
