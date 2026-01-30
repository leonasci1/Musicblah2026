import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { SearchBar } from '@components/aside/search-bar';
import { ReviewModal } from '@components/modal/review-modal';
import { LyricModal } from '@components/modal/lyric-modal';
import { variants } from './input';
import { ProgressBar } from './progress-bar';
import type { ChangeEvent, ClipboardEvent } from 'react';
import type { IconName } from '@components/ui/hero-icon';

type Album = {
  id: string;
  name: string;
  artist: string;
  image: string;
  year: string;
  url: string;
  totalTracks: number;
  type: 'album';
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
  type: 'track';
};

type Options = {
  name: string;
  iconName: IconName;
  disabled: boolean;
  onClick?: () => void;
}[];

const options: Readonly<Options> = [
  {
    name: 'Media',
    iconName: 'PhotoIcon',
    disabled: false
  },
  {
    name: 'GIF',
    iconName: 'GifIcon',
    disabled: true
  },
  {
    name: 'Poll',
    iconName: 'ChartBarIcon',
    disabled: true
  },
  {
    name: 'Emoji',
    iconName: 'FaceSmileIcon',
    disabled: true
  },
  {
    name: 'Schedule',
    iconName: 'CalendarDaysIcon',
    disabled: true
  },
  {
    name: 'Location',
    iconName: 'MapPinIcon',
    disabled: true
  }
];

type LyricData = {
  track: {
    id: string;
    name: string;
    artist: string;
    album: string;
    image: string;
    url: string;
  };
  lyricText: string;
  backgroundColor: string;
};

type InputOptionsProps = {
  reply?: boolean;
  modal?: boolean;
  parent?: { id: string; username: string };
  inputLimit: number;
  inputLength: number;
  isValidTweet: boolean;
  isCharLimitExceeded: boolean;
  handleImageUpload: (
    e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
  ) => void;
  onLyricSubmit?: (data: LyricData) => void;
};

export function InputOptions({
  reply,
  modal,
  parent,
  inputLimit,
  inputLength,
  isValidTweet,
  isCharLimitExceeded,
  handleImageUpload,
  onLyricSubmit
}: InputOptionsProps): JSX.Element {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [showLyricModal, setShowLyricModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const onClick = (): void => inputFileRef.current?.click();

  const handleLyricSubmit = (data: LyricData): void => {
    if (onLyricSubmit) {
      onLyricSubmit(data);
    }
    setShowLyricModal(false);
  };

  let filteredOptions = options;

  if (reply)
    filteredOptions = filteredOptions.filter(
      (_, index) => ![2, 4].includes(index)
    );

  return (
    <>
      <motion.div className='flex justify-between' {...variants}>
        <div className='flex text-main-accent'>
          {/* Botão de Avaliação de Música */}
          <Button
            className='accent-tab accent-bg-tab group relative rounded-full p-2 
                       hover:bg-main-accent/10 active:bg-main-accent/20'
            onClick={() => setShowMusicSearch(true)}
            disabled={false}
            title='Adicionar avaliação de música ou álbum'
          >
            <HeroIcon className='h-5 w-5' iconName='MusicalNoteIcon' />
            <ToolTip tip='Avaliar' modal={modal} />
          </Button>

          {/* Botão de Lyric Card */}
          <Button
            className='accent-tab accent-bg-tab group relative rounded-full p-2 
                       hover:bg-main-accent/10 active:bg-main-accent/20'
            onClick={() => setShowLyricModal(true)}
            disabled={false}
            title='Compartilhar trecho de letra'
          >
            <HeroIcon
              className='h-5 w-5'
              iconName='ChatBubbleBottomCenterTextIcon'
            />
            <ToolTip tip='Letra' modal={modal} />
          </Button>

          <input
            className='hidden'
            type='file'
            accept='image/*,video/*'
            onChange={handleImageUpload}
            ref={inputFileRef}
            multiple
          />

          {/* Outros botões - escondidos em mobile */}
          <div className='contents xs:[&>button:nth-child(n+5)]:hidden md:[&>button]:!block [&>button:nth-child(n+3)]:hidden'>
            {filteredOptions.map(({ name, iconName, disabled }, index) => (
              <Button
                className='accent-tab accent-bg-tab group relative rounded-full p-2 
                           hover:bg-main-accent/10 active:bg-main-accent/20'
                onClick={index === 0 ? onClick : undefined}
                disabled={disabled}
                key={name}
              >
                <HeroIcon className='h-5 w-5' iconName={iconName} />
                <ToolTip tip={name} modal={modal} />
              </Button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <motion.div
            className='flex items-center gap-4'
            animate={
              inputLength ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
            }
          >
            <ProgressBar
              modal={modal}
              inputLimit={inputLimit}
              inputLength={inputLength}
              isCharLimitExceeded={isCharLimitExceeded}
            />
            {!reply && (
              <>
                <i className='hidden h-8 w-[1px] bg-[#B9CAD3] dark:bg-[#3E4144] xs:block' />
                <Button
                  className='group relative hidden rounded-full border border-light-line-reply p-[1px]
                             text-main-accent dark:border-light-secondary xs:block'
                  disabled
                >
                  <HeroIcon className='h-5 w-5' iconName='PlusIcon' />
                  <ToolTip tip='Adicionar' modal={modal} />
                </Button>
              </>
            )}
          </motion.div>
          <Button
            type='submit'
            className='accent-tab bg-main-accent px-4 py-1.5 font-bold text-white
                       enabled:hover:bg-main-accent/90
                       enabled:active:bg-main-accent/75'
            disabled={!isValidTweet}
          >
            {reply ? 'Responder' : 'Postar'}
          </Button>
        </div>
      </motion.div>

      {/* Modal de Busca e Avaliação - Responsivo para Mobile */}
      {showMusicSearch && (
        <div
          className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 xs:items-center xs:p-4'
          onClick={() => setShowMusicSearch(false)}
        >
          <div
            className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-main-background p-4 shadow-2xl 
                       xs:rounded-2xl xs:p-6'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-4 flex items-center justify-between xs:mb-6'>
              <h2 className='text-lg font-bold text-light-primary dark:text-white xs:text-xl'>
                🎵 Buscar Música ou Álbum
              </h2>
              <button
                onClick={() => setShowMusicSearch(false)}
                className='p-2 text-gray-500 hover:text-light-primary dark:hover:text-white'
              >
                <HeroIcon iconName='XMarkIcon' className='h-6 w-6' />
              </button>
            </div>

            {/* SearchBar em modo controlado */}
            <SearchBar
              showReviewModal={false}
              onSelectAlbum={(album) => {
                setSelectedAlbum(album);
              }}
              onSelectTrack={(track) => {
                setSelectedTrack(track);
              }}
            />

            <p className='text-center text-sm text-gray-400'>
              Selecione uma música ou álbum para avaliar
            </p>
          </div>
        </div>
      )}

      {/* ReviewModal para Álbum */}
      {selectedAlbum && (
        <ReviewModal
          album={selectedAlbum}
          parent={parent}
          closeModal={() => {
            setSelectedAlbum(null);
            setShowMusicSearch(false);
          }}
        />
      )}

      {/* ReviewModal para Track */}
      {selectedTrack && (
        <ReviewModal
          track={selectedTrack}
          parent={parent}
          closeModal={() => {
            setSelectedTrack(null);
            setShowMusicSearch(false);
          }}
        />
      )}

      {/* LyricModal para compartilhar letras */}
      <LyricModal
        open={showLyricModal}
        closeModal={() => setShowLyricModal(false)}
        onSubmit={handleLyricSubmit}
      />
    </>
  );
}
