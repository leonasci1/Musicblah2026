import { useState, useEffect } from 'react';
import { query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { followedArtistsCollection } from '@lib/firebase/collections';
import { useAuth } from '@lib/context/auth-context';
import type { FollowedArtist, FollowedArtistWithId } from '@lib/types/artist';

type UseFollowedArtistsReturn = {
  artists: FollowedArtistWithId[];
  isLoading: boolean;
  error: Error | null;
};

export function useFollowedArtists(): UseFollowedArtistsReturn {
  const { user } = useAuth();
  const [artists, setArtists] = useState<FollowedArtistWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const q = query(
      followedArtistsCollection,
      where('userId', '==', user.id),
      orderBy('followedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const followedArtists = snapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data()
        })) as FollowedArtistWithId[];

        setArtists(followedArtists);
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar artistas seguidos:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  return { artists, isLoading, error };
}
