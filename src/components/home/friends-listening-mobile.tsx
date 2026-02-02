import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { useWindow } from '@lib/context/window-context';

type FriendPlaying = {
  id: string;
  name: string;
  username: string;
  photoURL: string;
  track: {
    name: string;
    artist: string;
    image: string | null;
  };
};

/**
 * Versão mobile do "Amigos ouvindo" - carrossel horizontal
 * Só aparece em telas menores que 1024px
 */
export function FriendsListeningMobile(): JSX.Element | null {
  const { user } = useAuth();
  const { width } = useWindow();
  const [friendsPlaying, setFriendsPlaying] = useState<FriendPlaying[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchFriendsPlaying = async () => {
      try {
        const followingRef = collection(db, 'users', user.id, 'following');
        const followingSnap = await getDocs(followingRef);

        const followingIds = followingSnap.docs.map((d) => d.id);

        // DEBUG: Adicionar o próprio usuário para testar
        followingIds.push(user.id);

        const playingFriends: FriendPlaying[] = [];

        for (const friendId of followingIds) {
          try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            const friendData = friendDoc.data();

            if (!friendData?.spotifyTokens) continue;
            if (friendData.spotifyTokens.expiresAt < Date.now() - 300000)
              continue;

            const response = await fetch('/api/spotify/me/playing', {
              headers: {
                Authorization: `Bearer ${friendData.spotifyTokens.accessToken}`
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
                    image: data.track.image
                  }
                });
              }
            }
          } catch {
            // Ignorar erros individuais
          }

          if (playingFriends.length >= 10) break;
        }

        setFriendsPlaying(playingFriends);
      } catch (error) {
        console.error('Erro ao buscar amigos ouvindo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsPlaying();
    const interval = setInterval(fetchFriendsPlaying, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Só mostrar no mobile
  if (width >= 1024) return null;

  // Não mostrar se não há amigos ouvindo
  if (!isLoading && friendsPlaying.length === 0) return null;

  return (
    <div className='border-b border-light-border px-4 py-3 dark:border-dark-border'>
      {/* Header */}
      <div className='mb-2 flex items-center gap-2'>
        <div className='relative flex h-3 w-3 items-center justify-center'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-50' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]' />
        </div>
        <span className='text-sm font-bold'>Ouvindo agora</span>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className='flex gap-3 overflow-x-auto pb-2'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex animate-pulse flex-col items-center gap-1'
            >
              <div className='h-14 w-14 rounded-full bg-light-secondary/20' />
              <div className='h-2 w-12 rounded bg-light-secondary/20' />
            </div>
          ))}
        </div>
      ) : (
        /* Carrossel horizontal */
        <div className='scrollbar-hide flex gap-3 overflow-x-auto pb-2'>
          {friendsPlaying.map((friend) => (
            <Link key={friend.id} href={`/user/${friend.username}`}>
              <a className='flex flex-shrink-0 flex-col items-center gap-1'>
                {/* Avatar com borda verde */}
                <div className='relative'>
                  <div className='rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] p-0.5'>
                    <img
                      src={friend.photoURL}
                      alt={friend.name}
                      className='h-14 w-14 rounded-full border-2 border-main-background object-cover'
                    />
                  </div>
                  {/* Mini capa do álbum */}
                  {friend.track.image && (
                    <img
                      src={friend.track.image}
                      alt={friend.track.name}
                      className='absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-main-background object-cover'
                    />
                  )}
                </div>
                {/* Nome */}
                <span className='max-w-[60px] truncate text-xs'>
                  {friend.name.split(' ')[0]}
                </span>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
