import { useState } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import { useAuth } from '@lib/context/auth-context';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import { db } from '@lib/firebase/app';
import { toast } from 'react-hot-toast';

type Album = {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  image: string;
  year: string;
};

type Track = {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
  isIndependent?: boolean;
  popularity?: number;
};

type ReviewModalProps = {
  album?: Album;
  track?: Track;
  parent?: { id: string; username: string };
  closeModal: () => void;
};

export function ReviewModal({
  album,
  track,
  parent,
  closeModal
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  // Determine tipo de conteúdo
  const isTrack = !!track;
  const item = track || album;
  const contentType = isTrack ? 'track' : 'album';

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Dê uma nota antes de enviar! ⭐');
      return;
    }

    if (!user || !item) {
      toast.error('Você precisa estar logado.');
      return;
    }

    const safeUsername = user.username || 'usuario';

    setLoading(true);

    try {
      const newReview = {
        text: comment || '',
        images: null,
        userLikes: [],
        createdBy: user.id,
        createdAt: serverTimestamp(),
        updatedAt: null,
        parent: parent || null,
        userReplies: 0,
        userRetweets: [],

        // DADOS DO USUÁRIO (Blindados)
        userPhotoURL: user.photoURL || null,
        userName: user.name || 'Usuário',
        username: safeUsername,
        userUsername: safeUsername,

        // DADOS DA REVIEW
        type: 'review',
        rating: rating,
        ...(isTrack && track
          ? {
              // PARA TRACKS
              track: {
                id: track.id,
                name: track.name,
                artist: track.artist,
                artistId: track.artistId,
                image: track.image,
                album: track.album,
                duration: track.duration,
                previewUrl: track.previewUrl,
                isIndependent: track.isIndependent,
                popularity: track.popularity
              }
            }
          : {
              // PARA ÁLBUNS
              album: {
                id: album!.id,
                name: album!.name,
                artist: album!.artist,
                artistId: album!.artistId,
                image: album!.image,
                year: album!.year || '----'
              }
            })
      };

      console.log('📝 Salvando review:', newReview);

      const docRef = await addDoc(tweetsCollection, newReview);

      console.log('✅ Review salva com ID:', docRef.id);
      console.log('✅ Dados da review:', newReview);

      toast.success(
        `Review de ${contentType === 'track' ? 'música' : 'álbum'} publicada!`
      );

      // Aguarda um pouco para garantir que o documento foi salvo
      // Isso ajuda com o Firestore replicar o documento
      await new Promise((resolve) => setTimeout(resolve, 800));

      closeModal();
    } catch (error) {
      console.error('❌ Erro ao salvar review:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 xs:items-center xs:p-4'
      onClick={closeModal}
    >
      <div
        className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-main-background p-4 shadow-2xl
                   xs:rounded-2xl xs:p-6'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex items-center justify-between xs:mb-6'>
          <h2 className='text-lg font-bold text-light-primary dark:text-white xs:text-xl'>
            Avaliar {contentType === 'track' ? 'Música' : 'Álbum'}
          </h2>
          <button
            type='button'
            onClick={closeModal}
            className='p-2 text-gray-500 hover:text-light-primary dark:hover:text-white'
          >
            <HeroIcon iconName='XMarkIcon' className='h-6 w-6' />
          </button>
        </div>

        {/* ⚠️ Info importante */}
        <div className='mb-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-2 xs:mb-4 xs:p-3'>
          <p className='text-xs text-orange-400'>
            💡 <strong>Dica:</strong> Clique "Publicar" aqui para criar o post
            com a avaliação.
          </p>
        </div>

        {/* Info do Álbum/Música */}
        <div className='mb-4 flex gap-3 border-b border-gray-700 pb-4 xs:mb-6 xs:gap-4 xs:pb-6'>
          <img
            src={item.image}
            alt={item.name}
            className='h-16 w-16 flex-shrink-0 rounded-lg object-cover shadow-md xs:h-20 xs:w-20'
          />
          <div className='flex flex-1 flex-col justify-center'>
            <div className='flex items-center gap-2'>
              <p className='truncate text-base font-bold leading-tight text-light-primary dark:text-white'>
                {item.name}
              </p>
              {isTrack && track?.isIndependent && (
                <span className='flex-shrink-0 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400'>
                  Independente
                </span>
              )}
            </div>
            <p className='text-sm text-gray-400'>{item.artist}</p>
            <p className='mt-1 text-xs text-gray-500'>
              {isTrack
                ? `${track?.album || ''} • ${track?.duration}`
                : album?.year}
            </p>
          </div>
        </div>

        {/* Preview URL para Tracks */}
        {isTrack && track?.previewUrl && (
          <div className='mb-6 flex items-center gap-2 rounded-lg bg-gray-900 p-3'>
            <audio
              controls
              className='h-8 w-full'
              src={track.previewUrl}
              style={{
                colorScheme: 'dark'
              }}
            />
          </div>
        )}

        {/* Estrelas - maiores no mobile para facilitar toque */}
        <div className='mb-4 flex flex-col items-center xs:mb-6'>
          <p className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-300 xs:mb-3'>
            Sua nota
          </p>
          <div className='flex gap-3 xs:gap-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRating(star);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='p-1 transition-transform hover:scale-110 focus:outline-none'
              >
                <HeroIcon
                  iconName='StarIcon'
                  solid={star <= (hoverRating || rating)}
                  className={`h-10 w-10 xs:h-9 xs:w-9 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comentário */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='O que você achou?'
          className='mb-4 w-full resize-none rounded-xl border border-gray-700 bg-main-search-background p-3 text-base text-light-primary placeholder-gray-500 focus:border-main-accent focus:outline-none dark:text-white xs:mb-6 xs:text-sm'
          rows={3}
        />

        {/* Botões - maiores no mobile */}
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={closeModal}
            className='flex-1 rounded-full border border-gray-600 px-4 py-3 font-bold text-light-primary transition hover:bg-gray-800 dark:text-white xs:py-2'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={loading}
            className='flex flex-1 items-center justify-center rounded-full bg-main-accent px-4 py-3 font-bold text-white transition hover:brightness-90 disabled:opacity-50 xs:py-2'
          >
            {loading ? <Loading className='h-5 w-5' /> : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
