import { useState, useEffect } from 'react';
import { query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import type { Tweet as TweetType } from '@lib/types/tweet';

type ArtistCommunityReviewsProps = {
  artistId: string;
  artistName: string;
};

export function ArtistCommunityReviews({
  artistId,
  artistName
}: ArtistCommunityReviewsProps): JSX.Element {
  const [reviews, setReviews] = useState<TweetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Buscar todos os reviews (type = 'review')
        // e filtrar no client-side pelo artistId
        const q = query(
          tweetsCollection,
          where('type', '==', 'review'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const snapshot = await getDocs(q);
        const allReviews = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Criar objeto user a partir dos campos individuais salvos na review
          const user = {
            id: data.createdBy || '',
            name: data.userName || 'Usuário',
            username: data.username || data.userUsername || 'user',
            photoURL: data.userPhotoURL || '/assets/default-avatar.png',
            verified: data.userVerified || false,
            bio: null,
            website: null,
            location: null,
            following: [],
            followers: [],
            createdAt: null,
            updatedAt: null,
            totalTweets: 0,
            totalPhotos: 0,
            pinnedTweet: null,
            coverPhotoURL: null
          };

          return {
            id: doc.id,
            ...data,
            user
          };
        }) as TweetType[];

        // Filtrar por artistId (no track ou album) ou pelo nome do artista
        const artistReviews = allReviews.filter((review) => {
          const trackArtistId = review.track?.artistId;
          const albumArtistId = review.album?.artistId;
          const trackArtistName = review.track?.artist?.toLowerCase();
          const albumArtistName = review.album?.artist?.toLowerCase();
          const artistNameLower = artistName.toLowerCase();

          return (
            trackArtistId === artistId ||
            albumArtistId === artistId ||
            trackArtistName === artistNameLower ||
            albumArtistName === artistNameLower
          );
        });

        setReviews(artistReviews.slice(0, 10));
      } catch (error) {
        console.error('Erro ao buscar reviews:', error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (artistId) {
      fetchReviews();
    }
  }, [artistId, artistName]);

  return (
    <section className='border-t border-light-border dark:border-dark-border'>
      <div className='px-4 py-4'>
        <h2 className='text-lg font-bold text-light-primary dark:text-dark-primary'>
          O que estão falando
        </h2>
        <p className='text-sm text-light-secondary dark:text-dark-secondary'>
          Reviews da comunidade sobre {artistName}
        </p>
      </div>

      {isLoading ? (
        <Loading className='py-8' />
      ) : reviews.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <HeroIcon
            iconName='ChatBubbleLeftRightIcon'
            className='mb-3 h-12 w-12 text-light-secondary dark:text-dark-secondary'
          />
          <p className='text-light-secondary dark:text-dark-secondary'>
            Nenhuma avaliação ainda
          </p>
          <p className='mt-1 text-sm text-light-secondary dark:text-dark-secondary'>
            Seja o primeiro a avaliar!
          </p>
        </div>
      ) : (
        <div>
          {reviews.map((tweet) => (
            <Tweet key={tweet.id} {...tweet} />
          ))}
        </div>
      )}
    </section>
  );
}
