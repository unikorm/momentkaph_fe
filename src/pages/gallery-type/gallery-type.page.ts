import { getRouter, type Page, type RouteParams } from '../../router.js';
import { renderNav } from '../../shared/nav.js';
import { Carousel } from '../../shared/carousel.js';
import { watchMedia, MOBILE_QUERY } from '../../shared/breakpoint.js';
import { fetchGalleryImagesLinks } from '../../services/cloud-storage.service.js';
import { i18n } from '../../services/i18n.service.js';
import { GalleryTypeEnum, type DisplayImage, type GalleryTypeImageType } from '../../shared/types/gallery-type.type.js';
import { GALLERY_TYPE_META, WEDDING_DESCRIPTION_COUNT, WEDDING_TIPS_COUNT } from './gallery-type.data.js';

interface ColumnImages {
  columnIndex: number;
  images: DisplayImage[];
}

const COLUMN_COUNT = 3;

function distributeIntoColumns(images: GalleryTypeImageType[], isMobile: boolean): ColumnImages[] {
  const columns: ColumnImages[] = Array.from({ length: COLUMN_COUNT }, (_, i) => ({ columnIndex: i, images: [] }));

  images.forEach((image, index) => {
    const width = isMobile ? image.mobileWidth : image.width;
    const height = isMobile ? image.mobileHeight : image.height;
    columns[index % COLUMN_COUNT]!.images.push({
      url: isMobile ? image.mobileUrl : image.fullUrl,
      width,
      height,
      aspectRatio: width && height ? `${width} / ${height}` : undefined,
      originalFullUrl: image.fullUrl,
    });
  });

  return columns;
}

export default class GalleryTypePage implements Page {
  private container: HTMLElement | null = null;
  private images: GalleryTypeImageType[] = [];
  private isMobile = false;
  private error = false;
  private readonly tips = new Carousel(WEDDING_TIPS_COUNT - 1);
  private unwatchMobile: (() => void) | null = null;

  async render(container: HTMLElement, params: RouteParams): Promise<void> {
    this.container = container;
    const type = params['type']!;
    const variant = params['variant'];
    const effectiveType = (type === 'babies' ? variant : type) as GalleryTypeEnum;

    if (!Object.values(GalleryTypeEnum).includes(effectiveType)) {
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

          ${this.renderDescription(type)}

          <div class="error-message" hidden>
            <p class="error">404</p>
            <p>${i18n.t('galleryType.error')}</p>
          </div>

          <div class="image-grid" hidden></div>
        </div>
      </div>
    `;

    if (type === 'weddings') this.setupTipsCarousel();

    this.unwatchMobile = watchMedia(MOBILE_QUERY, (matches) => {
      this.isMobile = matches;
      this.paintColumns();
    });

    try {
      this.images = await fetchGalleryImagesLinks(effectiveType);
    } catch {
      this.error = true;
      container.querySelector('.error-message')?.removeAttribute('hidden');
    }
    this.paintColumns();

    // iOS/Firefox/Chrome workaround: scrolling immediately on render doesn't reliably land at top.
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  destroy(): void {
    this.unwatchMobile?.();
  }

  private renderDescription(type: string): string {
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

  private setupTipsCarousel(): void {
    const root = this.container!;
    const leftArrows = root.querySelectorAll<HTMLElement>('.arrow-left, .arrow-smaller-left');
    const rightArrows = root.querySelectorAll<HTMLElement>('.arrow-right, .arrow-smaller-right');

    const paintBoundaries = () => {
      leftArrows.forEach((a) => a.classList.toggle('disabled', this.tips.atStart));
      rightArrows.forEach((a) => a.classList.toggle('disabled', this.tips.atEnd));
    };

    const scrollToCurrent = () => {
      root.querySelectorAll('.tip')[this.tips.index]
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    leftArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.tips.prev()) { paintBoundaries(); scrollToCurrent(); }
    }));
    rightArrows.forEach((a) => a.addEventListener('click', () => {
      if (this.tips.next()) { paintBoundaries(); scrollToCurrent(); }
    }));

    paintBoundaries();
  }

  private paintColumns(): void {
    const grid = this.container?.querySelector<HTMLElement>('.image-grid');
    if (!grid) return;

    if (!this.images.length) {
      grid.hidden = true;
      return;
    }

    const columns = distributeIntoColumns(this.images, this.isMobile);
    grid.hidden = false;
    grid.innerHTML = columns.map((column) => `
      <div class="image-column">
        ${column.images.map((image) => `
          <div class="image-card" style="aspect-ratio: ${image.aspectRatio ?? 'auto'}">
            <img src="${image.url}" ${image.width ? `width="${image.width}"` : ''} ${image.height ? `height="${image.height}"` : ''} loading="lazy" alt="some photo of actual section" />
          </div>
        `).join('')}
      </div>
    `).join('');
  }
}
