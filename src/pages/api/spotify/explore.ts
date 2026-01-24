import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import SpotifyWebApi from 'spotify-web-api-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { genre } = req.query;

  // CURADORIA MANUAL COMPLETA (Baseada nos Charts Oficiais 2025/2026)
  const ARTIST_NAMES: Record<string, string[]> = {
    // --- MUNDO ---

    // Pop Global (Mainstream)
    'pop-global': [
      'The Weeknd',
      'Taylor Swift',
      'Bad Bunny',
      'Sabrina Carpenter',
      'Dua Lipa',
      'Ariana Grande',
      'Billie Eilish',
      'Bruno Mars',
      'Lady Gaga',
      'Olivia Rodrigo',
      'Justin Bieber',
      'Miley Cyrus',
      'Katy Perry',
      'SZA',
      'Doja Cat',
      'Harry Styles'
    ],

    // Heavy Metal Internacional
    'Metalcore Internacional': [
      'Metallica',
      'Slipknot',
      'System Of A Down',
      'Iron Maiden',
      'Black Sabbath',
      'Rammstein',
      'Avenged Sevenfold',
      'Korn',
      'Megadeth',
      'Slayer',
      'Judas Priest',
      'Gojira',
      'Bring Me The Horizon',
      'Pantera',
      'Deftones',
      'Ghost'
    ],

    // Rock Classics & Modern
    'rock-int': [
      'Linkin Park',
      'Queen',
      'The Beatles',
      'Nirvana',
      'Red Hot Chili Peppers',
      'AC/DC',
      "Guns N' Roses",
      'Foo Fighters',
      'Green Day',
      'Bon Jovi',
      'Pink Floyd',
      'Radiohead',
      'The Rolling Stones',
      'Pearl Jam'
    ],

    // Indie & Alternative Global (Onde está o Hype atual)
    'indie-int': [
      'Djo', // Joe Keery (Viral "End of Beginning")
      'Arctic Monkeys',
      'Tame Impala',
      'The Neighbourhood',
      'Lana Del Rey',
      'The Strokes',
      'Glass Animals',
      'Mitski',
      'Florence + The Machine',
      'Clairo',
      'Vampire Weekend',
      'Wallows',
      'Cage The Elephant',
      'Twenty One Pilots',
      'Hozier'
    ],

    // Hip-Hop & Rap US
    'hip-hop-int': [
      'Kendrick Lamar',
      'Drake',
      'Travis Scott',
      'Playboi Carti',
      'Tyler, The Creator',
      'Kanye West',
      'Eminem',
      '21 Savage',
      'Post Malone',
      'Nicki Minaj',
      'Cardi B',
      'Megan Thee Stallion',
      'Future',
      'Metro Boomin',
      'J. Cole',
      'A$AP Rocky'
    ],

    // --- BRASIL ---

    // Metal Brasileiro (Orgulho Nacional)
    'Metalcore BR': [
      'Sepultura',
      'Angra',
      'Krisiun',
      'Crypta',
      'Nervosa',
      'Ratos de Porão',
      'Shaman',
      'Soulfly',
      'Viper',
      'Korzus',
      'Claustrofobia',
      'Torture Squad',
      'Black Pantera',
      'Project46',
      'Sarcófago'
    ],

    // Sertanejo Hits
    sertanejo: [
      'Henrique & Juliano',
      'Marília Mendonça',
      'Gusttavo Lima',
      'Ana Castela',
      'Jorge & Mateus',
      'Zé Neto & Cristiano',
      'Simone Mendes',
      'Luan Santana',
      'Matheus & Kauan',
      'Israel & Rodolffo',
      'Maiara & Maraisa',
      'Hugo & Guilherme'
    ],

    // Trap & Rap Brasil (A Cena Urbana)
    'rap-trap-br': [
      'Matuê',
      'Veigh',
      'KayBlack',
      'MC Cabelinho',
      'Orochi',
      'Filipe Ret',
      'L7NNON',
      'Tz da Coronel',
      'Xamã',
      'BK',
      'Djonga',
      "Racionais MC's",
      'Poze do Rodo',
      'Chefin',
      'Oruam',
      'Major RD',
      'Wiu'
    ],

    // Funk Hits
    'funk-br': [
      'MC Ryan SP',
      'MC IG',
      'MC Kevin O Chris',
      'MC Hariel',
      'MC PH',
      'MC Paiva ZS',
      'MC Daniel',
      'Livinho',
      'MC Kevin',
      'DJ GBR',
      'Ludmilla',
      'Pedro Sampaio'
    ],

    // Pop Nacional
    'pop-br': [
      'Anitta',
      'Luísa Sonza',
      'Pabllo Vittar',
      'Gloria Groove',
      'Jão',
      'Marina Sena',
      'Iza',
      'Léo Santana',
      'Ivete Sangalo',
      'Silva',
      'Duda Beat'
    ],

    // Rock Brasileiro
    'rock-br': [
      'Legião Urbana',
      'Charlie Brown Jr.',
      'Skank',
      'Capital Inicial',
      'Titãs',
      'Pitty',
      'Engenheiros do Hawaii',
      'CPM 22',
      'Raimundos',
      'Os Paralamas do Sucesso',
      'Detonautas',
      'Nando Reis'
    ],

    // Emo Brasileiro (Nostalgia 2000)
    'emo-br': [
      'NX Zero',
      'Fresno',
      'Restart',
      'Pitty',
      'Hevo84',
      'Cine',
      'Fake Number',
      'Hateen',
      'Forfun',
      'Strike',
      'Ponto Nulo No Céu',
      'menores atos',
      'Dead Fish'
    ],

    // Indie Brasileiro
    'indie-br': [
      'Gilsons',
      'Terno Rei',
      'Lagum',
      'Jovem Dionisio',
      'ANAVITÓRIA',
      'Rubel',
      'Liniker',
      'Baco Exu do Blues',
      'Tim Bernardes',
      'O Grilo',
      'Boogarins'
    ],

    // MPB & Bossa Nova (Clássicos)
    'mpb-classica': [
      'Caetano Veloso',
      'Gilberto Gil',
      'Chico Buarque',
      'Elis Regina',
      'Gal Costa',
      'Tom Jobim',
      'Djavan',
      'Milton Nascimento',
      'Jorge Ben Jor',
      'Tim Maia',
      'Marisa Monte',
      'Seu Jorge'
    ]
  };

  // Validação simples
  if (!genre || typeof genre !== 'string' || !ARTIST_NAMES[genre]) {
    // Retorna lista vazia em vez de erro para não quebrar a UI
    return res.status(200).json([]);
  }

  const spotifyApi = new SpotifyWebApi({
    clientId:
      process.env.SPOTIFY_CLIENT_ID || '5b8cd851163d46c5894d3e2de61063f6',
    clientSecret:
      process.env.SPOTIFY_CLIENT_SECRET || 'e17183e9f7834551845b85e96f7ec43b'
  });

  try {
    // 1. Autenticação
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    const targetNames = ARTIST_NAMES[genre];

    // 2. Busca Paralela de Alta Performance
    // Mapeia cada nome para uma promessa de busca na API
    const searchPromises = targetNames.map(
      (name) =>
        spotifyApi
          .searchArtists(name, { limit: 1 })
          .then((res: any) => res.body.artists?.items[0])
          .catch(() => null) // Se um falhar, não quebra os outros
    );

    const results = await Promise.all(searchPromises);

    // 3. Formatação e Limpeza
    const foundArtists = results
      .filter((artist: any) => artist && artist.id) // Remove nulos
      .map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        username: artist.id,
        // Formata visualmente: 1000000 -> 1M
        listeners: new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short'
        }).format(artist.followers.total),
        image: artist.images?.[0]?.url || null,
        popularity: artist.popularity
      }))
      // 4. Ordenação por Relevância Atual (Live Popularity)
      // Garante que o artista mais ouvido DO MOMENTO fique em 1º lugar
      .sort((a: any, b: any) => b.popularity - a.popularity);

    res.status(200).json(foundArtists);
  } catch (error) {
    console.error('Erro geral na API:', error);
    // Retorna vazio para a tela não travar
    res.status(200).json([]);
  }
}
