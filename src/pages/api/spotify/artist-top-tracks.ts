import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do artista é obrigatório' });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID ||
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });

  try {
    // Autenticação
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body.access_token);

    // Busca top tracks do artista
    const topTracksResponse = await spotifyApi.getArtistTopTracks(id, 'BR');

    const tracks = topTracksResponse.body.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      image: track.album?.images?.[0]?.url || null,
      previewUrl: track.preview_url,
      durationMs: track.duration_ms,
      popularity: track.popularity,
      albumName: track.album?.name || ''
    }));

    res.status(200).json(tracks);
  } catch (error: any) {
    console.error('Erro ao buscar top tracks:', error);
    res.status(500).json({
      error: 'Erro ao buscar top tracks',
      details: error.message
    });
  }
}
