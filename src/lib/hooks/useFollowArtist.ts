import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { followedArtistsCollection } from '@lib/firebase/collections';
import { useAuth } from '@lib/context/auth-context';
import { getAffinityLevel } from '@lib/types/artist';
import type { FollowedArtist, SpotifyArtist } from '@lib/types/artist';

type UseFollowArtistReturn = {
  isFollowing: boolean;
  isLoading: boolean;
  followData: FollowedArtist | null;
  follow: (artist: SpotifyArtist) => Promise<void>;
  unfollow: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
};

export function useFollowArtist(artistId: string): UseFollowArtistReturn {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followData, setFollowData] = useState<FollowedArtist | null>(null);
  const [docId, setDocId] = useState<string | null>(null);

  // Verifica se já está seguindo
  useEffect(() => {
    if (!user?.id || !artistId) {
      setIsLoading(false);
      return;
    }

    const q = query(
      followedArtistsCollection,
      where('userId', '==', user.id),
      where('artistId', '==', artistId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setIsFollowing(true);
        setFollowData(doc.data() as FollowedArtist);
        setDocId(doc.id);
      } else {
        setIsFollowing(false);
        setFollowData(null);
        setDocId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, artistId]);

  const follow = useCallback(
    async (artist: SpotifyArtist) => {
      if (!user?.id || isFollowing) return;

      setIsLoading(true);
      try {
        const newFollow: Omit<FollowedArtist, 'id'> = {
          userId: user.id,
          artistId: artist.id,
          artistName: artist.name,
          artistImage: artist.image,
          genres: artist.genres,
          notifications: true,
          followedAt: serverTimestamp() as any,
          reviewsCount: 0,
          averageRating: 0,
          affinityLevel: getAffinityLevel(0),
          lastReviewAt: null
        };

        await addDoc(followedArtistsCollection, newFollow);
      } catch (error) {
        console.error('Erro ao seguir artista:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isFollowing]
  );

  const unfollow = useCallback(async () => {
    if (!docId) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(followedArtistsCollection, docId));
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [docId]);

  const toggleNotifications = useCallback(async () => {
    if (!docId || !followData) return;

    try {
      await updateDoc(doc(followedArtistsCollection, docId), {
        notifications: !followData.notifications
      });
    } catch (error) {
      console.error('Erro ao alterar notificações:', error);
      throw error;
    }
  }, [docId, followData]);

  return {
    isFollowing,
    isLoading,
    followData,
    follow,
    unfollow,
    toggleNotifications
  };
}
