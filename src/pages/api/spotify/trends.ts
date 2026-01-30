import { NextApiRequest, NextApiResponse } from 'next';

// ✅ SOLUÇÃO DEFINITIVA: Usar 'require' cala a boca do TypeScript sobre o erro de módulo
const SpotifyWebApi = require('spotify-web-api-node');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Suas chaves
  const CLIENT_ID = '5b8cd851163d46c5894d3e2de61063f6';
  const CLIENT_SECRET = 'e17183e9f7834551845b85e96f7ec43b';

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  try {
    // 2. Autenticação
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    // 3. BUSCANDO A PLAYLIST
    // Playlist personalizada do MusicBlah
    const playlistId = '6u9LZXR0uu3Lu5UD6mfZ4r';

    console.log(`🎵 Buscando Playlist ID: ${playlistId}...`);
    const playlist = await spotifyApi.getPlaylist(playlistId);

    // 4. Formata os dados
    // O ": any" aqui previne o outro erro de "item implicitly has any type"
    const tracks = playlist.body.tracks.items
      .slice(0, 5)
      .map((item: any) => {
        // Segurança contra itens vazios
        if (!item.track) return null;

        return {
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          image: item.track.album.images[2]?.url, // Imagem pequena
          url: item.track.external_urls.spotify,
          previewUrl: item.track.preview_url
        };
      })
      .filter(Boolean); // Remove nulos

    res.status(200).json(tracks);
  } catch (error: any) {
    console.error('❌ ERRO DO SPOTIFY:', error.body || error);
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  }
}
