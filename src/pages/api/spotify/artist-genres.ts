import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

type GenreResponse = {
  genres: Array<{ name: string; count: number }>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenreResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ genres: [], error: 'Method not allowed' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { artists } = req.body;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!artists || !Array.isArray(artists) || artists.length === 0) {
    res.status(400).json({ genres: [], error: 'Artists array required' });
    return;
  }

  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID ?? '5b8cd851163d46c5894d3e2de61063f6',
    clientSecret:
      process.env.SPOTIFY_CLIENT_SECRET ?? 'e17183e9f7834551845b85e96f7ec43b'
  });

  try {
    // Autenticar
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body.access_token);

    const genreCount: Record<string, number> = {};

    // Buscar cada artista e pegar gêneros
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const artistName of artists.slice(0, 10) as string[]) {
      try {
        const searchResult = await spotifyApi.searchArtists(artistName, {
          limit: 1
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const artist = searchResult.body.artists?.items?.[0];

        if (artist?.genres) {
          for (const genre of artist.genres) {
            // Normalizar gênero (primeira letra maiúscula)
            const normalizedGenre = genre
              .split(' ')
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(' ');
            genreCount[normalizedGenre] =
              (genreCount[normalizedGenre] || 0) + 1;
          }
        }
      } catch {
        // Ignorar erros de artistas não encontrados
      }
    }

    // Ordenar por contagem e retornar top 8
    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({ genres: sortedGenres });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching genres:', error);
    res.status(500).json({ genres: [], error: 'Erro ao buscar gêneros' });
  }
}
