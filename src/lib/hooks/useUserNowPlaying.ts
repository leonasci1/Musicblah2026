import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  image: string | null;
  durationMs: number;
  previewUrl: string | null;
  spotifyUrl: string;
};

type NowPlayingData = {
  isPlaying: boolean;
  progressMs?: number;
  track: SpotifyTrack | null;
};

type SpotifyTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

/**
 * Hook para buscar o "Ouvindo agora" de qualquer usuário
 * Usado para visitantes verem o que o dono do perfil está ouvindo
 */
export function useUserNowPlaying(userId: string | null) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar tokens do usuário e depois a música atual
  const fetchNowPlaying = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Buscar tokens do usuário no Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData?.spotifyTokens) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      const tokens: SpotifyTokens = userData.spotifyTokens;
      setIsConnected(true);

      // Verificar se token expirou
      if (tokens.expiresAt < Date.now()) {
        // Token expirado - tentar renovar via API
        try {
          const refreshResponse = await fetch('/api/spotify/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              refresh_token: tokens.refreshToken,
              user_id: userId
            })
          });

          if (!refreshResponse.ok) {
            console.warn('Token expirado e não foi possível renovar');
            setIsLoading(false);
            return;
          }

          const newTokenData = await refreshResponse.json();
          tokens.accessToken = newTokenData.access_token;
        } catch {
          console.warn('Erro ao renovar token');
          setIsLoading(false);
          return;
        }
      }

      // Buscar música atual
      const response = await fetch('/api/spotify/me/playing', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });

      if (response.status === 204) {
        // Nada tocando
        setNowPlaying({ isPlaying: false, track: null });
      } else if (response.ok) {
        const data = await response.json();
        setNowPlaying(data);
      }
    } catch (error) {
      console.error('Erro ao buscar música atual:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Buscar ao montar e fazer polling a cada 15 segundos
  useEffect(() => {
    fetchNowPlaying();

    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  return {
    nowPlaying,
    isConnected,
    isLoading,
    refresh: fetchNowPlaying
  };
}
