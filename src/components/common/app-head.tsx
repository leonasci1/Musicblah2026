import Head from 'next/head';

export function AppHead(): JSX.Element {
  return (
    <Head>
      <title>MusicBlah</title>
      <meta name='og:title' content='MusicBlah' />

      {/* CORREÇÃO: Remova o "/public". O Next.js já entende que arquivos em public/ estão na raiz / */}
      {/* Além disso, usamos encodeURIComponent para lidar com o caractere especial "í" e o espaço */}
      <link rel='icon' href='/assets/s%C3%ADmbolo%20roxo@3x.png' />
      <link rel='apple-touch-icon' href='/assets/s%C3%ADmbolo%20roxo@3x.png' />

      {/* Verifique se o nome do arquivo é manifest.json ou site.webmanifest na sua pasta public */}
      <link rel='manifest' href='/site.webmanifest' key='site-manifest' />

      <meta name='twitter:site' content='@leandremo' />
      <meta name='twitter:card' content='summary_large_image' />
    </Head>
  );
}
