const COLUMN_COUNT = 3;

const API_BASE = 'https://api.momentkaph.sk';

const GALLERY_TYPES = {
  weddings: {
    photo: 'gallery_weddings.avif',
    titleKey: 'galleryType.title.weddings',
    heroClass: null,
    section: 'weddings',
  },
  'love-story': {
    photo: 'gallery_love-story.avif',
    titleKey: 'galleryType.title.loveStory',
    heroClass: 'adjusted-title',
    section: null,
  },
  portrait: {
    photo: 'gallery_portrait.avif',
    titleKey: 'galleryType.title.portrait',
    heroClass: 'adjusted-title',
    section: null,
  },
  pregnancy: {
    photo: 'gallery_pregnancy.avif',
    titleKey: 'galleryType.title.pregnancy',
    heroClass: 'pregnancy-title',
    section: null,
  },
  studio: {
    photo: 'gallery_studio.avif',
    titleKey: 'galleryType.title.studio',
    heroClass: null,
    section: null,
  },
  family: {
    photo: 'gallery_family.avif',
    titleKey: 'galleryType.title.family',
    heroClass: null,
    section: null,
  },
  baptism: {
    photo: 'gallery_babies.avif',
    titleKey: 'galleryType.title.babies',
    heroClass: null,
    section: 'babies',
  },
  newborn: {
    photo: 'gallery_babies.avif',
    titleKey: 'galleryType.title.babies',
    heroClass: null,
    section: 'babies',
  },
};

const els = {
  hero: document.querySelector('.photo'),
  title: document.querySelector('.title'),
  description: document.querySelector('.description-for-gallery'),
  babies: document.querySelector('.babies-variants'),
  weddings: document.querySelector('.weddings-description'),
  grid: document.querySelector('.image-grid'),
  error: document.querySelector('#.error-message'),
};

const type = new URLSearchParams(location.search).get('type');
const descriptor = GALLERY_TYPES[type];

if (!descriptor) {
  // location.replace() does NOT stop the script, so everything else has to sit
  // in the else branch — this was one reason the old file blew up.
  location.replace('404.html');
} else {
  renderChrome(descriptor);
  if (descriptor.section === 'babies') renderBabiesNav(type);
  if (descriptor.section === 'weddings') wireTips();

  loadImages(type).catch(showError);
}

/** Hero image + heading. Runs synchronously so lang.js can translate the h1. */
function renderChrome({ hero, titleKey, heroClass }) {
  els.hero.src = `assets/${hero}`;
  els.hero.alt = '';
  if (heroClass) els.hero.classList.add(heroClass);

  els.title.dataset.i18n = titleKey;
  // Fallback in case lang.js already ran (e.g. if you ever load it first).
  document.dispatchEvent(new CustomEvent('i18n:retranslate'));
}

/** Sub-nav for Krsty / Novorodenci, incl. the active-link marker. */
function renderBabiesNav(currentType) {
  els.description.hidden = false;
  els.description.classList.add('is-babies'); // was [style.padding-bottom]="0"
  els.babies.hidden = false;

  const lang = new URLSearchParams(location.search).get('lang');

  els.babies.querySelectorAll('a[data-gallery-type]').forEach((link) => {
    const target = link.dataset.galleryType;
    const url = new URL('gallery.html', location.href);
    url.searchParams.set('type', target);
    if (lang) url.searchParams.set('lang', lang); // don't lose the language
    link.href = url.pathname + url.search;

    const isActive = target === currentType;
    link.classList.toggle('activeLinkSection', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });
}

/** The wedding tips carousel — replaces currentTipIndex / isAtStart / isAtEnd. */
function wireTips() {
  els.description.hidden = false;
  els.weddings.hidden = false;

  const tips = [...els.weddings.querySelectorAll('.tip')];
  if (!tips.length) return;

  const prevArrows = [...els.weddings.querySelectorAll('.arrow-left, .arrow-smaller-left')];
  const nextArrows = [...els.weddings.querySelectorAll('.arrow-right, .arrow-smaller-right')];

  let index = 0;

  // Derived from the DOM instead of a hardcoded totalTips = 7.
  const sync = () => {
    prevArrows.forEach((a) => a.classList.toggle('disabled', index === 0));
    nextArrows.forEach((a) => a.classList.toggle('disabled', index === tips.length - 1));
  };

  const move = (step) => {
    const next = Math.min(tips.length - 1, Math.max(0, index + step));
    if (next === index) return;
    index = next;
    tips[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    sync();
  };

  prevArrows.forEach((a) => a.addEventListener('click', () => move(-1)));
  nextArrows.forEach((a) => a.addEventListener('click', () => move(1)));

  // Keep the arrows honest if the user swipes the strip directly.
  const track = els.weddings.querySelector('.gallery-tips');
  if (track) {
    track.addEventListener('scroll', () => {
      const middle = track.scrollLeft + track.clientWidth / 2;
      index = tips.reduce(
        (best, tip, i) =>
          Math.abs(tip.offsetLeft + tip.offsetWidth / 2 - middle) <
            Math.abs(tips[best].offsetLeft + tips[best].offsetWidth / 2 - middle)
            ? i
            : best,
        0
      );
      sync();
    }, { passive: true });
  }

  sync();
}

async function loadImages(galleryType) {
  const res = await fetch(`${API_BASE}/cloud_storage/${galleryType}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const images = await res.json();
  if (!Array.isArray(images) || !images.length) return;

  els.grid.replaceChildren(...buildColumns(images));
  els.grid.hidden = false;
}

/** Round-robin fill, same as columns[index % COLUMN_COUNT] in the component. */
function buildColumns(images) {
  const columns = Array.from({ length: COLUMN_COUNT }, () => {
    const column = document.createElement('div');
    column.className = 'image-column';
    return column;
  });

  images.forEach((image, index) => {
    columns[index % COLUMN_COUNT].append(imageCard(image));
  });

  return columns;
}

/**
 * No BreakpointObserver here: srcset/sizes lets the browser pick the mobile or
 * full file itself, and it re-picks on resize or rotate for free.
 */
function imageCard(image) {
  const card = document.createElement('div');
  card.className = 'image-card';
  if (image.width && image.height) {
    card.style.aspectRatio = `${image.width} / ${image.height}`;
  }

  const img = document.createElement('img');
  img.src = image.fullUrl;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = '';

  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;

  if (image.mobileUrl && image.mobileWidth && image.width) {
    img.srcset = `${image.mobileUrl} ${image.mobileWidth}w, ${image.fullUrl} ${image.width}w`;
    img.sizes = '(max-width: 599px) 100vw, 33vw';
  }

  card.append(img);
  return card;
}

function showError(err) {
  console.error('[gallery]', err);
  els.grid.hidden = true;
  els.error.hidden = false;
}