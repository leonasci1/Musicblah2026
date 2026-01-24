import { NextApiRequest, NextApiResponse } from 'next';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Pega um token temporário (Client Credentials Flow)
    // Isso permite pegar dados públicos sem o usuário estar logado
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);

    // 2. Busca a Playlist "Top 50 - Brasil"
    // ID Oficial: 37i9dQZEVXbMXbN3EUUhlg
    const playlist = await spotifyApi.getPlaylist('37i9dQZEVXbMXbN3EUUhlg');

    // 3. Limpa os dados para enviar só o necessário (economiza dados)
    const tracks = playlist.body.tracks.items.slice(0, 5).map((item) => ({
      id: item.track?.id,
      name: item.track?.name,
      artist: item.track?.artists[0].name,
      image: item.track?.album.images[2]?.url, // Imagem pequena (64x64)
      url: item.track?.external_urls.spotify
    }));

    res.status(200).json(tracks);
  } catch (error) {
    console.error('Erro no Spotify Trends:', error);
    res.status(500).json({ error: 'Falha ao buscar top 50' });
  }
}
