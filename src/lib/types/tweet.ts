import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { ImagesPreview } from './file';
import type { User } from './user';

export type Album = {
  id: string;
  name: string;
  artist: string;
  image: string;
  year: string;
};

export type Track = {
  id: string;
  name: string;
  artist: string;
  artistId?: string; // ID do artista para rastreamento
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
  isIndependent?: boolean; // Indica se é música independente
  popularity?: number; // Score de popularidade do Spotify (0-100)
};

export type Lyric = {
  text: string;
  backgroundColor: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImage: string;
  spotifyUrl: string;
};

export type Tweet = {
  id: string;
  text: string | null;
  images: ImagesPreview | null;
  parent: { id: string; username: string } | null;
  userLikes: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  userReplies: number;
  userRetweets: string[];
  type?: 'review' | 'tweet' | 'lyric';
  rating?: number;
  album?: Album;
  track?: Track;
  lyric?: Lyric;
};

export type TweetWithUser = Tweet & { user: User };

export const tweetConverter: FirestoreDataConverter<Tweet> = {
  toFirestore(tweet) {
    return { ...tweet };
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);

    return { id, ...data } as Tweet;
  }
};
