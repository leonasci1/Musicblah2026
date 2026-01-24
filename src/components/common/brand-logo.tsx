import { NextImage } from '@components/ui/next-image';
import { useTheme } from '@lib/context/theme-context';
import type { CSSProperties } from 'react';

type BrandLogoProps = {
  width?: number;
  height?: number;
  className?: string;
  signature?: boolean; // show signature logo (logo-type.png)
  style?: CSSProperties;
};

// Mapeamento dos novos nomes de arquivo
const LOGO_FILES = {
  purple: 'logo-purple.png',
  yellow: 'logo-yellow.png',
  cyan: 'logo-cyan.png',
  signature: 'logo-type.png'
} as const;

function resolveFile(accent: string | undefined, signature?: boolean): string {
  // Se for solicitado a assinatura (logo escrito)
  if (signature) return `/assets/${LOGO_FILES.signature}`;

  // Se for apenas o ícone, escolhe a cor baseada no tema
  switch (accent) {
    case 'yellow':
      return `/assets/${LOGO_FILES.yellow}`;
    case 'blue':
    case 'cyan':
    case 'green':
      return `/assets/${LOGO_FILES.cyan}`;
    case 'purple':
    case 'pink':
    case 'orange':
    default:
      return `/assets/${LOGO_FILES.purple}`;
  }
}

export function BrandLogo({
  width = 28,
  height = 28,
  className,
  signature,
  style
}: BrandLogoProps): JSX.Element {
  const { accent } = useTheme();

  const src = resolveFile(accent, signature);

  return (
    <NextImage
      src={src}
      alt='MusicBlah Logo'
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}

export default BrandLogo;
