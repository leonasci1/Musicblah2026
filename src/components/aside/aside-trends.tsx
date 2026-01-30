import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
// Importamos como ErrorMessage para não conflitar
import { Error as ErrorMessage } from '@components/ui/error';

// Definindo o tipo dos dados que vêm da API
type Track = {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
  previewUrl: string | null;
};

export function AsideTrends(): JSX.Element {
  const [trends, setTrends] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estado para controlar qual música está tocando
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/spotify/trends')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new globalThis.Error(data.error);
        setTrends(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    // Cleanup: Para o som se o usuário sair da página
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handlePlay = (track: Track) => {
    // Se não tiver prévia, avisa (algumas músicas o Spotify não libera)
    if (!track.previewUrl) {
      alert('Essa música não tem prévia disponível 😢');
      return;
    }

    // Se clicar na mesma música que já está tocando, pausa
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Se já tinha outra tocando, para ela
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Toca a nova música
    const audio = new Audio(track.previewUrl);
    audio.volume = 0.4; // Volume agradável
    audio.play().catch((e) => console.error('Erro ao tocar:', e));

    // Quando acabar, reseta o ícone
    audio.onended = () => setPlayingId(null);

    audioRef.current = audio;
    setPlayingId(track.id);
  };

  return (
    <section className='hover-animation overflow-hidden rounded-2xl border border-gray-700/30 bg-main-sidebar-background'>
      {loading ? (
        <div className='flex justify-center p-4'>
          <Loading />
        </div>
      ) : error ? (
        // CORREÇÃO: Usamos o apelido ErrorMessage aqui
        <ErrorMessage />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='inner:px-4 inner:py-3'
        >
          <h2 className='flex items-center gap-2 border-b border-gray-700/30 px-4 py-3 text-xl font-extrabold'>
            Top Músicas 🎵
          </h2>

          <div className='flex flex-col'>
            {trends.map((track, index) => (
              <div
                key={track.id}
                className='hover-animation group relative flex cursor-pointer items-center 
                           gap-3 p-3 transition-colors hover:bg-gray-800/50'
              >
                {/* Ranking Number */}
                <span className='w-5 text-center text-sm font-bold text-light-secondary dark:text-dark-secondary'>
                  {index + 1}
                </span>

                {/* Capa com Botão de Play */}
                <div
                  className='relative h-12 w-12 flex-shrink-0 cursor-pointer'
                  onClick={(e) => {
                    e.preventDefault(); // Evita abrir o link do post se houver
                    handlePlay(track);
                  }}
                >
                  <img
                    src={track.image}
                    alt={track.name}
                    className={`h-full w-full rounded-md object-cover shadow-sm transition-all duration-300
                      ${
                        playingId === track.id
                          ? 'brightness-50'
                          : 'group-hover:brightness-50'
                      }`}
                  />
                  {/* Ícone sobreposto */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-white
                    ${
                      playingId === track.id
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <HeroIcon
                      iconName={
                        playingId === track.id ? 'PauseIcon' : 'PlayIcon'
                      }
                      className='h-6 w-6 drop-shadow-md'
                    />
                  </div>
                </div>

                {/* Info da Música + Link para Spotify Oficial */}
                <Link href={track.url} passHref legacyBehavior>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex min-w-0 flex-1 flex-col overflow-hidden pl-1'
                  >
                    <p
                      className={`truncate text-sm font-bold leading-tight transition-colors
                      ${
                        playingId === track.id
                          ? 'text-[#1DB954]'
                          : 'text-main-accent'
                      }`}
                    >
                      {track.name}
                    </p>
                    <p className='truncate text-xs text-light-secondary dark:text-dark-secondary'>
                      {track.artist}
                    </p>
                  </a>
                </Link>

                {/* Equalizadorzinho visual (Opcional, só aparece tocando) */}
                {playingId === track.id && (
                  <span className='hidden animate-pulse text-xs font-bold text-[#1DB954] xs:block'>
                    Ouvindo...
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
