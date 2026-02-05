import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${
  GEMINI_API_KEY ?? ''
}`;

type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
  url: string;
  reason: string;
};

type GeminiResponse = {
  recommendations?: SpotifyTrack[];
  error?: string;
  source?: string;
  message?: string;
};

// CACHE simples em memória (reseta quando o servidor reinicia)
// Guarda recomendações por 10 minutos para evitar quota exceeded
const cache: Map<string, { data: SpotifyTrack[]; timestamp: number }> =
  new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

function getCacheKey(reviews: any[]): string {
  // Cria uma chave baseada nos artistas das reviews
  const artists = reviews
    .map((r: any) => r.track?.artist || r.album?.artist || r.artistName)
    .filter(Boolean)
    .sort()
    .join(',');
  return artists || 'no-reviews';
}

// Helper para formatar duração
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Converter track do Spotify para nosso formato
function formatSpotifyTrack(track: any, reason: string): SpotifyTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name ?? 'Desconhecido',
    artistId: track.artists[0]?.id ?? '',
    image: track.album?.images[0]?.url ?? '',
    album: track.album?.name ?? '',
    duration: formatDuration(track.duration_ms),
    previewUrl: track.preview_url,
    url: track.external_urls?.spotify ?? '',
    reason
  };
}

// Músicas brasileiras para fallback
const FALLBACK_QUERIES = [
  {
    name: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    reason: 'Clássico sertanejo'
  },
  {
    name: 'Tempo Perdido',
    artist: 'Legião Urbana',
    reason: 'Rock BR essencial'
  },
  { name: 'Velha Infância', artist: 'Tribalistas', reason: 'MPB moderna' },
  { name: 'Anna Júlia', artist: 'Los Hermanos', reason: 'Indie brasileiro' },
  {
    name: 'Pais e Filhos',
    artist: 'Legião Urbana',
    reason: 'Reflexão atemporal'
  },
  {
    name: 'Lanterna dos Afogados',
    artist: 'Os Paralamas do Sucesso',
    reason: 'Rock BR clássico'
  },
  { name: 'Oceano', artist: 'Djavan', reason: 'Sofisticação BR' },
  {
    name: 'Malandragem',
    artist: 'Cássia Eller',
    reason: 'Interpretação única'
  },
  { name: 'Garota Nacional', artist: 'Skank', reason: 'Hit anos 90' },
  { name: 'Exagerado', artist: 'Cazuza', reason: 'Rock poético' }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeminiResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userReviews } = req.body;

  console.log('🎵 API RECOMMEND chamada - Reviews:', userReviews?.length ?? 0);
  console.log('🔑 GEMINI_API_KEY:', !!GEMINI_API_KEY);

  // Verificar cache primeiro - retorna 5 ALEATÓRIAS do cache
  const cacheKey = getCacheKey(userReviews || []);
  const cached = cache.get(cacheKey);

  if (
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION &&
    cached.data.length > 0
  ) {
    // Embaralha e pega 5 diferentes a cada vez
    const shuffled = [...cached.data].sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, 5);
    console.log(
      '📦 CACHE HIT! Retornando',
      randomSelection.length,
      'aleatórias de',
      cached.data.length
    );
    return res.status(200).json({
      recommendations: randomSelection,
      source: 'cache',
      message: '🤖 Descobertas personalizadas com IA'
    });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID ||
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });

  if (!spotifyApi.getClientId() || !process.env.SPOTIFY_CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: 'Configurações do Spotify não encontradas' });
  }

  try {
    // Autenticar no Spotify
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body.access_token);

    let recommendations: SpotifyTrack[] = [];
    let source = 'fallback';

    // Se tem reviews E tem API key do Gemini, usar IA para descobertas
    if (userReviews && userReviews.length > 0 && GEMINI_API_KEY) {
      try {
        // Preparar resumo das reviews com mais contexto
        const reviewsSummary = userReviews
          .slice(0, 12)
          .map((r: any) => {
            const item = r.track || r.album;
            const name = item?.name || r.trackName || r.albumName;
            const artist = item?.artist || r.artistName;
            const rating = r.rating || 3;
            const comment = r.review || r.comment || '';
            if (!name) return null;
            return `- "${name}" de ${artist} → ${rating}/5 estrelas${
              comment ? ` (comentou: "${comment.slice(0, 60)}")` : ''
            }`;
          })
          .filter(Boolean)
          .join('\n');

        // Separar por notas pra dar mais contexto
        const loved = userReviews.filter((r: any) => (r.rating || 3) >= 4);
        const disliked = userReviews.filter((r: any) => (r.rating || 3) <= 2);

        const lovedArtists = [
          ...new Set(
            loved
              .map(
                (r: any) => r.track?.artist || r.album?.artist || r.artistName
              )
              .filter(Boolean)
          )
        ].slice(0, 5);

        const dislikedArtists = [
          ...new Set(
            disliked
              .map(
                (r: any) => r.track?.artist || r.album?.artist || r.artistName
              )
              .filter(Boolean)
          )
        ].slice(0, 3);

        console.log('❤️ Artistas amados:', lovedArtists);
        console.log('👎 Artistas não curtidos:', dislikedArtists);

        const prompt = `Você é um DJ e curador musical expert. Analise o gosto musical deste usuário e recomende 12 músicas que ele VAI AMAR mas provavelmente NÃO CONHECE ainda.

📊 AVALIAÇÕES DO USUÁRIO:
${reviewsSummary}

❤️ ARTISTAS FAVORITOS (nota 4-5): ${lovedArtists.join(', ') || 'Nenhum ainda'}
👎 NÃO CURTIU (nota 1-2): ${dislikedArtists.join(', ') || 'Nenhum'}

🎯 SUA MISSÃO:
1. Analise os PADRÕES: gêneros, épocas, vibes, instrumentação
2. Recomende músicas de ARTISTAS DIFERENTES dos que ele já conhece
3. Busque DESCOBERTAS: músicas que expandam o gosto dele, não as óbvias
4. Considere: artistas do mesmo gênero mas menos mainstream, colaborações, músicas de outros países com vibe similar
5. EVITE completamente o estilo dos artistas que ele não curtiu
6. VARIEDADE: misture gêneros, épocas e estilos diferentes

EXEMPLOS DE BOAS RECOMENDAÇÕES:
- Se curtiu Djavan → sugira Milton Nascimento, Rubel, Tim Bernardes
- Se curtiu Coldplay → sugira Sigur Rós, Bon Iver, The National
- Se curtiu Kendrick Lamar → sugira J. Cole, Denzel Curry, JID
- Se curtiu Taylor Swift → sugira Phoebe Bridgers, Maggie Rogers, Gracie Abrams

⚠️ REGRAS OBRIGATÓRIAS:
- Músicas REAIS que existem no Spotify
- NENHUMA música dos artistas já avaliados
- 12 artistas DIFERENTES (não repita artista)
- Reasons em português, máximo 40 caracteres

Responda APENAS com JSON válido (sem markdown):
{"suggestions":[
  {"name":"Nome Exato da Música","artist":"Nome Exato do Artista","reason":"Porque combina"},
  ...mais 11 músicas
]}`;

        console.log('🤖 Enviando prompt pro Gemini...');

        const geminiResponse = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 1.0, maxOutputTokens: 1500 }
          })
        });

        console.log('🤖 Gemini status:', geminiResponse.status);

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const textResponse =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

          console.log('🤖 Gemini respondeu:', textResponse?.slice(0, 200));

          if (textResponse) {
            const cleaned = textResponse
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();

            try {
              const parsed = JSON.parse(cleaned);

              if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                console.log(
                  '✅ Gemini sugeriu',
                  parsed.suggestions.length,
                  'músicas'
                );

                // Buscar cada sugestão no Spotify (todas as 12)
                for (const suggestion of parsed.suggestions.slice(0, 12)) {
                  try {
                    const searchQuery = `${suggestion.name} ${suggestion.artist}`;
                    const result = await spotifyApi.searchTracks(searchQuery, {
                      limit: 1
                    });
                    const track = result.body.tracks?.items[0];

                    if (track) {
                      recommendations.push(
                        formatSpotifyTrack(
                          track,
                          suggestion.reason || 'Descoberta pra você'
                        )
                      );
                      console.log(
                        '  ✓ Encontrou:',
                        track.name,
                        '-',
                        track.artists[0]?.name
                      );
                    } else {
                      console.log('  ✗ Não encontrou:', suggestion.name);
                    }
                  } catch (e) {
                    console.log('  ✗ Erro buscando:', suggestion.name);
                  }
                }

                if (recommendations.length >= 3) {
                  source = 'gemini';
                  console.log(
                    '✅ IA funcionou!',
                    recommendations.length,
                    'recomendações no total'
                  );

                  // Salvar TODAS no cache por 10 minutos
                  cache.set(cacheKey, {
                    data: recommendations,
                    timestamp: Date.now()
                  });
                  console.log(
                    '💾 Salvo',
                    recommendations.length,
                    'músicas no cache'
                  );

                  // Retornar só 5 aleatórias agora
                  recommendations = [...recommendations]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5);
                }
              }
            } catch (parseError) {
              console.log('❌ Erro parsing JSON do Gemini:', parseError);
            }
          }
        } else {
          const errorText = await geminiResponse.text();
          console.log('❌ Gemini erro:', errorText.slice(0, 200));
        }
      } catch (geminiError) {
        console.log('⚠️ Gemini falhou:', geminiError);
      }
    }

    // FALLBACK: Se IA não funcionou ou não tem reviews
    if (recommendations.length < 3) {
      console.log('📦 USANDO FALLBACK');
      const shuffled = [...FALLBACK_QUERIES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      for (const item of shuffled) {
        try {
          const result = await spotifyApi.searchTracks(
            `${item.name} ${item.artist}`,
            { limit: 1 }
          );
          const track = result.body.tracks?.items[0];
          if (track) {
            recommendations.push(formatSpotifyTrack(track, item.reason));
          }
        } catch (e) {
          console.log('Erro buscando fallback:', item.name);
        }
      }
      source = 'fallback';
    }

    const messages: Record<string, string> = {
      gemini: '🤖 Descobertas personalizadas com IA',
      fallback: '🎵 Descubra novas músicas (avalie mais para personalizar!)'
    };

    res.status(200).json({
      recommendations: recommendations.slice(0, 5),
      source,
      message: messages[source] || messages.fallback
    });
  } catch (error) {
    console.error('Error in recommend API:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendações' });
  }
}
