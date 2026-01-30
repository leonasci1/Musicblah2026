import { useState, useEffect, useRef, ReactNode } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { ReviewModal } from '@components/modal/review-modal';

// ✅ TIPO ALBUM
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

// ✅ TIPO TRACK (Expandido)
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

type SearchResult = Album | Track;

type SearchBarProps = {
  // Modo controlado (opcional)
  onSelectAlbum?: (album: Album) => void;
  onSelectTrack?: (track: Track) => void;
  parent?: { id: string; username: string };
  children?: ReactNode;
  showReviewModal?: boolean; // Se false, não abre modal de review
};

export function SearchBar({
  onSelectAlbum,
  onSelectTrack,
  parent,
  showReviewModal = true,
  children
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca Automática (Debounce) - Agora busca tracks E álbuns
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        // Busca ambos (tracks e álbuns) por padrão
        const res = await fetch(`/api/spotify/search?q=${query}&type=all`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    console.log('🎵 Resultado selecionado:', result);

    if (result.type === 'album') {
      const album = result as Album;
      console.log('📀 Álbum selecionado:', album.name);

      // Modo controlado - só chama callback, não seta estado interno
      if (onSelectAlbum) {
        console.log('📢 Chamando callback onSelectAlbum');
        onSelectAlbum(album);
      } else {
        // Modo interno - seta estado para abrir modal próprio
        setSelectedAlbum(album);
      }
    } else {
      const track = result as Track;
      console.log('🎶 Track selecionada:', track.name);

      // Modo controlado - só chama callback, não seta estado interno
      if (onSelectTrack) {
        console.log('📢 Chamando callback onSelectTrack');
        onSelectTrack(track);
      } else {
        // Modo interno - seta estado para abrir modal próprio
        setSelectedTrack(track);
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <div ref={containerRef} className='group relative z-50 mb-4'>
        {/* 🔍 Barra de Pesquisa */}
        <div
          className={`
          flex items-center rounded-full border border-transparent bg-main-search-background 
          px-4 py-2 transition-colors
          focus-within:border-main-accent focus-within:bg-main-background
          ${isOpen ? 'border-main-accent bg-main-background' : ''}
        `}
        >
          <HeroIcon
            iconName='MagnifyingGlassIcon'
            className='mr-3 h-5 w-5 text-gray-500'
          />
          <input
            type='text'
            placeholder='Avaliar um álbum ou música...'
            className='w-full border-none bg-transparent text-white placeholder-gray-500 outline-none'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
          />
          {loading && (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-main-accent border-t-transparent' />
          )}
        </div>

        {/* 📦 Resultados */}
        {isOpen && results.length > 0 && (
          <div className='absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-gray-700 bg-black py-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]'>
            <div className='mb-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500'>
              Escolha para avaliar
            </div>

            {results.map((result) => (
              <div
                key={result.id}
                className='group flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-3 transition-colors hover:border-main-accent hover:bg-gray-800/80'
                onClick={() => handleSelectResult(result)}
              >
                {/* Capa do Álbum/Música */}
                <div className='relative h-12 w-12 flex-shrink-0'>
                  <img
                    src={result.image}
                    alt={result.name}
                    className='h-full w-full rounded-md object-cover shadow-sm group-hover:brightness-110'
                  />
                  {/* Badge para músicas independentes */}
                  {result.type === 'track' && result.isIndependent && (
                    <div className='absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-500 text-center text-xs font-bold text-white'>
                      ⚡
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className='flex flex-1 flex-col overflow-hidden'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate text-sm font-bold text-white transition-colors group-hover:text-main-accent'>
                      {result.name}
                    </span>
                    {result.type === 'track' && result.isIndependent && (
                      <span className='ml-auto flex-shrink-0 whitespace-nowrap rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400'>
                        Independente
                      </span>
                    )}
                  </div>
                  <span className='truncate text-xs text-gray-400'>
                    {result.artist}
                    {result.type === 'album' ? (
                      <> • {(result as Album).year}</>
                    ) : (
                      <> • {(result as Track).album}</>
                    )}
                  </span>
                  <span className='mt-0.5 text-[10px] text-gray-600'>
                    {result.type === 'album'
                      ? `${(result as Album).totalTracks} faixas`
                      : `${(result as Track).duration} • ${
                          (result as Track).popularity || 0
                        } popularidade`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Review para Álbum - Controlado */}
      {showReviewModal && selectedAlbum && (
        <ReviewModal
          album={selectedAlbum}
          parent={parent}
          closeModal={() => setSelectedAlbum(null)}
        />
      )}

      {/* Modal de Review para Track - Controlado */}
      {showReviewModal && selectedTrack && (
        <ReviewModal
          track={selectedTrack}
          parent={parent}
          closeModal={() => setSelectedTrack(null)}
        />
      )}

      {children}
    </>
  );
}
