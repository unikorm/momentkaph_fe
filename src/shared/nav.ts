import { i18n } from '../services/i18n.service.js';

const LINKS = [
  { href: '/about-me', key: 'nav.aboutMe' },
  { href: '/gallery', key: 'nav.gallery' },
  { href: '/contact-me', key: 'nav.contact' },
] as const;

/** Shared top nav markup reused by about-me, contact and gallery-type pages. */
export function renderNav(currentPath: string): string {
  const links = LINKS.map(({ href, key }) => {
    const isActive = currentPath === href || (href === '/gallery' && currentPath.startsWith('/gallery'));
    return `<a href="${href}"${isActive ? ' class="activeLink" aria-current="page"' : ''}>${i18n.t(key)}</a>`;
  }).join('');

  return `<div class="menu_container"><nav>${links}</nav></div>`;
}
