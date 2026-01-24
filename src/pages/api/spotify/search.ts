import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Recebemos o 'type' (album ou track)
  const { q, type = 'album' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Termo de busca vazio' });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID || '5b8cd851163d46c5894d3e2de61063f6',
    clientSecret:
      process.env.SPOTIFY_CLIENT_SECRET || 'e17183e9f7834551845b85e96f7ec43b'
  });

  try {
    // 2. Autenticação
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    // ========================================================================
    // LÓGICA PARA MÚSICAS (TRACKS)
    // ========================================================================
    if (type === 'track') {
      const response = await spotifyApi.searchTracks(q, { limit: 6 });

      // Adicionado ': any' para o TypeScript não reclamar
      const tracks = response.body.tracks?.items.map((track: any) => {
        // Formatar duração (ms -> mm:ss)
        const minutes = Math.floor(track.duration_ms / 60000);
        const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
        const duration = `${minutes}:${
          Number(seconds) < 10 ? '0' : ''
        }${seconds}`;

        return {
          type: 'track',
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[1]?.url || track.album.images[0]?.url,
          duration: duration,
          previewUrl: track.preview_url // O link do áudio de 30s
        };
      });

      return res.status(200).json(tracks || []);
    }

    // ========================================================================
    // LÓGICA PADRÃO (ÁLBUNS)
    // ========================================================================
    const response = await spotifyApi.searchAlbums(q, { limit: 6 });

    // Adicionado ': any' para o TypeScript não reclamar
    const albums = response.body.albums?.items.map((album: any) => ({
      type: 'album',
      id: album.id,
      name: album.name,
      artist: album.artists[0].name,
      image: album.images[1]?.url || album.images[0]?.url, // Capa média
      year: album.release_date.split('-')[0],
      url: album.external_urls.spotify,
      totalTracks: album.total_tracks
    }));

    res.status(200).json(albums || []);
  } catch (error) {
    console.error('Erro na API Spotify:', error);
    res.status(500).json({ error: 'Falha ao buscar dados' });
  }
}
