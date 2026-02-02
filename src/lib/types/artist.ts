import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

// ========================================================================
// TIPOS DO SPOTIFY (dados vindos da API)
// ========================================================================

export type SpotifyArtist = {
  id: string;
  name: string;
  image: string | null;
  genres: string[];
  popularity: number;
  followersCount: number;
  spotifyUrl: string;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string;
  totalTracks: number;
  albumType: 'album' | 'single' | 'ep' | 'compilation';
  spotifyUrl: string;
};

export type SpotifyTopTrack = {
  id: string;
  name: string;
  image: string | null;
  previewUrl: string | null;
  durationMs: number;
  popularity: number;
};

// ========================================================================
// TIPOS DO FIREBASE (dados que salvamos)
// ========================================================================

export type AffinityLevel =
  | 'curious'
  | 'listener'
  | 'fan'
  | 'superfan'
  | 'expert';

export type FollowedArtist = {
  id: string;

  // Usuário
  userId: string;

  // Dados do artista (do Spotify, salvos para acesso rápido)
  artistId: string;
  artistName: string;
  artistImage: string | null;
  genres: string[];

  // Configurações
  notifications: boolean;
  followedAt: Timestamp;

  // Stats calculadas
  reviewsCount: number;
  averageRating: number;
  affinityLevel: AffinityLevel;
  lastReviewAt: Timestamp | null;
};

export type FollowedArtistWithId = FollowedArtist & { docId: string };

// Converter para Firestore
export const followedArtistConverter: FirestoreDataConverter<FollowedArtist> = {
  toFirestore(artist) {
    return { ...artist };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as FollowedArtist;
  }
};

// ========================================================================
// HELPERS
// ========================================================================

export function getAffinityLevel(reviewsCount: number): AffinityLevel {
  if (reviewsCount === 0) return 'curious';
  if (reviewsCount <= 3) return 'listener';
  if (reviewsCount <= 10) return 'fan';
  if (reviewsCount <= 20) return 'superfan';
  return 'expert';
}

export function getAffinityEmoji(level: AffinityLevel): string {
  const emojis: Record<AffinityLevel, string> = {
    curious: '👀',
    listener: '🎧',
    fan: '❤️',
    superfan: '🔥',
    expert: '🏆'
  };
  return emojis[level];
}

export function getAffinityLabel(level: AffinityLevel): string {
  const labels: Record<AffinityLevel, string> = {
    curious: 'Curioso',
    listener: 'Ouvinte',
    fan: 'Fã',
    superfan: 'Superfã',
    expert: 'Expert'
  };
  return labels[level];
}
