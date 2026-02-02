import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

// ========================================================================
// FUNÇÃO DE DETECÇÃO DE MÚSICA INDEPENDENTE
// ========================================================================
/**
 * Detecta se uma música é independente baseado em:
 * - Label do artista (contém "independent", "indie", "self-released")
 * - Generos que indicam música independente
 * - Popularidade relativa (músicas indie costumam ter < 50 popularidade)
 */
async function isIndependentTrack(
  spotifyApi: any,
  track: any,
  artistId: string
): Promise<boolean> {
  try {
    const artist = await spotifyApi.getArtist(artistId);
    const artistData = artist.body;

    // Indicadores de independência
    const independentKeywords = [
      'independent',
      'indie',
      'self-released',
      'self-published',
      'unsigned',
      'label-free'
    ];

    const genresLowercased = (artistData.genres || []).map((g: string) =>
      g.toLowerCase()
    );

    // Verifica se há gêneros tipicamente independentes
    const hasIndieGenre = genresLowercased.some((genre: string) =>
      [
        'indie',
        'lo-fi',
        'indie rock',
        'indie pop',
        'bedroom pop',
        'indie folk'
      ].some((indieGenre) => genre.includes(indieGenre))
    );

    // Verifica popularidade (músicas indie normalmente são menos populares)
    const isLowPopularity = track.popularity < 40;

    // Se tem gênero indie ou é baixa popularidade com indie keywords, é independente
    return hasIndieGenre || (isLowPopularity && genresLowercased.length < 3);
  } catch {
    // Se houver erro ao verificar artista, assume que não é independente
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Recebemos o 'type' (album, track ou 'independent' para buscar ambos)
  const { q, type = 'all' } = req.query;

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
    // LÓGICA PARA BUSCAR TANTO TRACKS QUANTO ÁLBUNS (DEFAULT)
    // ========================================================================
    if (type === 'all' || type === 'independent') {
      // Busca paralela de tracks e álbuns
      const [tracksResponse, albumsResponse] = await Promise.all([
        spotifyApi.searchTracks(q, { limit: 10 }),
        spotifyApi.searchAlbums(q, { limit: 6 })
      ]);

      // =================== PROCESSAMENTO DE TRACKS ===================
      const tracksData = await Promise.all(
        (tracksResponse.body.tracks?.items || []).map(async (track: any) => {
          const minutes = Math.floor(track.duration_ms / 60000);
          const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
          const duration = `${minutes}:${
            Number(seconds) < 10 ? '0' : ''
          }${seconds}`;

          // Detecta se é independente
          const isIndependent = await isIndependentTrack(
            spotifyApi,
            track,
            track.artists[0].id
          );

          return {
            type: 'track',
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            artistId: track.artists[0].id,
            album: track.album.name,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            duration: duration,
            previewUrl: track.preview_url,
            isIndependent: isIndependent,
            popularity: track.popularity
          };
        })
      );

      // =================== PROCESSAMENTO DE ÁLBUNS ===================
      const albumsData = (albumsResponse.body.albums?.items || []).map(
        (album: any) => ({
          type: 'album',
          id: album.id,
          name: album.name,
          artist: album.artists[0].name,
          artistId: album.artists[0].id, // ID do artista para associar reviews
          image: album.images[1]?.url || album.images[0]?.url,
          year: album.release_date.split('-')[0],
          url: album.external_urls.spotify,
          totalTracks: album.total_tracks,
          isIndependent: false // Álbuns como padrão não marcados como independentes
        })
      );

      // Combina e filtra
      let results = [...tracksData, ...albumsData];

      // Se for busca específica por independentes, filtra
      if (type === 'independent') {
        results = results.filter(
          (item: any) => item.isIndependent === true || item.type === 'track'
        );
      }

      return res.status(200).json(results);
    }

    // ========================================================================
    // LÓGICA PARA MÚSICAS (TRACKS) APENAS
    // ========================================================================
    if (type === 'track') {
      const response = await spotifyApi.searchTracks(q, { limit: 6 });

      const tracks = await Promise.all(
        (response.body.tracks?.items || []).map(async (track: any) => {
          const minutes = Math.floor(track.duration_ms / 60000);
          const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
          const duration = `${minutes}:${
            Number(seconds) < 10 ? '0' : ''
          }${seconds}`;

          const isIndependent = await isIndependentTrack(
            spotifyApi,
            track,
            track.artists[0].id
          );

          return {
            type: 'track',
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            artistId: track.artists[0].id,
            album: track.album.name,
            image: track.album.images[1]?.url || track.album.images[0]?.url,
            duration: duration,
            previewUrl: track.preview_url,
            isIndependent: isIndependent,
            popularity: track.popularity
          };
        })
      );

      return res.status(200).json(tracks || []);
    }

    // ========================================================================
    // LÓGICA PADRÃO (ÁLBUNS)
    // ========================================================================
    const response = await spotifyApi.searchAlbums(q, { limit: 6 });

    const albums = response.body.albums?.items.map((album: any) => ({
      type: 'album',
      id: album.id,
      name: album.name,
      artist: album.artists[0].name,
      image: album.images[1]?.url || album.images[0]?.url,
      year: album.release_date.split('-')[0],
      url: album.external_urls.spotify,
      totalTracks: album.total_tracks,
      isIndependent: false
    }));

    res.status(200).json(albums || []);
  } catch (error) {
    console.error('Erro na API Spotify:', error);
    res.status(500).json({ error: 'Falha ao buscar dados' });
  }
}
