import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './modal';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';

type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
};

type LyricModalProps = {
  open: boolean;
  closeModal: () => void;
  onSubmit: (data: {
    track: SpotifyTrack;
    lyricText: string;
    backgroundColor: string;
  }) => void;
};

const COLORS = [
  { name: 'Roxo', value: 'from-purple-900 to-purple-600', bg: '#581c87' },
  { name: 'Rosa', value: 'from-pink-900 to-pink-600', bg: '#831843' },
  { name: 'Azul', value: 'from-blue-900 to-blue-600', bg: '#1e3a8a' },
  { name: 'Verde', value: 'from-green-900 to-green-600', bg: '#14532d' },
  { name: 'Laranja', value: 'from-orange-900 to-orange-600', bg: '#7c2d12' },
  { name: 'Vermelho', value: 'from-red-900 to-red-600', bg: '#7f1d1d' },
  { name: 'Ciano', value: 'from-cyan-900 to-cyan-600', bg: '#164e63' },
  { name: 'Âmbar', value: 'from-amber-900 to-amber-600', bg: '#78350f' }
];

const MAX_LINES = 4;

export function LyricModal({
  open,
  closeModal,
  onSubmit
}: LyricModalProps): JSX.Element {
  const [step, setStep] = useState<'search' | 'lyrics' | 'preview'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  // Lyrics state
  const [lyricsLines, setLyricsLines] = useState<string[]>([]);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setStep('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedTrack(null);
      setLyricsLines([]);
      setSelectedLines([]);
      setLoadingLyrics(false);
      setLyricsError(null);
      setManualMode(false);
      setManualText('');
      setSelectedColor(COLORS[0]);
    }
  }, [open]);

  // Buscar músicas
  const handleSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(
          searchQuery
        )}&type=track&limit=6`
      );
      const data = await res.json();

      const tracks = Array.isArray(data)
        ? data.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artist,
            album: track.album,
            image: track.image,
            url: `https://open.spotify.com/track/${track.id}`
          }))
        : [];

      setSearchResults(tracks);
    } catch (err) {
      console.error('Erro ao buscar músicas:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Buscar letra da música
  const fetchLyrics = async (track: SpotifyTrack): Promise<void> => {
    setLoadingLyrics(true);
    setLyricsError(null);
    setManualMode(false);

    try {
      const res = await fetch(
        `/api/lyrics/search?artist=${encodeURIComponent(
          track.artist
        )}&track=${encodeURIComponent(track.name)}`
      );
      const data = await res.json();

      if (data.lyrics) {
        // Dividir em linhas e filtrar linhas vazias
        const lines = data.lyrics
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && !line.startsWith('['));

        if (lines.length > 0) {
          setLyricsLines(lines);
        } else {
          setLyricsError('Letra não encontrada');
          setManualMode(true);
        }
      } else {
        setLyricsError('Letra não encontrada para esta música');
        setManualMode(true);
      }
    } catch {
      setLyricsError('Erro ao buscar letra');
      setManualMode(true);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleSelectTrack = (track: SpotifyTrack): void => {
    setSelectedTrack(track);
    setSelectedLines([]);
    setStep('lyrics');
    void fetchLyrics(track);
  };

  const handleToggleLine = (index: number): void => {
    setSelectedLines((prev) => {
      if (prev.includes(index)) {
        // Remover linha
        return prev.filter((i) => i !== index);
      } else if (prev.length < MAX_LINES) {
        // Adicionar linha (em ordem)
        return [...prev, index].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const getSelectedLyricsText = (): string => {
    if (manualMode) return manualText.trim();
    return selectedLines.map((i) => lyricsLines[i]).join('\n');
  };

  const handleSubmit = (): void => {
    const lyricText = getSelectedLyricsText();
    if (!selectedTrack || !lyricText) return;

    onSubmit({
      track: selectedTrack,
      lyricText,
      backgroundColor: selectedColor.value
    });
    closeModal();
  };

  const canProceed = manualMode
    ? manualText.trim().length > 0
    : selectedLines.length > 0;

  return (
    <Modal
      modalClassName='max-w-xl bg-main-background w-full p-6 rounded-2xl'
      open={open}
      closeModal={closeModal}
    >
      <div className='flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <HeroIcon
              iconName='MusicalNoteIcon'
              className='h-6 w-6 text-main-accent'
            />
            <h2 className='text-xl font-bold text-light-primary dark:text-dark-primary'>
              {step === 'search' && 'Escolha uma música'}
              {step === 'lyrics' && 'Selecione as linhas'}
              {step === 'preview' && 'Preview do card'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className='rounded-full p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10'
            title='Fechar'
          >
            <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
          </button>
        </div>

        {/* Step 1: Search */}
        {step === 'search' && (
          <div className='flex flex-col gap-4'>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Buscar música ou artista...'
                value={searchQuery}
                onChange={(e): void => setSearchQuery(e.target.value)}
                onKeyDown={(e): void => {
                  if (e.key === 'Enter') void handleSearch();
                }}
                className='flex-1 rounded-full border border-light-border bg-transparent px-4 py-2 
                  text-light-primary outline-none focus:border-main-accent 
                  dark:border-dark-border dark:text-dark-primary'
              />
              <Button
                className='bg-main-accent px-4 py-2 font-bold text-white hover:bg-main-accent/90'
                onClick={(): void => void handleSearch()}
                disabled={searching}
              >
                {searching ? <Loading className='h-5 w-5' /> : 'Buscar'}
              </Button>
            </div>

            {/* Results */}
            <div className='max-h-80 overflow-y-auto'>
              {searchResults.length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {searchResults.map((track) => (
                    <button
                      key={track.id}
                      onClick={(): void => handleSelectTrack(track)}
                      className='flex items-center gap-3 rounded-xl p-2 text-left transition-colors
                        hover:bg-light-primary/10 dark:hover:bg-dark-primary/10'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={track.image}
                        alt={track.name}
                        className='h-12 w-12 rounded-lg object-cover'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='truncate font-semibold text-light-primary dark:text-dark-primary'>
                          {track.name}
                        </p>
                        <p className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
                          {track.artist}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery && !searching ? (
                <p className='py-8 text-center text-light-secondary dark:text-dark-secondary'>
                  Nenhum resultado encontrado
                </p>
              ) : (
                <p className='py-8 text-center text-light-secondary dark:text-dark-secondary'>
                  Busque uma música para começar
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Lyrics Selection */}
        {step === 'lyrics' && selectedTrack && (
          <div className='flex flex-col gap-4'>
            {/* Selected Track */}
            <div className='flex items-center gap-3 rounded-xl bg-light-primary/5 p-3 dark:bg-dark-primary/5'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTrack.image}
                alt={selectedTrack.name}
                className='h-14 w-14 rounded-lg object-cover'
              />
              <div className='min-w-0 flex-1'>
                <p className='truncate font-bold text-light-primary dark:text-dark-primary'>
                  {selectedTrack.name}
                </p>
                <p className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
                  {selectedTrack.artist}
                </p>
              </div>
              <button
                onClick={(): void => setStep('search')}
                className='text-sm text-main-accent hover:underline'
              >
                Trocar
              </button>
            </div>

            {/* Loading State */}
            {loadingLyrics && (
              <div className='flex flex-col items-center gap-2 py-8'>
                <Loading className='h-8 w-8' />
                <p className='text-light-secondary dark:text-dark-secondary'>
                  Buscando letra...
                </p>
              </div>
            )}

            {/* Lyrics Lines Selection */}
            {!loadingLyrics && !manualMode && lyricsLines.length > 0 && (
              <>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                    Toque nas linhas para selecionar (máx. {MAX_LINES})
                  </p>
                  <span className='rounded-full bg-main-accent/20 px-2 py-1 text-xs font-semibold text-main-accent'>
                    {selectedLines.length}/{MAX_LINES}
                  </span>
                </div>

                <div className='max-h-64 overflow-y-auto rounded-xl border border-light-border p-2 dark:border-dark-border'>
                  {lyricsLines.map((line, index) => (
                    <button
                      key={index}
                      onClick={(): void => handleToggleLine(index)}
                      disabled={
                        !selectedLines.includes(index) &&
                        selectedLines.length >= MAX_LINES
                      }
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all
                        ${
                          selectedLines.includes(index)
                            ? 'bg-main-accent text-white'
                            : 'text-light-primary hover:bg-light-primary/10 dark:text-dark-primary dark:hover:bg-dark-primary/10'
                        }
                        ${
                          !selectedLines.includes(index) &&
                          selectedLines.length >= MAX_LINES
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }
                      `}
                    >
                      {selectedLines.includes(index) && (
                        <span className='mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-main-accent'>
                          {selectedLines.indexOf(index) + 1}
                        </span>
                      )}
                      {line}
                    </button>
                  ))}
                </div>

                <button
                  onClick={(): void => setManualMode(true)}
                  className='text-center text-sm text-main-accent hover:underline'
                >
                  Prefiro digitar manualmente
                </button>
              </>
            )}

            {/* Manual Mode or Error */}
            {!loadingLyrics && manualMode && (
              <>
                {lyricsError && (
                  <div className='rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-500'>
                    {lyricsError}. Digite o trecho manualmente:
                  </div>
                )}

                <textarea
                  placeholder='Digite o trecho da letra aqui... (máx. 4 linhas)'
                  value={manualText}
                  onChange={(e): void => setManualText(e.target.value)}
                  rows={4}
                  className='w-full resize-none rounded-xl border border-light-border bg-transparent p-4 
                    text-light-primary outline-none focus:border-main-accent 
                    dark:border-dark-border dark:text-dark-primary'
                />

                {lyricsLines.length > 0 && (
                  <button
                    onClick={(): void => {
                      setManualMode(false);
                      setManualText('');
                    }}
                    className='text-center text-sm text-main-accent hover:underline'
                  >
                    Voltar para seleção de linhas
                  </button>
                )}
              </>
            )}

            {/* Color Selection */}
            {!loadingLyrics && (
              <div>
                <p className='mb-2 text-sm font-semibold text-light-secondary dark:text-dark-secondary'>
                  Cor do fundo
                </p>
                <div className='flex flex-wrap gap-2'>
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={(): void => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        selectedColor.name === color.name
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-main-background'
                          : ''
                      }`}
                      style={{ backgroundColor: color.bg }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!loadingLyrics && (
              <div className='flex gap-2'>
                <Button
                  className='flex-1 border border-light-border py-2 font-bold text-light-primary 
                    hover:bg-light-primary/10 dark:border-dark-border dark:text-dark-primary'
                  onClick={(): void => setStep('search')}
                >
                  Voltar
                </Button>
                <Button
                  className='flex-1 bg-main-accent py-2 font-bold text-white hover:bg-main-accent/90 
                    disabled:cursor-not-allowed disabled:opacity-50'
                  onClick={(): void => setStep('preview')}
                  disabled={!canProceed}
                >
                  Preview
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && selectedTrack && (
          <div className='flex flex-col gap-4'>
            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedColor.value} p-6`}
            >
              {/* Background blur image */}
              <div
                className='absolute inset-0 opacity-20'
                style={{
                  backgroundImage: `url(${selectedTrack.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(40px)'
                }}
              />

              {/* Content */}
              <div className='relative z-10 flex flex-col gap-4'>
                {/* Lyric text */}
                <div className='text-center'>
                  {getSelectedLyricsText()
                    .split('\n')
                    .map((line, i) => (
                      <p
                        key={i}
                        className='text-lg font-bold leading-relaxed text-white drop-shadow-lg'
                      >
                        {line}
                      </p>
                    ))}
                </div>

                {/* Track info */}
                <div className='flex items-center justify-center gap-3'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedTrack.image}
                    alt={selectedTrack.name}
                    className='h-10 w-10 rounded-lg shadow-lg'
                  />
                  <div className='text-center'>
                    <p className='font-semibold text-white'>
                      {selectedTrack.name}
                    </p>
                    <p className='text-sm text-white/70'>
                      {selectedTrack.artist}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                className='flex-1 border border-light-border py-2 font-bold text-light-primary 
                  hover:bg-light-primary/10 dark:border-dark-border dark:text-dark-primary'
                onClick={(): void => setStep('lyrics')}
              >
                Editar
              </Button>
              <Button
                className='flex-1 bg-main-accent py-2 font-bold text-white hover:bg-main-accent/90'
                onClick={handleSubmit}
              >
                Postar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
