const footerLinks = [
  ['About', '/about'],
  ['Help Center', '/help'],
  ['Privacy Policy', '/privacy'],
  ['Cookie Policy', '/cookies'],
  ['Accessibility', '/accessibility'],
  ['Ads Info', '/ads'],
  ['Blog', '/blog'],
  ['Status', '/status'],
  ['Careers', '/careers'],
  ['Brand Resources', '/brand-resources'],
  ['Advertising', '/advertising'],
  ['Marketing', '/marketing'],
  ['Business', '/business'],
  ['Developers', '/developers'],
  ['Directory', '/directory'],
  ['Settings', '/settings']
] as const;

export function LoginFooter(): JSX.Element {
  return (
    <footer className='hidden justify-center p-4 text-sm text-light-secondary dark:text-dark-secondary lg:flex'>
      <nav className='flex flex-wrap justify-center gap-4 gap-y-2'>
        {footerLinks.map(([linkName, href]) => (
          <a
            className='custom-underline'
            target='_blank'
            rel='noreferrer'
            href={href}
            key={linkName}
          >
            {linkName}
          </a>
        ))}
        <p>© 2022 MusicBlah, Inc.</p>
      </nav>
    </footer>
  );
}
