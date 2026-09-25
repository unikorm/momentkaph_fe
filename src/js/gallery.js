import { wireCarousel } from './carousel.js';

const COLUMN_COUNT = 3;

const API = location.hostname === 'localhost' ? 'http://localhost:3069' : 'https://api.momentkaph.sk';

const GALLERY_TYPES = {
  weddings: {
    photo: 'gallery_weddings.avif',
    title: 'Svadby',
    titleKey: 'galleryType.title.weddings',
    heroClass: null,
    section: 'weddings',
  },
  'love-story': {
    photo: 'gallery_love-story.avif',
    title: 'Príbehy lásky',
    titleKey: 'galleryType.title.loveStory',
    heroClass: 'adjusted-title',
    section: null,
  },
  portrait: {
    photo: 'gallery_portrait.avif',
    title: 'Portréty',
    titleKey: 'galleryType.title.portrait',
    heroClass: 'adjusted-title',
    section: null,
  },
  pregnancy: {
    photo: 'gallery_pregnancy.avif',
    title: 'Tehuľky',
    titleKey: 'galleryType.title.pregnancy',
    heroClass: 'pregnancy-title',
    section: null,
  },
  studio: {
    photo: 'gallery_studio.avif',
    title: 'Ateliér',
    titleKey: 'galleryType.title.studio',
    heroClass: null,
    section: null,
  },
  family: {
    photo: 'gallery_family.avif',
    title: 'Rodina',
    titleKey: 'galleryType.title.family',
    heroClass: null,
    section: null,
  },
  baptism: {
    photo: 'gallery_babies.avif',
    title: 'Bábätká',
    titleKey: 'galleryType.title.babies',
    heroClass: null,
    section: 'babies',
  },
  newborn: {
    photo: 'gallery_babies.avif',
    title: 'Bábätká',
    titleKey: 'galleryType.title.babies',
    heroClass: null,
    section: 'babies',
  },
};

// Selectors match gallery.html exactly.
const els = {
  hero: document.querySelector('.title-for-gallery .hero'),
  title: document.querySelector('.title-for-gallery .title'),
  description: document.querySelector('.description-for-gallery'),
  babies: document.querySelector('.selection-of-babies-variant'),
  weddings: document.querySelector('.weddings-description'),
  grid: document.querySelector('#image-grid'),
  error: document.querySelector('#error-message'),
};

/** ?type=babies&subtype=X → X, otherwise ?type=X → X. */
function resolveType(search = location.search) {
  const params = new URLSearchParams(search);
  return params.get('type') === 'babies' ? params.get('subtype') : params.get('type');
}

/** The gallery type currently shown in the grid. */
let activeType = resolveType();
let requestToken = 0;
const descriptor = GALLERY_TYPES[activeType];

if (!descriptor) {
  location.replace('404.html');
} else {
  renderChrome(descriptor);
  if (descriptor.section === 'babies') renderBabiesNav(activeType);
  if (descriptor.section === 'weddings') wireTips();

  loadImages(activeType).catch(showError);
}

/** Back / forward buttons after a pushState switch. */
window.addEventListener('popstate', () => {
  const next = resolveType();
  const nextDescriptor = GALLERY_TYPES[next];

  // Left the babies section entirely — cheapest to just reload.
  if (!nextDescriptor || nextDescriptor.section !== 'babies') {
    location.reload();
    return;
  }
  if (next !== activeType) showSubtype(next);
});

/** Hero image + heading. */
function renderChrome({ photo, title, titleKey, heroClass }) {
  els.hero.alt = 'hero';
  els.hero.srcset = `assets/${withSuffix(photo)} 1200w, assets/${photo} 1560w`;
  els.hero.sizes = '100vw';
  els.hero.src = `assets/${photo}`;
  if (heroClass) els.hero.classList.add(heroClass);

  els.title.textContent = title;
  els.title.dataset.i18n = titleKey;
  document.title = title;
}

/**
 * Sub-nav for Krsty / Novorodenci. Wired once: clicks are intercepted and
 * switch the grid in place instead of reloading the page.
 */
function renderBabiesNav(currentType) {
  els.description.hidden = false;
  els.description.classList.add('is-babies');
  els.babies.hidden = false;

  els.babies.querySelectorAll('a[data-gallery-type]').forEach((link) => {
    const target = link.dataset.galleryType;
    const url = new URL('gallery.html?type=babies', location.href);
    url.searchParams.set('subtype', target);
    link.href = url.pathname + url.search;

    link.addEventListener('click', (event) => {
      // Let ctrl/cmd/shift/middle-click open a real new tab.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (target === activeType) return;

      history.pushState({ subtype: target }, '', link.href);
      showSubtype(target);
    });
  });

  markActiveBabiesLink(currentType);
}

function markActiveBabiesLink(active) {
  els.babies.querySelectorAll('a[data-gallery-type]').forEach((link) => {
    const isActive = link.dataset.galleryType === active;
    link.classList.toggle('activeLinkSection', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

/** Swap the grid to another babies subtype without leaving the page. */
function showSubtype(next) {
  activeType = next;
  markActiveBabiesLink(next);
  els.grid.replaceChildren();
  loadImages(next).catch(showError);
}

/** Wire up the wedding tips carousel with arrow navigation. */
function wireTips() {
  els.description.hidden = false;
  els.weddings.hidden = false;

  const track = els.weddings.querySelector('.gallery-tips');
  if (track) wireCarousel(els.weddings, track, '.tip');
}

/** Monotonic token so a slow, superseded fetch can't paint over a newer one. */
async function loadImages(galleryType) {
  const token = ++requestToken;
  els.error.hidden = true;

  const res = await fetch(`${API}/cloud_storage/${galleryType}`);
  if (token !== requestToken) return;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const images = await res.json();
  if (token !== requestToken) return;
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
    img.sizes = '33vw';
  }

  card.append(img);
  return card;
}

function showError(err) {
  console.error('[gallery]', err);
  els.grid.hidden = true;
  els.error.hidden = false;
}

function withSuffix(file, suffix = '_smaller') {
  return file.replace(/(\.[^.]+)$/, `${suffix}$1`);
}