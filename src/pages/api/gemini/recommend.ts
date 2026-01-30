import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Tentando gemini-2.5-flash-lite (mais leve, pode ter quota separada)
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
};

// Helper para formatar duração
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Buscar música no Spotify
async function searchSpotifyTrack(
  spotifyApi: SpotifyWebApi,
  name: string,
  artist: string,
  reason: string
): Promise<SpotifyTrack | null> {
  try {
    const searchQuery = `track:${name} artist:${artist}`;
    const result = await spotifyApi.searchTracks(searchQuery, { limit: 1 });
    const track = result.body.tracks?.items[0];

    if (!track) {
      // Tenta busca mais simples
      const simpleResult = await spotifyApi.searchTracks(`${name} ${artist}`, {
        limit: 1
      });
      const simpleTrack = simpleResult.body.tracks?.items[0];
      if (!simpleTrack) return null;

      return {
        id: simpleTrack.id,
        name: simpleTrack.name,
        artist: simpleTrack.artists[0]?.name ?? artist,
        artistId: simpleTrack.artists[0]?.id ?? '',
        image: simpleTrack.album.images[0]?.url ?? '',
        album: simpleTrack.album.name,
        duration: formatDuration(simpleTrack.duration_ms),
        previewUrl: simpleTrack.preview_url,
        url: simpleTrack.external_urls?.spotify ?? '',
        reason
      };
    }

    return {
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? artist,
      artistId: track.artists[0]?.id ?? '',
      image: track.album.images[0]?.url ?? '',
      album: track.album.name,
      duration: formatDuration(track.duration_ms),
      previewUrl: track.preview_url,
      url: track.external_urls?.spotify ?? '',
      reason
    };
  } catch {
    return null;
  }
}

// Músicas brasileiras para fallback (variadas)
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
  {
    name: 'Eduardo e Mônica',
    artist: 'Legião Urbana',
    reason: 'História musical'
  },
  { name: 'Velha Infância', artist: 'Tribalistas', reason: 'MPB moderna' },
  {
    name: 'Amor I Love You',
    artist: 'Marisa Monte',
    reason: 'MPB sofisticada'
  },
  { name: 'Anna Júlia', artist: 'Los Hermanos', reason: 'Indie brasileiro' },
  {
    name: 'Pais e Filhos',
    artist: 'Legião Urbana',
    reason: 'Reflexão atemporal'
  },
  {
    name: 'Primeiros Erros',
    artist: 'Capital Inicial',
    reason: 'Rock 80s brasileiro'
  },
  {
    name: 'Encontros e Despedidas',
    artist: 'Maria Rita',
    reason: 'Voz marcante'
  },
  {
    name: 'Lanterna dos Afogados',
    artist: 'Os Paralamas do Sucesso',
    reason: 'Rock BR clássico'
  },
  { name: 'Aquarela', artist: 'Toquinho', reason: 'Para todas idades' },
  { name: 'Construção', artist: 'Chico Buarque', reason: 'Obra-prima MPB' },
  { name: 'Águas de Março', artist: 'Elis Regina', reason: 'Bossa Nova' },
  { name: 'Oceano', artist: 'Djavan', reason: 'Sofisticação BR' },
  { name: 'Sozinho', artist: 'Caetano Veloso', reason: 'Tropicália' },
  {
    name: 'Malandragem',
    artist: 'Cássia Eller',
    reason: 'Interpretação única'
  },
  { name: 'Ainda Lembro', artist: 'Marisa Monte', reason: 'Emoção pura' },
  {
    name: 'Meu Erro',
    artist: 'Os Paralamas do Sucesso',
    reason: 'Pop rock BR'
  },
  { name: 'Garota Nacional', artist: 'Skank', reason: 'Hit anos 90' },
  { name: 'É Preciso Saber Viver', artist: 'Titãs', reason: 'Rock reflexivo' },
  { name: 'Exagerado', artist: 'Cazuza', reason: 'Rock poético' },
  { name: 'Como Nossos Pais', artist: 'Elis Regina', reason: 'MPB atemporal' },
  { name: 'Menina Veneno', artist: 'Ritchie', reason: 'Pop 80s' },
  { name: 'Mulher de Fases', artist: 'Raimundos', reason: 'Rock pesado BR' }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeminiResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { userReviews } = req.body;

  // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
  console.log(
    '🎵 API RECOMMEND chamada - Reviews do usuário:',
    userReviews?.length ?? 0
  );
  // eslint-disable-next-line no-console
  console.log('🔑 GEMINI_API_KEY configurada:', !!GEMINI_API_KEY);

  // Inicializar Spotify API
  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID ?? '5b8cd851163d46c5894d3e2de61063f6',
    clientSecret:
      process.env.SPOTIFY_CLIENT_SECRET ?? 'e17183e9f7834551845b85e96f7ec43b'
  });

  try {
    // Autenticar no Spotify
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body.access_token);

    let suggestionsToSearch: Array<{
      name: string;
      artist: string;
      reason: string;
    }> = [];

    // Tentar usar Gemini se tiver reviews e API key
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (GEMINI_API_KEY && userReviews && userReviews.length > 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const reviewsSummary = userReviews
          .slice(0, 10)
          .map((r: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const item = r.track || r.album;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const itemName = item?.name || r.trackName || r.albumName;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const itemArtist = item?.artist || r.artistName || 'Desconhecido';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const itemRating = r.rating || 3;
            if (!itemName) return null;
            return `- "${itemName}" por ${itemArtist} - Nota: ${itemRating}/5`;
          })
          .filter(Boolean)
          .join('\n');

        // eslint-disable-next-line no-console
        console.log('📝 Reviews summary:\n', reviewsSummary || '(vazio)');

        if (reviewsSummary) {
          const prompt = `Você é um especialista em música. Baseado nas avaliações do usuário, sugira 5 músicas.

Avaliações:
${reviewsSummary}

Responda APENAS JSON válido (sem markdown):
{"suggestions":[{"name":"Nome","artist":"Artista","reason":"Motivo curto"}]}

Regras:
- Músicas DIFERENTES das avaliadas
- Considere gênero e notas
- Motivos em português, máximo 25 caracteres
- Músicas reais e populares`;

          const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
            })
          });

          // eslint-disable-next-line no-console
          console.log('🤖 Gemini response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            // eslint-disable-next-line no-console
            console.log(
              '🤖 Gemini raw response:',
              JSON.stringify(data).slice(0, 500)
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const textResponse =
              data.candidates?.[0]?.content?.parts?.[0]?.text;
            // eslint-disable-next-line no-console
            console.log('🤖 Gemini text:', textResponse?.slice(0, 300));
            if (textResponse) {
              const cleaned = textResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
              // eslint-disable-next-line no-console
              console.log('🤖 Cleaned JSON:', cleaned.slice(0, 300));
              const parsed = JSON.parse(cleaned);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                suggestionsToSearch = parsed.suggestions;
                // eslint-disable-next-line no-console
                console.log(
                  '✅ Gemini sugestões parseadas:',
                  suggestionsToSearch.length
                );
              }
            }
          } else {
            const errorText = await response.text();
            // eslint-disable-next-line no-console
            console.log('❌ Gemini error response:', errorText.slice(0, 500));
          }
        }
      } catch (geminiError) {
        // eslint-disable-next-line no-console
        console.log('⚠️ GEMINI FALHOU:', geminiError);
      }
    }

    // Se não conseguiu do Gemini, usar fallback aleatório
    if (suggestionsToSearch.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        '📦 USANDO FALLBACK - Motivo: Gemini não retornou sugestões ou usuário sem reviews'
      );
      // Embaralhar e pegar 5 aleatórias
      const shuffled = [...FALLBACK_QUERIES].sort(() => Math.random() - 0.5);
      suggestionsToSearch = shuffled.slice(0, 5);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        '🤖 IA GEMINI ATIVA! Sugestões personalizadas:',
        suggestionsToSearch.map((s) => s.name)
      );
    }

    // Buscar cada sugestão no Spotify
    // Marcar se veio da IA ou do fallback
    const isAiPowered =
      suggestionsToSearch.length > 0 &&
      !FALLBACK_QUERIES.some((f) => f.name === suggestionsToSearch[0]?.name);

    const spotifyResults: SpotifyTrack[] = [];
    for (const suggestion of suggestionsToSearch.slice(0, 5)) {
      const track = await searchSpotifyTrack(
        spotifyApi,
        suggestion.name,
        suggestion.artist,
        suggestion.reason
      );
      if (track) {
        spotifyResults.push(track);
      }
    }

    // Se não encontrou o suficiente no Spotify, tentar mais do fallback
    if (spotifyResults.length < 3) {
      const moreShuffled = [...FALLBACK_QUERIES].sort(
        () => Math.random() - 0.5
      );
      for (const fallback of moreShuffled) {
        if (spotifyResults.length >= 5) break;
        if (spotifyResults.find((t) => t.name === fallback.name)) continue;

        const track = await searchSpotifyTrack(
          spotifyApi,
          fallback.name,
          fallback.artist,
          fallback.reason
        );
        if (track) spotifyResults.push(track);
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `✅ Retornando ${spotifyResults.length} tracks (IA: ${isAiPowered})`
    );

    res.status(200).json({
      recommendations: spotifyResults,
      source: isAiPowered ? 'gemini' : 'fallback',
      message: isAiPowered
        ? 'Recomendações personalizadas baseadas nas suas reviews'
        : 'Descubra novas músicas (faça reviews para ter sugestões personalizadas)'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in recommend API:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendações' });
  }
}
