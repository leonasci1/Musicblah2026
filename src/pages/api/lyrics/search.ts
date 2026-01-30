import { NextApiRequest, NextApiResponse } from 'next';

// API para buscar letras de músicas usando lyrics.ovh (gratuita)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { artist, track } = req.query;

  if (!artist || !track) {
    return res.status(400).json({ error: 'Artista e música são obrigatórios' });
  }

  try {
    // Usando a API lyrics.ovh que é gratuita e não precisa de autenticação
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        String(artist)
      )}/${encodeURIComponent(String(track))}`
    );

    if (!response.ok) {
      // Tenta uma busca alternativa com nomes simplificados
      const simplifiedArtist = String(artist).split(/[(&,]/)[0].trim();
      const simplifiedTrack = String(track)
        .split(/[(&,\-\(]/)[0]
        .trim();

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
    console.error('Erro ao buscar letra:', error);
    return res.status(500).json({
      error: 'Erro ao buscar letra',
      lyrics: null
    });
  }
}
