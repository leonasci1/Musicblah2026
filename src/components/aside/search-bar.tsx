import { useState, useEffect, useRef } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { ReviewModal } from '@components/modal/review-modal';

// ✅ CORREÇÃO 1: O tipo agora usa 'year' para bater com a API
type Album = {
  id: string;
  name: string;
  artist: string;
  image: string;
  year: string; // Antes era releaseDate
  url: string;
  totalTracks: number;
};

export function SearchBar(): JSX.Element {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
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

  // Busca Automática (Debounce)
  useEffect(() => {
    if (query.length < 2) {
      setAlbums([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${query}`);
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

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
            placeholder='Avaliar um álbum...'
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
        {isOpen && albums.length > 0 && (
          <div className='absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-gray-700 bg-black py-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]'>
            <div className='mb-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500'>
              Escolha para avaliar
            </div>

            {albums.map((album) => (
              <div
                key={album.id}
                className='group flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-3 transition-colors hover:border-main-accent hover:bg-gray-800/80'
                onClick={() => {
                  setSelectedAlbum(album);
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                {/* Capa do Álbum */}
                <div className='relative h-12 w-12 flex-shrink-0'>
                  <img
                    src={album.image}
                    alt={album.name}
                    className='h-full w-full rounded-md object-cover shadow-sm group-hover:brightness-110'
                  />
                </div>

                {/* Informações */}
                <div className='flex flex-col overflow-hidden'>
                  <span className='truncate text-sm font-bold text-white transition-colors group-hover:text-main-accent'>
                    {album.name}
                  </span>
                  <span className='truncate text-xs text-gray-400'>
                    {/* ✅ CORREÇÃO 2: Usando album.year aqui */}
                    {album.artist} • {album.year}
                  </span>
                  <span className='mt-0.5 text-[10px] text-gray-600'>
                    {album.totalTracks} faixas
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Review */}
      {selectedAlbum && (
        <ReviewModal
          album={selectedAlbum}
          closeModal={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
}
