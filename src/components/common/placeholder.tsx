import { BrandLogo } from '@components/common/brand-logo';
import { SEO } from './seo';

export function Placeholder(): JSX.Element {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <SEO
        title='MusicBlah'
        description='From breaking news and entertainment to sports and politics, get the full story with all the live commentary.'
        image='/home.png'
      />
      <div className='flex flex-col items-center justify-center gap-8'>
        <BrandLogo
          signature
          width={380}
          height={120}
          className='h-auto w-[200px] sm:w-[300px] md:w-[380px]'
        />
        <h1 className='text-center font-musicblah-font-extended'>
          <span className='block bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-yellow bg-clip-text text-4xl font-black text-transparent sm:text-5xl md:text-6xl'>
            musicblah
          </span>
          <span className='mt-1 block text-3xl font-black text-main-accent sm:text-4xl md:text-5xl'>
            !
          </span>
        </h1>
      </div>
    </main>
  );
}
