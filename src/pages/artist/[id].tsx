import { useRouter } from 'next/router';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { ArtistHeader } from '@components/artist/artist-header';
import { ArtistDiscography } from '@components/artist/artist-discography';
import { ArtistTopTracks } from '@components/artist/artist-top-tracks';
import { ArtistCommunityReviews } from '@components/artist/artist-community-reviews';
import { useSpotifyArtist } from '@lib/hooks/useSpotifyArtist';
import { ProtectedLayout, HomeLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import type { ReactElement, ReactNode } from 'react';

export default function ArtistPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;

  const { artist, albums, topTracks, isLoading, error } = useSpotifyArtist(
    id as string
  );

  return (
    <MainContainer>
      <SEO
        title={artist ? `${artist.name} / MusicBlah` : 'Artista / MusicBlah'}
      />

      <MainHeader
        useActionButton
        title={artist?.name || 'Artista'}
        action={() => router.back()}
      />

      {isLoading ? (
        <Loading className='mt-5' />
      ) : error ? (
        <Error message='Erro ao carregar artista' />
      ) : artist ? (
        <div className='pb-8'>
          {/* Header com foto, nome, botão seguir */}
          <ArtistHeader artist={artist} />

          {/* Top Tracks */}
          {topTracks.length > 0 && (
            <ArtistTopTracks tracks={topTracks} artistName={artist.name} />
          )}

          {/* Discografia */}
          {albums.length > 0 && (
            <ArtistDiscography albums={albums} artistName={artist.name} />
          )}

          {/* Reviews da comunidade */}
          <ArtistCommunityReviews
            artistId={artist.id}
            artistName={artist.name}
          />
        </div>
      ) : null}
    </MainContainer>
  );
}

ArtistPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
