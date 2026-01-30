import { useState } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { ReviewModal } from '@components/modal/review-modal';
import { SearchBar } from '@components/aside/search-bar';

type InputReviewButtonProps = {
  onReviewSelected?: (review: any) => void;
};

/**
 * Componente que permite ao usuário integrar avaliação de álbum/música
 * diretamente no input de tweet
 */
export function InputReviewButton({
  onReviewSelected
}: InputReviewButtonProps): JSX.Element {
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <Button
        className='custom-button accent-tab accent-bg-tab flex cursor-pointer items-center gap-1
                   py-0 px-3 text-main-accent hover:bg-main-accent/10 active:bg-main-accent/20'
        onClick={() => setShowSearchModal(true)}
        title='Adicionar avaliação de música ou álbum'
      >
        <HeroIcon className='h-4 w-4' iconName='MusicalNoteIcon' />
        <p className='text-sm font-bold'>Avaliar</p>
      </Button>

      {/* Modal de Busca de Música */}
      {showSearchModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className='relative w-full max-w-md rounded-2xl bg-main-background p-6 shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-light-primary dark:text-white'>
                🎵 Buscar Música ou Álbum
              </h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className='text-gray-500 hover:text-light-primary dark:hover:text-white'
              >
                <HeroIcon iconName='XMarkIcon' className='h-6 w-6' />
              </button>
            </div>

            {/* SearchBar integrado */}
            <div className='mb-4'>
              <SearchBar />
            </div>

            <p className='text-center text-sm text-gray-400'>
              Selecione uma música ou álbum para avaliar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
