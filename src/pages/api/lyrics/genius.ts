import { NextApiRequest, NextApiResponse } from 'next';

// API para buscar letras usando Genius (melhor cobertura)
// Genius não fornece letras diretamente via API, mas podemos:
// 1. Buscar a música no Genius
// 2. Retornar o link para a página de letras
// 3. Ou usar web scraping (com cuidado)

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

type GeniusSearchResult = {
  id: number;
  title: string;
  artist: string;
  url: string;
  thumbnail: string;
  lyricsState: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { artist, track } = req.query;

  if (!artist || !track) {
    return res.status(400).json({ error: 'Artista e música são obrigatórios' });
  }

  // Se não tiver token do Genius, fallback para lyrics.ovh
  if (!GENIUS_ACCESS_TOKEN) {
    return fallbackToLyricsOvh(String(artist), String(track), res);
  }

  try {
    // Busca no Genius
    const searchQuery = `${track} ${artist}`;
    const searchResponse = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('Erro Genius API:', searchResponse.status);
      return fallbackToLyricsOvh(String(artist), String(track), res);
    }

    const searchData = await searchResponse.json();
    const hits = searchData.response?.hits || [];

    if (hits.length === 0) {
      // Tenta lyrics.ovh como fallback
      return fallbackToLyricsOvh(String(artist), String(track), res);
    }

    // Pega o melhor resultado
    const bestHit = hits[0].result;

    // Retorna os dados do Genius (link para letra)
    const result: GeniusSearchResult = {
      id: bestHit.id,
      title: bestHit.title,
      artist: bestHit.primary_artist?.name || artist,
      url: bestHit.url,
      thumbnail: bestHit.song_art_image_thumbnail_url,
      lyricsState: bestHit.lyrics_state
    };

    // Agora tenta buscar a letra real via lyrics.ovh (Genius não dá letra direta)
    const lyricsResponse = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        result.artist
      )}/${encodeURIComponent(result.title)}`
    );

    if (lyricsResponse.ok) {
      const lyricsData = await lyricsResponse.json();
      return res.status(200).json({
        lyrics: lyricsData.lyrics,
        source: 'genius+lyrics.ovh',
        geniusUrl: result.url,
        thumbnail: result.thumbnail
      });
    }

    // Se não encontrou letra, retorna só os dados do Genius
    return res.status(200).json({
      lyrics: null,
      source: 'genius',
      geniusUrl: result.url,
      thumbnail: result.thumbnail,
      message: 'Letra não disponível, mas você pode ver no Genius'
    });
  } catch (error) {
    console.error('Erro ao buscar no Genius:', error);
    return fallbackToLyricsOvh(String(artist), String(track), res);
  }
}

// Fallback para lyrics.ovh
async function fallbackToLyricsOvh(
  artist: string,
  track: string,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(track)}`
    );

    if (!response.ok) {
      // Tenta com nomes simplificados
      const simplifiedArtist = artist.split(/[(&,]/)[0].trim();
      const simplifiedTrack = track.split(/[(&,\-\(]/)[0].trim();

      const altResponse = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(
          simplifiedArtist
        )}/${encodeURIComponent(simplifiedTrack)}`
      );

      if (!altResponse.ok) {
        return res.status(404).json({
          error: 'Letra não encontrada',
          lyrics: null
        });
      }

      const altData = await altResponse.json();
      return res.status(200).json({
        lyrics: altData.lyrics,
        source: 'lyrics.ovh'
      });
    }

    const data = await response.json();
    return res.status(200).json({
      lyrics: data.lyrics,
      source: 'lyrics.ovh'
    });
  } catch (error) {
    console.error('Erro lyrics.ovh fallback:', error);
    return res.status(500).json({
      error: 'Erro ao buscar letra',
      lyrics: null
    });
  }
}
