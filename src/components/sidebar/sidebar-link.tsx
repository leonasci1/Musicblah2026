import { useRouter } from 'next/router';
import Link from 'next/link';
import cn from 'clsx';
import { preventBubbling } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { NavLink } from './sidebar';

type SidebarLinkProps = NavLink & {
  username?: string;
  badge?: number;
};

export function SidebarLink({
  href,
  username,
  iconName,
  linkName,
  disabled,
  canBeHidden,
  badge
}: SidebarLinkProps): JSX.Element {
  const { asPath } = useRouter();
  const isActive = username ? asPath.includes(username) : asPath === href;

  return (
    <Link href={href ?? '#'}>
      <a
        className={cn(
          'group py-1 outline-none',
          canBeHidden ? 'hidden xs:flex' : 'flex',
          disabled && 'cursor-not-allowed'
        )}
        onClick={disabled ? preventBubbling() : undefined}
      >
        <div
          className={cn(
            `custom-button flex items-center justify-center gap-4 self-start p-2 text-xl transition 
             duration-200 group-hover:bg-light-primary/10 group-focus-visible:ring-2 
             group-focus-visible:ring-[#878a8c] dark:group-hover:bg-dark-primary/10 
             dark:group-focus-visible:ring-white xs:p-3 xl:pr-5`,
            isActive && 'font-bold'
          )}
        >
          <div className='relative'>
            <HeroIcon
              className={cn(
                'h-7 w-7',
                isActive &&
                  ['Explore', 'Lists'].includes(linkName) &&
                  'stroke-white'
              )}
              iconName={iconName}
              solid={isActive}
            />
            {badge && badge > 0 && (
              <span
                className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center 
                rounded-full bg-main-accent text-xs font-bold text-white'
              >
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>
          <p className='hidden xl:block'>{linkName}</p>
          {badge && badge > 0 && (
            <span
              className='hidden h-5 min-w-[20px] items-center justify-center rounded-full 
              bg-main-accent px-1.5 text-xs font-bold text-white xl:inline-flex'
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
}
