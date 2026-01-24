import Link from 'next/link';
import { SEO } from '@components/common/seo';
import { BrandLogo } from '@components/common/brand-logo';

export default function Redirect(): JSX.Element {
  return (
    <>
      <SEO
        title='Redirecionando / MusicBlah'
        description='Você está sendo redirecionado.'
      />
      <div className='flex min-h-screen flex-col items-center justify-center bg-main-background px-4'>
        {/* Gradient Background Effect */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute top-0 right-0 h-96 w-96 rounded-full bg-main-accent/10 blur-3xl'></div>
          <div className='absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl'></div>
        </div>

        {/* Content */}
        <div className='relative z-10 max-w-md text-center'>
          {/* Logo */}
          <div className='mb-8 flex animate-pulse justify-center'>
            <BrandLogo width={80} height={80} />
          </div>

          {/* Message */}
          <h2 className='mb-4 text-2xl font-bold text-light-primary dark:text-white'>
            Um momento...
          </h2>

          <p className='mb-8 text-lg text-light-secondary dark:text-dark-secondary'>
            Você está sendo redirecionado. Se nada acontecer, clique abaixo.
          </p>

          {/* Action Button */}
          <Link href='/home'>
            <a className='inline-block rounded-full bg-main-accent px-8 py-3 font-bold text-white transition-opacity duration-200 hover:opacity-90'>
              Ir para Home
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}
