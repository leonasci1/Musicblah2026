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

    // Busca dados do artista
    const artistResponse = await spotifyApi.getArtist(id);
    const artist = artistResponse.body;

    const result = {
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url || null,
      genres: artist.genres || [],
      popularity: artist.popularity,
      followersCount: artist.followers?.total || 0,
      spotifyUrl: artist.external_urls?.spotify || ''
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro ao buscar artista:', error);
    res.status(500).json({
      error: 'Erro ao buscar artista',
      details: error.message
    });
  }
}
