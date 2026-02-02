import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { HeroIcon } from '@components/ui/hero-icon';

type FriendPlaying = {
  id: string;
  name: string;
  username: string;
  photoURL: string;
  track: {
    name: string;
    artist: string;
    image: string | null;
    spotifyUrl: string;
  };
};

export function FriendsListening(): JSX.Element | null {
  const { user } = useAuth();
  const [friendsPlaying, setFriendsPlaying] = useState<FriendPlaying[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchFriendsPlaying = async () => {
      try {
        // 1. Buscar quem eu sigo
        const followingRef = collection(db, 'users', user.id, 'following');
        const followingSnap = await getDocs(followingRef);

        // Incluir IDs de quem eu sigo + MEU PRÓPRIO ID para teste
        const followingIds = followingSnap.docs.map((d) => d.id);

        // DEBUG: Adicionar o próprio usuário para testar a feature
        // Remova esta linha em produção!
        followingIds.push(user.id);

        // 2. Para cada pessoa que sigo, verificar se tem spotifyTokens e buscar música
        const playingFriends: FriendPlaying[] = [];

        for (const friendId of followingIds) {
          try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            const friendData = friendDoc.data();

            if (!friendData?.spotifyTokens) continue;

            let accessToken = friendData.spotifyTokens.accessToken;

            // Verificar se token expirou
            if (friendData.spotifyTokens.expiresAt < Date.now()) {
              // Token expirado - tentar renovar
              try {
                const refreshResponse = await fetch(
                  '/api/spotify/auth/refresh',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      refresh_token: friendData.spotifyTokens.refreshToken,
                      user_id: friendId
                    })
                  }
                );

                if (refreshResponse.ok) {
                  const newTokenData = await refreshResponse.json();
                  accessToken = newTokenData.access_token;
                } else {
                  continue; // Não conseguiu renovar, pular
                }
              } catch {
                continue; // Erro ao renovar, pular
              }
            }

            // Buscar música atual via API
            const response = await fetch('/api/spotify/me/playing', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });

            if (response.ok) {
              const data = await response.json();

              if (data.isPlaying && data.track) {
                playingFriends.push({
                  id: friendId,
                  name: friendData.name,
                  username: friendData.username,
                  photoURL: friendData.photoURL,
                  track: {
                    name: data.track.name,
                    artist: data.track.artist,
                    image: data.track.image,
                    spotifyUrl: data.track.spotifyUrl
                  }
                });
              }
            }
          } catch (e) {
            // Ignorar erros individuais
            console.warn(`Erro ao buscar música de ${friendId}:`, e);
          }

          // Limitar a 5 amigos para performance
          if (playingFriends.length >= 5) break;
        }

        setFriendsPlaying(playingFriends);
      } catch (error) {
        console.error('Erro ao buscar amigos ouvindo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsPlaying();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchFriendsPlaying, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Não mostrar se não há amigos ouvindo
  if (!isLoading && friendsPlaying.length === 0) return null;

  return (
    <section className='rounded-2xl bg-main-sidebar-background'>
      {/* Header */}
      <div className='flex items-center gap-2 px-4 py-3'>
        <div className='relative flex h-5 w-5 items-center justify-center'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-50' />
          <span className='relative inline-flex h-3 w-3 rounded-full bg-[#1DB954]' />
        </div>
        <h2 className='text-xl font-bold'>Ouvindo agora</h2>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className='space-y-3 px-4 pb-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex animate-pulse items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-light-secondary/20' />
              <div className='flex-1 space-y-1'>
                <div className='h-3 w-20 rounded bg-light-secondary/20' />
                <div className='h-2 w-32 rounded bg-light-secondary/20' />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='space-y-1 pb-2'>
          {friendsPlaying.map((friend) => (
            <Link key={friend.id} href={`/user/${friend.username}`}>
              <a className='flex items-center gap-3 px-4 py-2 transition-colors hover:bg-light-primary/5 dark:hover:bg-dark-primary/5'>
                {/* Avatar com capa do álbum */}
                <div className='relative'>
                  <img
                    src={friend.photoURL}
                    alt={friend.name}
                    className='h-10 w-10 rounded-full object-cover'
                  />
                  {friend.track.image && (
                    <img
                      src={friend.track.image}
                      alt={friend.track.name}
                      className='absolute -bottom-1 -right-1 h-5 w-5 rounded border-2 border-main-sidebar-background object-cover'
                    />
                  )}
                </div>

                {/* Info */}
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-bold text-light-primary dark:text-dark-primary'>
                    {friend.name}
                  </p>
                  <p className='truncate text-xs text-light-secondary dark:text-dark-secondary'>
                    <span className='text-[#1DB954]'>♪</span>{' '}
                    {friend.track.name} • {friend.track.artist}
                  </p>
                </div>

                {/* Equalizer animado */}
                <div className='flex h-4 items-end gap-0.5'>
                  <span
                    className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite] rounded-full bg-[#1DB954]'
                    style={{ height: '40%' }}
                  />
                  <span
                    className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite_0.1s] rounded-full bg-[#1DB954]'
                    style={{ height: '70%' }}
                  />
                  <span
                    className='w-0.5 animate-[equalizer_0.5s_ease-in-out_infinite_0.2s] rounded-full bg-[#1DB954]'
                    style={{ height: '50%' }}
                  />
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
