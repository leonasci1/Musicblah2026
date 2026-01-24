import Link from 'next/link';
import cn from 'clsx';
import { NextImage } from '@components/ui/next-image';

type UserAvatarProps = {
  src: string;
  alt: string;
  size?: number;
  username?: string;
  className?: string;
  disableLink?: boolean; // ✨ Nova prop
};

export function UserAvatar({
  src,
  alt,
  size = 48,
  username,
  className,
  disableLink
}: UserAvatarProps): JSX.Element {
  const pictureSize = size ?? 48;

  // Proteção: Se não tiver src, usa uma string vazia para não quebrar o NextImage
  // (Idealmente seu NextImage deve tratar isso ou você deve ter um placeholder padrão)
  const safeSrc =
    src ||
    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

  const content = (
    <NextImage
      useSkeleton
      imgClassName='rounded-full'
      width={pictureSize}
      height={pictureSize}
      src={safeSrc}
      alt={alt}
      key={safeSrc}
    />
  );

  // Se não tiver username OU disableLink for true, renderiza sem link
  if (!username || disableLink) {
    return <div className={cn('relative block', className)}>{content}</div>;
  }

  return (
    <Link href={`/user/${username}`}>
      <a className={cn('blur-picture relative block', className)}>{content}</a>
    </Link>
  );
}
