import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';

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

export function useSpotifyNowPlaying() {
  const { user } = useAuth();
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);

  // Carregar tokens do usuário do Firebase
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const loadTokens = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        const userData = userDoc.data();

        if (userData?.spotifyTokens) {
          setTokens(userData.spotifyTokens);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Erro ao carregar tokens Spotify:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [user?.id]);

  // Refresh token se expirado
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!tokens?.refreshToken || !user?.id) return null;

    try {
      const response = await fetch('/api/spotify/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken })
      });

      if (!response.ok) {
        // Token inválido, desconectar
        setIsConnected(false);
        setTokens(null);
        return null;
      }

      const data = await response.json();
      const newTokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000
      };

      // Salvar novos tokens no Firebase
      await updateDoc(doc(db, 'users', user.id), {
        spotifyTokens: newTokens
      });

      setTokens(newTokens);
      return newTokens.accessToken;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  }, [tokens, user?.id]);

  // Buscar música atual
  const fetchNowPlaying = useCallback(async () => {
    if (!tokens?.accessToken) return;

    // Verificar se token expirou
    let accessToken = tokens.accessToken;
    if (Date.now() >= tokens.expiresAt) {
      const newToken = await refreshToken();
      if (!newToken) return;
      accessToken = newToken;
    }

    try {
      const response = await fetch('/api/spotify/me/playing', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        // Token expirado, tentar renovar
        const newToken = await refreshToken();
        if (newToken) {
          // Tentar novamente com novo token
          const retryResponse = await fetch('/api/spotify/me/playing', {
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setNowPlaying(data);
          }
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setNowPlaying(data);

        // Salvar no Firestore para que amigos possam ver
        if (user?.id && data.isPlaying && data.track) {
          console.log('🎵 Salvando música no Firestore:', data.track.name);
          try {
            await updateDoc(doc(db, 'users', user.id), {
              currentlyPlaying: {
                isPlaying: true,
                track: data.track,
                updatedAt: Date.now()
              }
            });
            console.log('✅ Música salva com sucesso!');
          } catch (e) {
            console.warn('❌ Erro ao salvar música atual:', e);
          }
        } else if (user?.id && !data.isPlaying) {
          console.log('🎵 Limpando música (não está tocando)');
          // Limpar se não está tocando
          try {
            await updateDoc(doc(db, 'users', user.id), {
              currentlyPlaying: {
                isPlaying: false,
                track: null,
                updatedAt: Date.now()
              }
            });
          } catch (e) {
            console.warn('Erro ao limpar música atual:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar música atual:', error);
    }
  }, [tokens, refreshToken, user?.id]);

  // Polling a cada 10 segundos quando conectado
  useEffect(() => {
    if (!isConnected || !tokens) return;

    // Buscar imediatamente
    fetchNowPlaying();

    // Polling
    const interval = setInterval(fetchNowPlaying, 10000);

    return () => clearInterval(interval);
  }, [isConnected, tokens, fetchNowPlaying]);

  // Função para conectar com Spotify
  const connect = useCallback(() => {
    window.location.href = '/api/spotify/auth/login';
  }, []);

  // Função para desconectar
  const disconnect = useCallback(async () => {
    if (!user?.id) return;

    try {
      await updateDoc(doc(db, 'users', user.id), {
        spotifyTokens: null
      });
      setTokens(null);
      setIsConnected(false);
      setNowPlaying(null);
    } catch (error) {
      console.error('Erro ao desconectar Spotify:', error);
    }
  }, [user?.id]);

  // Salvar tokens quando recebidos via URL
  const saveTokensFromUrl = useCallback(
    async (accessToken: string, refreshToken: string, expiresIn: number) => {
      if (!user?.id) return;

      const newTokens: SpotifyTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000
      };

      try {
        await updateDoc(doc(db, 'users', user.id), {
          spotifyTokens: newTokens
        });
        setTokens(newTokens);
        setIsConnected(true);
      } catch (error) {
        console.error('Erro ao salvar tokens:', error);
      }
    },
    [user?.id]
  );

  return {
    nowPlaying,
    isConnected,
    isLoading,
    connect,
    disconnect,
    saveTokensFromUrl,
    refresh: fetchNowPlaying
  };
}
