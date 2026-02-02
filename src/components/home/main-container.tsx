import cn from 'clsx';
import type { ReactNode } from 'react';

type MainContainerProps = {
  children: ReactNode;
  className?: string;
};

export function MainContainer({
  children,
  className
}: MainContainerProps): JSX.Element {
  return (
    <main
      className={cn(
        `hover-animation flex min-h-screen w-full max-w-xl flex-col border-x-0
         border-light-border pb-32 dark:border-dark-border xs:border-x xs:pb-20`,
        className
      )}
    >
      {children}
    </main>
  );
}
