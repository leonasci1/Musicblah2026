import { NextApiRequest, NextApiResponse } from 'next';

// API para buscar letras no Vagalume (excelente para músicas brasileiras!)
// Funciona sem API key para buscas básicas

type VagalumeResponse = {
  type: string;
  art?: {
    id: string;
    name: string;
    url: string;
  };
  mus?: Array<{
    id: string;
    name: string;
    url: string;
    text: string;
    translate?: Array<{
      id: string;
      lang: number;
      url: string;
      text: string;
    }>;
  }>;
  badwords?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { artist, track } = req.query;

  if (!artist || !track) {
    return res.status(400).json({ error: 'Artista e música são obrigatórios' });
  }

  try {
    const artistName = String(artist);
    const trackName = String(track);

    // Vagalume usa o nome do artista e música na URL
    // Formato: https://api.vagalume.com.br/search.php?art=ARTISTA&mus=MUSICA
    const vagalumeUrl = `https://api.vagalume.com.br/search.php?art=${encodeURIComponent(
      artistName
    )}&mus=${encodeURIComponent(trackName)}`;

    const response = await fetch(vagalumeUrl);

    if (!response.ok) {
      return res.status(404).json({
        error: 'Erro ao buscar no Vagalume',
        lyrics: null
      });
    }

    const data: VagalumeResponse = await response.json();

    // Verifica se encontrou a música
    if (data.type === 'notfound' || !data.mus || data.mus.length === 0) {
      // Tenta busca simplificada (remove feat., parênteses, etc.)
      const simplifiedArtist = artistName.split(/[(&,]/)[0].trim();
      const simplifiedTrack = trackName
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*-\s*.*$/, '')
        .trim();

      if (simplifiedArtist !== artistName || simplifiedTrack !== trackName) {
        const altUrl = `https://api.vagalume.com.br/search.php?art=${encodeURIComponent(
          simplifiedArtist
        )}&mus=${encodeURIComponent(simplifiedTrack)}`;

        const altResponse = await fetch(altUrl);

        if (altResponse.ok) {
          const altData: VagalumeResponse = await altResponse.json();

          if (
            altData.type !== 'notfound' &&
            altData.mus &&
            altData.mus.length > 0
          ) {
            const song = altData.mus[0];
            return res.status(200).json({
              lyrics: song.text,
              source: 'vagalume',
              artist: altData.art?.name || simplifiedArtist,
              track: song.name,
              url: song.url ? `https://www.vagalume.com.br${song.url}` : null,
              translation: song.translate?.[0]?.text || null
            });
          }
        }
      }

      return res.status(404).json({
        error: 'Letra não encontrada no Vagalume',
        lyrics: null
      });
    }

    // Encontrou! Retorna a letra
    const song = data.mus[0];

    return res.status(200).json({
      lyrics: song.text,
      source: 'vagalume',
      artist: data.art?.name || artistName,
      track: song.name,
      url: song.url ? `https://www.vagalume.com.br${song.url}` : null,
      translation: song.translate?.[0]?.text || null
    });
  } catch (error) {
    console.error('Erro ao buscar no Vagalume:', error);
    return res.status(500).json({
      error: 'Erro interno ao buscar letra',
      lyrics: null
    });
  }
}
