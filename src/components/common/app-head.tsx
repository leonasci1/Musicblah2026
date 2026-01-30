import Head from 'next/head';

export function AppHead(): JSX.Element {
  return (
    <Head>
      <title>MusicBlah</title>
      <meta name='og:title' content='MusicBlah' />

      <link rel='icon' href='/assets/logo-purple.png' />
      <link rel='apple-touch-icon' href='/assets/logo-purple.png' />

      {/* Verifique se o nome do arquivo é manifest.json ou site.webmanifest na sua pasta public */}
      <link rel='manifest' href='/site.webmanifest' key='site-manifest' />

      <meta property='og:site_name' content='MusicBlah' />
      <meta property='og:type' content='website' />
    </Head>
  );
}
