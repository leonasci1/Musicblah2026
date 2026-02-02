import { NextApiRequest, NextApiResponse } from 'next';

// Gera URL de autorização do Spotify
// O usuário será redirecionado para fazer login no Spotify
// Scopes necessários: user-read-currently-playing, user-read-playback-state

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  'http://localhost:3000/api/spotify/auth/callback';

// Scopes que precisamos (separados por espaço)
const SCOPES =
  'user-read-currently-playing user-read-playback-state user-read-recently-played';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!CLIENT_ID) {
    return res.status(500).json({ error: 'SPOTIFY_CLIENT_ID não configurado' });
  }

  // Verificar se redirect_uri está configurado
  console.log('Spotify OAuth Config:', {
    clientId: CLIENT_ID?.substring(0, 8) + '...',
    redirectUri: REDIRECT_URI,
    scopes: SCOPES
  });

  // Gerar state para segurança (previne CSRF)
  const state = Math.random().toString(36).substring(7);

  // Construir URL manualmente para evitar problemas de encoding
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: state
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  console.log('Redirecting to:', authUrl);

  // Redireciona para o Spotify
  res.redirect(authUrl);
}
