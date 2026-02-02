import { NextApiRequest, NextApiResponse } from 'next';

// Callback do OAuth do Spotify
// Recebe o code e troca por access_token

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  'http://localhost:3000/api/spotify/auth/callback';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, error, state } = req.query;

  if (error) {
    console.error('Erro OAuth Spotify:', error);
    return res.redirect('/home?spotify_error=' + error);
  }

  if (!code) {
    return res.redirect('/home?spotify_error=no_code');
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: 'Configurações do Spotify não encontradas' });
  }

  try {
    // Trocar code por access_token
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: String(code),
          redirect_uri: REDIRECT_URI
        })
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erro ao trocar code por token:', errorData);
      return res.redirect('/home?spotify_error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();

    // Retornar os tokens via query params (serão salvos no frontend)
    // Em produção, você deveria usar cookies HttpOnly ou salvar no Firebase
    const redirectUrl = new URL(
      '/home',
      process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    );
    redirectUrl.searchParams.append('spotify_connected', 'true');
    redirectUrl.searchParams.append('access_token', tokenData.access_token);
    redirectUrl.searchParams.append('refresh_token', tokenData.refresh_token);
    redirectUrl.searchParams.append('expires_in', tokenData.expires_in);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Erro no callback Spotify:', error);
    return res.redirect('/home?spotify_error=unknown');
  }
}
