import { getRouter } from '../../router.js';
import { renderNav } from '../../shared/nav.js';
import { Carousel } from '../../shared/carousel.js';
import { watchMedia, MOBILE_QUERY } from '../../shared/breakpoint.js';
import { fetchGalleryImagesLinks } from '../../services/api.js';
import { i18n } from '../../services/i18n.service.js';
import { GALLERY_TYPES } from '../../shared/gallery-types.js';
import { GALLERY_TYPE_META, WEDDING_DESCRIPTION_COUNT, WEDDING_TIPS_COUNT } from './gallery-type.data.js';

const COLUMN_COUNT = 3;

/** Deals the images round-robin into COLUMN_COUNT masonry columns, picking the mobile or full asset. */
function distributeIntoColumns(images, isMobile) {
  const columns = Array.from({ length: COLUMN_COUNT }, () => []);

  images.forEach((image, index) => {
    const width = isMobile ? image.mobileWidth : image.width;
    const height = isMobile ? image.mobileHeight : image.height;
    columns[index % COLUMN_COUNT].push({
      url: isMobile ? image.mobileUrl : image.fullUrl,
      width,
      height,
      aspectRatio: width && height ? `${width} / ${height}` : undefined,
    });
  });

  return columns;
}

export default class GalleryTypePage {
  #container = null;
  #images = [];
  #isMobile = false;
  #tips = new Carousel(WEDDING_TIPS_COUNT - 1);
  #unwatchMobile = null;

  async render(container, params) {
    this.#container = container;
    const { type, variant } = params;
    const effectiveType = type === 'babies' ? variant : type;

    if (!GALLERY_TYPES.has(effectiveType)) {
      getRouter().navigate('/404', { replace: true });
      return;
    }

    const meta = GALLERY_TYPE_META[type] ?? { titleKey: '' };

    container.innerHTML = `
      <div class="gallery-type-page">
        ${renderNav(`/gallery/${type}`)}
        <div class="gallery-container">
          <div class="title-for-gallery">
            <img src="/assets/gallery_${type}.avif" alt="title of gallery" class="${meta.headerClass ?? ''}" />
            <h1>${i18n.t(meta.titleKey, type)}</h1>
          </div>

          ${this.#renderDescription(type)}

          <div class="error-message" hidden>
            <p class="error">404</p>
            <p>${i18n.t('galleryType.error')}</p>
          </div>

          <div class="image-grid" hidden></div>
        </div>
      </div>
    `;

    if (type === 'weddings') this.#setupTipsCarousel();

    this.#unwatchMobile = watchMedia(MOBILE_QUERY, (matches) => {
      this.#isMobile = matches;
      this.#paintColumns();
    });

    try {
      this.#images = await fetchGalleryImagesLinks(effectiveType);
    } catch {
      container.querySelector('.error-message')?.removeAttribute('hidden');
    }
    this.#paintColumns();

    // iOS/Firefox/Chrome workaround: scrolling immediately on render doesn't reliably land at top.
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  destroy() {
    this.#unwatchMobile?.();
  }

  #renderDescription(type) {
    if (type === 'babies') {
      return `
        <div class="description-for-gallery" style="padding-bottom: 0">
          <div class="selection-of-babies-variant">
            <a href="/gallery/babies/baptism">${i18n.t('galleryType.babies.baptism')}</a>
            <a href="/gallery/babies/newborn">${i18n.t('galleryType.babies.newborn')}</a>
          </div>
        </div>
      `;
    }

    if (type === 'weddings') {
      const description = Array.from({ length: WEDDING_DESCRIPTION_COUNT }, (_, i) => `
        <div class="headlineOfTextInDescription">${i18n.t(`galleryType.wedding.description.${i}.headline`)}</div>
        <div class="contentOfTextInDescription">${i18n.t(`galleryType.wedding.description.${i}.content`)}</div>
      `).join('');

      const tips = Array.from({ length: WEDDING_TIPS_COUNT }, (_, i) => `
        <div class="tip">
          <span class="tip-number">---</span>
          <div>
            <div class="headlineOfTipInDescription">${i18n.t(`galleryType.wedding.tips.${i}.headline`)}</div>
            <div class="contentOfTipInDescription">${i18n.t(`galleryType.wedding.tips.${i}.content`)}</div>
          </div>
          <span class="tip-number">---</span>
        </div>
      `).join('');

      return `
        <div class="description-for-gallery">
          <div class="description">${description}</div>
          <div class="arrow-wrapper">
            <img src="/assets/arrow.svg" alt="arrow" class="arrow-left" />
            <img src="/assets/arrow-smaller.svg" alt="arrow-smaller" class="arrow-smaller-left" />
            <div class="gallery-tips">${tips}</div>
            <img src="/assets/arrow.svg" alt="arrow" class="arrow-right" />
            <img src="/assets/arrow-smaller.svg" alt="arrow-smaller" class="arrow-smaller-right" />
          </div>
        </div>
      `;
    }

    return '';
  }

  #setupTipsCarousel() {
    const root = this.#container;
    const leftArrows = root.querySelectorAll('.arrow-left, .arrow-smaller-left');
    const rightArrows = root.querySelectorAll('.arrow-right, .arrow-smaller-right');

    const paintBoundaries = () => {
      leftArrows.forEach((a) => a.classList.toggle('disabled', this.#tips.atStart));
      rightArrows.forEach((a) => a.classList.toggle('disabled', this.#tips.atEnd));
    };

    const scrollToCurrent = () => {
      root.querySelectorAll('.tip')[this.#tips.index]
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    leftArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.#tips.prev()) { paintBoundaries(); scrollToCurrent(); }
    }));
    rightArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.#tips.next()) { paintBoundaries(); scrollToCurrent(); }
    }));

    paintBoundaries();
  }

  #paintColumns() {
    const grid = this.#container?.querySelector('.image-grid');
    if (!grid) return;

    if (!this.#images.length) {
      grid.hidden = true;
      return;
    }

    grid.hidden = false;
    grid.innerHTML = distributeIntoColumns(this.#images, this.#isMobile).map((column) => `
      <div class="image-column">
        ${column.map((image) => `
          <div class="image-card" style="aspect-ratio: ${image.aspectRatio ?? 'auto'}">
            <img src="${image.url}" ${image.width ? `width="${image.width}"` : ''} ${image.height ? `height="${image.height}"` : ''} loading="lazy" alt="some photo of actual section" />
          </div>
        `).join('')}
      </div>
    `).join('');
  }
}
