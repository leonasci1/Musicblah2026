import { NextApiRequest, NextApiResponse } from 'next';

// Retorna a música que o usuário está ouvindo agora
// Requer access_token do usuário (via header Authorization)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token não fornecido',
      isPlaying: false
    });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // 204 = Nenhuma música tocando
    if (response.status === 204) {
      return res.status(200).json({
        isPlaying: false,
        track: null
      });
    }

    if (!response.ok) {
      // Token expirado ou inválido
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Token expirado',
          isPlaying: false,
          needsRefresh: true
        });
      }

      return res.status(response.status).json({
        error: 'Erro ao buscar música atual',
        isPlaying: false
      });
    }

    const data = await response.json();

    // Só retornamos se for uma track (não podcasts)
    if (data.currently_playing_type !== 'track') {
      return res.status(200).json({
        isPlaying: data.is_playing,
        track: null,
        type: data.currently_playing_type
      });
    }

    const track = data.item;

    return res.status(200).json({
      isPlaying: data.is_playing,
      progressMs: data.progress_ms,
      track: {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        artistId: track.artists[0]?.id,
        album: track.album.name,
        albumId: track.album.id,
        image: track.album.images[0]?.url || null,
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify
      }
    });
  } catch (error) {
    console.error('Erro ao buscar currently playing:', error);
    return res.status(500).json({
      error: 'Erro interno',
      isPlaying: false
    });
  }
}
