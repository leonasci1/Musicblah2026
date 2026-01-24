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
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
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
  type?: 'review' | 'tweet';
  rating?: number;
  album?: Album;
  track?: Track;
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
