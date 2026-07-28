import type { Page } from '../../router.js';
import { GALLERY_REVIEWS } from '../../shared/gallery-reviews.data.js';
import { Carousel } from '../../shared/carousel.js';
import { i18n, type SupportedLocale } from '../../services/i18n.service.js';

const TILES = [
  { className: 'weddings', href: '/gallery/weddings', img: 'gallery_weddings.avif', labelKey: 'gallery.tile.weddings', loading: 'eager' },
  { className: 'love-story', href: '/gallery/love-story', img: 'gallery_love-story.avif', labelKey: 'gallery.tile.loveStory', loading: 'eager' },
  { className: 'pregnancy', href: '/gallery/pregnancy', img: 'gallery_pregnancy.avif', labelKey: 'gallery.tile.pregnancy', loading: 'lazy' },
  { className: 'studio', href: '/gallery/studio', img: 'gallery_studio.avif', labelKey: 'gallery.tile.studio', loading: 'lazy' },
  { className: 'family', href: '/gallery/family', img: 'gallery_family.avif', labelKey: 'gallery.tile.family', loading: 'lazy' },
  { className: 'baptism', href: '/gallery/babies/baptism', img: 'gallery_babies.avif', labelKey: 'gallery.tile.baptism', loading: 'lazy' },
  { className: 'portrait', href: '/gallery/portrait', img: 'gallery_portrait.avif', labelKey: 'gallery.tile.portrait', loading: 'lazy' },
] as const;

function tile(t: (typeof TILES)[number]): string {
  return `
    <div class="grid_item ${t.className}">
      <a class="image_container" href="${t.href}">
        <img src="/assets/${t.img}" alt="photo of ${t.className}" loading="${t.loading}" />
        <span>${i18n.t(t.labelKey)}</span>
      </a>
    </div>
  `;
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

export default class GalleryPage implements Page {
  private readonly reviews = new Carousel(GALLERY_REVIEWS.length - 1);
  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = `
      <div class="gallery-page">
        <div class="photo_grid">
          ${tile(TILES[0]!)}
          <div class="grid_item empty">
            <div class="empty_section">
              <nav>
                <a href="/about-me">${i18n.t('nav.aboutMe')}</a>
                <a href="/gallery" class="activeLink" aria-current="page">${i18n.t('nav.gallery')}</a>
                <a href="/contact-me">${i18n.t('nav.contact')}</a>
              </nav>
              <img alt="photo of me" src="/assets/about_photo.avif" />
            </div>
          </div>
          ${tile(TILES[1]!)}
          <div>
            ${tile(TILES[2]!)}
            ${tile(TILES[3]!)}
          </div>
          <div>
            ${tile(TILES[4]!)}
            ${tile(TILES[5]!)}
          </div>
          ${tile(TILES[6]!)}
        </div>

        <div class="reviews">
          <p>${i18n.t('gallery.reviewsLabel')}</p>
          <div class="arrow-wrapper">
            <img src="/assets/arrow.svg" alt="arrow" class="arrow-left" />
            <img src="/assets/arrow-smaller.svg" alt="arrow-smaller" class="arrow-smaller-left" />
            <div class="reviews-list">
              ${GALLERY_REVIEWS.map((r) => `
                <div class="review">
                  <span class="review-header">---</span>
                  <div><p>${escapeHtml(r.content)}</p></div>
                  <span class="review-bottom">---</span>
                  <p class="review-author">${escapeHtml(r.author)}</p>
                </div>
              `).join('')}
            </div>
            <img src="/assets/arrow.svg" alt="arrow" class="arrow-right" />
            <img src="/assets/arrow-smaller.svg" alt="arrow-smaller" class="arrow-smaller-right" />
          </div>
        </div>

        <div class="language_switcher">
          <button type="button" data-lang="sk">SK</button>
          <button type="button" data-lang="en">EN</button>
          <button type="button" data-lang="uk">UA</button>
        </div>
      </div>
    `;

    this.setupHoverTiles();
    this.setupReviewsCarousel();
    this.setupLanguageSwitcher();
  }

  private setupHoverTiles(): void {
    this.container?.querySelectorAll<HTMLElement>('.image_container').forEach((el) => {
      el.addEventListener('touchstart', () => el.classList.toggle('hovered'));
    });
  }

  private setupReviewsCarousel(): void {
    const root = this.container!;
    const leftArrows = root.querySelectorAll<HTMLElement>('.arrow-left, .arrow-smaller-left');
    const rightArrows = root.querySelectorAll<HTMLElement>('.arrow-right, .arrow-smaller-right');

    const paintBoundaries = () => {
      leftArrows.forEach((a) => a.classList.toggle('disabled', this.reviews.atStart));
      rightArrows.forEach((a) => a.classList.toggle('disabled', this.reviews.atEnd));
    };

    const scrollToCurrent = () => {
      root.querySelectorAll('.review')[this.reviews.index]
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    leftArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.reviews.prev()) { paintBoundaries(); scrollToCurrent(); }
    }));
    rightArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.reviews.next()) { paintBoundaries(); scrollToCurrent(); }
    }));

    paintBoundaries();
  }

  private setupLanguageSwitcher(): void {
    const buttons = this.container!.querySelectorAll<HTMLButtonElement>('.language_switcher button');
    const paint = () => {
      buttons.forEach((btn) => btn.classList.toggle('activeLanguage', btn.dataset['lang'] === i18n.currentLocale));
    };
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      void i18n.setLocale(btn.dataset['lang'] as SupportedLocale).then(paint);
    }));
    paint();
  }
}
