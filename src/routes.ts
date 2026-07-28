import type { RouteRecord } from './router.js';
import GalleryPage from './pages/gallery/gallery.page.js';
import GalleryTypePage from './pages/gallery-type/gallery-type.page.js';
import AboutMePage from './pages/about-me/about-me.page.js';
import ContactPage from './pages/contact/contact.page.js';
import NotFoundPage from './pages/not-found/not-found.page.js';

// Eager imports above (see project plan §"eager vs lazy route loading"): the app is
// small enough that per-route dynamic import() would only add a loading-state UI
// requirement without a meaningful payload win. Revisit if bundle size grows.

export const routes: RouteRecord[] = [
  { path: '', redirectTo: 'gallery' },
  { path: 'contact-me', title: 'Contact Me', load: () => Promise.resolve({ default: ContactPage }) },
  { path: 'gallery', title: 'momentkaph', load: () => Promise.resolve({ default: GalleryPage }) },
  { path: 'gallery/babies', redirectTo: 'gallery/babies/baptism' },
  { path: 'gallery/:type', title: (p) => `Gallery - ${p['type']}`, load: () => Promise.resolve({ default: GalleryTypePage }) },
  { path: 'gallery/:type/:variant', title: (p) => `Gallery - ${p['type']} - ${p['variant']}`, load: () => Promise.resolve({ default: GalleryTypePage }) },
  { path: 'about-me', title: 'About Me', load: () => Promise.resolve({ default: AboutMePage }) },
  { path: '404', title: '404', load: () => Promise.resolve({ default: NotFoundPage }) },
  { path: '*', redirectTo: '404' },
];
