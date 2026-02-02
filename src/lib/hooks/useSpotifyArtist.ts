import { useState, useEffect } from 'react';
import type {
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTopTrack
} from '@lib/types/artist';

type UseSpotifyArtistReturn = {
  artist: SpotifyArtist | null;
  albums: SpotifyAlbum[];
  topTracks: SpotifyTopTrack[];
  isLoading: boolean;
  error: Error | null;
};

export function useSpotifyArtist(
  artistId: string | undefined
): UseSpotifyArtistReturn {
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTopTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!artistId) {
      setIsLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Busca dados em paralelo
        const [artistRes, albumsRes, topTracksRes] = await Promise.all([
          fetch(`/api/spotify/artist?id=${artistId}`),
          fetch(`/api/spotify/artist-albums?id=${artistId}&limit=20`),
          fetch(`/api/spotify/artist-top-tracks?id=${artistId}`)
        ]);

        if (!artistRes.ok) {
          throw new Error('Artista não encontrado');
        }

        const artistData = await artistRes.json();
        const albumsData = await albumsRes.json();
        const topTracksData = await topTracksRes.json();

        setArtist(artistData);
        setAlbums(albumsData.albums || []);
        setTopTracks(topTracksData || []);
      } catch (err) {
        console.error('Erro ao buscar artista:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  return { artist, albums, topTracks, isLoading, error };
}
