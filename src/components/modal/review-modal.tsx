import { useState } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import { useAuth } from '@lib/context/auth-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { toast } from 'react-hot-toast';

type ReviewModalProps = {
  album: {
    id: string;
    name: string;
    artist: string;
    image: string;
    year: string;
  };
  closeModal: () => void;
};

export function ReviewModal({ album, closeModal }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Dê uma nota antes de enviar! ⭐');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    // 🛡️ CORREÇÃO: Removemos "user.email" pois o TypeScript não reconhece essa propriedade no tipo User.
    // Agora ele tenta usar o username e, se não existir, usa 'usuario'.
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
        parent: null,
        userReplies: 0,
        userRetweets: [],

        // DADOS DO USUÁRIO (Blindados)
        userPhotoURL: user.photoURL || null,
        userName: user.name || 'Usuário',
        username: safeUsername, // ✅ Agora usa a variável corrigida
        userUsername: safeUsername, // ✅ Compatibilidade

        // DADOS DA REVIEW
        type: 'review',
        rating: rating,
        album: {
          id: album.id,
          name: album.name,
          artist: album.artist,
          image: album.image,
          year: album.year || '----'
        }
      };

      await addDoc(collection(db, 'tweets'), newReview);

      toast.success('Review publicada!');
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={closeModal}
    >
      <div
        className='relative w-full max-w-md rounded-2xl bg-main-background p-6 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-light-primary dark:text-white'>
            Avaliar Álbum
          </h2>
          <button
            onClick={closeModal}
            className='text-gray-500 hover:text-light-primary dark:hover:text-white'
          >
            <HeroIcon iconName='XMarkIcon' className='h-6 w-6' />
          </button>
        </div>

        {/* Info do Álbum */}
        <div className='mb-6 flex gap-4 border-b border-gray-700 pb-6'>
          <img
            src={album.image}
            alt={album.name}
            className='h-20 w-20 rounded-lg object-cover shadow-md'
          />
          <div className='flex flex-col justify-center'>
            <p className='text-base font-bold leading-tight text-light-primary dark:text-white'>
              {album.name}
            </p>
            <p className='text-sm text-gray-400'>{album.artist}</p>
            <p className='mt-1 text-xs text-gray-500'>{album.year}</p>
          </div>
        </div>

        {/* Estrelas */}
        <div className='mb-6 flex flex-col items-center'>
          <p className='mb-3 text-sm font-medium text-gray-600 dark:text-gray-300'>
            Sua nota
          </p>
          <div className='flex gap-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='transition-transform hover:scale-110 focus:outline-none'
              >
                <HeroIcon
                  iconName='StarIcon'
                  solid={star <= (hoverRating || rating)}
                  className={`h-9 w-9 ${
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
          className='mb-6 w-full resize-none rounded-xl border border-gray-700 bg-main-search-background p-3 text-sm text-light-primary placeholder-gray-500 focus:border-main-accent focus:outline-none dark:text-white'
          rows={4}
        />

        {/* Botões */}
        <div className='flex gap-3'>
          <button
            onClick={closeModal}
            className='flex-1 rounded-full border border-gray-600 px-4 py-2 font-bold text-light-primary transition hover:bg-gray-800 dark:text-white'
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='flex flex-1 items-center justify-center rounded-full bg-main-accent px-4 py-2 font-bold text-white transition hover:brightness-90 disabled:opacity-50'
          >
            {loading ? <Loading className='h-5 w-5' /> : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
