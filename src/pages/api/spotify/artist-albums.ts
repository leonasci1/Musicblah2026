import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, limit = '20', offset = '0' } = req.query;

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

    // Busca álbuns do artista
    const albumsResponse = await spotifyApi.getArtistAlbums(id, {
      include_groups: 'album,single,ep',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      market: 'BR'
    });

    const albums = albumsResponse.body.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      image: album.images?.[0]?.url || null,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      albumType: album.album_type,
      spotifyUrl: album.external_urls?.spotify || '',
      artistId: id // ID do artista para associar reviews
    }));

    // Remove duplicatas por nome (versões diferentes do mesmo álbum)
    const uniqueAlbums = albums.reduce((acc: any[], album: any) => {
      const exists = acc.find(
        (a) => a.name.toLowerCase() === album.name.toLowerCase()
      );
      if (!exists) acc.push(album);
      return acc;
    }, []);

    res.status(200).json({
      albums: uniqueAlbums,
      total: albumsResponse.body.total,
      hasMore: albumsResponse.body.next !== null
    });
  } catch (error: any) {
    console.error('Erro ao buscar álbuns:', error);
    res.status(500).json({
      error: 'Erro ao buscar álbuns',
      details: error.message
    });
  }
}
