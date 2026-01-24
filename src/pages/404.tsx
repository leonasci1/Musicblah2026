import Link from 'next/link';
import { useTheme } from '@lib/context/theme-context';
import { SEO } from '@components/common/seo';
import { BrandLogo } from '@components/common/brand-logo';

export default function NotFound(): JSX.Element {
  const { theme } = useTheme();

  const isDarkMode = ['dim', 'dark'].includes(theme);

  return (
    <>
      <SEO
        title='Página não encontrada / MusicBlah'
        description='Desculpe, não conseguimos encontrar a página que você estava procurando.'
        image='/404.png'
      />
      <div className='flex min-h-screen flex-col items-center justify-center bg-main-background px-4'>
        {/* Gradient Background Effect */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute top-0 right-0 h-96 w-96 rounded-full bg-main-accent/10 blur-3xl'></div>
          <div className='absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl'></div>
        </div>

        {/* Content */}
        <div className='relative z-10 max-w-md text-center'>
          {/* Logo - Já está posicionado aqui */}
          <div className='mb-8 flex justify-center'>
            <BrandLogo width={80} height={80} />
          </div>

          {/* Error Code */}
          <h1 className='mb-4 bg-gradient-to-r from-main-accent via-accent-cyan to-main-accent bg-clip-text text-9xl font-bold text-transparent'>
            404
          </h1>

          {/* Message */}
          <h2 className='mb-4 text-3xl font-bold text-light-primary dark:text-white'>
            Página não encontrada
          </h2>

          <p className='mb-8 text-lg text-light-secondary dark:text-dark-secondary'>
            A página que você está procurando desapareceu como uma música
            deletada. Vamos voltar ao groove?
          </p>

          {/* Action Button */}
          <Link href='/home'>
            <a className='mb-6 inline-block rounded-full bg-main-accent px-8 py-3 font-bold text-white transition-opacity duration-200 hover:opacity-90'>
              Voltar ao Home
            </a>
          </Link>

          {/* Alternative Links */}
          <div className='flex justify-center gap-6 text-sm'>
            <Link href='/trends'>
              <a className='text-main-accent transition-colors hover:underline'>
                Trends
              </a>
            </Link>
            <span className='text-light-secondary dark:text-dark-secondary'>
              •
            </span>
            <Link href='/bookmarks'>
              <a className='text-main-accent transition-colors hover:underline'>
                Bookmarks
              </a>
            </Link>
            <span className='text-light-secondary dark:text-dark-secondary'>
              •
            </span>
            <Link href='/people'>
              <a className='text-main-accent transition-colors hover:underline'>
                People
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
