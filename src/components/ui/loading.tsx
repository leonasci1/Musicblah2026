import cn from 'clsx';
import { BrandLogo } from '@components/common/brand-logo';

type LoadingProps = {
  className?: string;
  iconClassName?: string;
};

export function Loading({
  className,
  iconClassName
}: LoadingProps): JSX.Element {
  return (
    <div className={cn('flex items-center justify-center', className ?? 'p-8')}>
      <BrandLogo
        signature
        width={360}
        height={120}
        className={iconClassName ?? 'h-auto w-[280px] sm:w-[360px]'}
      />
    </div>
  );
}
