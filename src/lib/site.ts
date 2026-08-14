export const NAV_ITEMS = [
  { href: '/#top', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#security', label: 'Security' },
  { href: '/#resume', label: 'Resume' },
  { href: '/#contact', label: 'Contact' },
] as const;

export const SITE_DOMAIN = 'andresblanco.site';

export function canonicalUrl(path: string): string {
  return `https://${SITE_DOMAIN}${path === '/' ? '/' : path}`;
}
