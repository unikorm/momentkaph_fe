/** Gallery page. The type comes from the URL: gallery.html?type=weddings */
const TYPES = {
  weddings: { hero: 'gallery_weddings.avif', key: 'galleryType.title.weddings' },
  'love-story': { hero: 'gallery_love-story.avif', key: 'galleryType.title.loveStory' },
  pregnancy: { hero: 'gallery_pregnancy.avif', key: 'galleryType.title.pregnancy' },
  studio: { hero: 'gallery_studio.avif', key: 'galleryType.title.studio' },
  family: { hero: 'gallery_family.avif', key: 'galleryType.title.family' },
  portrait: { hero: 'gallery_portrait.avif', key: 'galleryType.title.portrait' },
  baptism: { hero: 'gallery_babies.avif', key: 'galleryType.title.babies' },
  newborn: { hero: 'gallery_babies.avif', key: 'galleryType.title.babies' },
};

const API = location.hostname === 'localhost' ? '' : 'https://api.momentkaph.sk';

const type = new URL(location.href).searchParams.get('type');
if (!TYPES[type]) location.replace('404.html');

const { hero, key } = TYPES[type];
document.querySelector('#hero').src = `assets/${hero}`;
// lang.js translates anything carrying data-i18n, including this heading.
document.querySelector('#title').dataset.i18n = key;

const grid = document.querySelector('.image-grid');

try {
  const res = await fetch(`${API}/cloud_storage/${type}`);
  if (!res.ok) throw new Error(res.status);
  const images = await res.json();

  grid.innerHTML = images.map((image) => `
    <div class="image-card" style="aspect-ratio: ${image.width} / ${image.height}">
      <img src="${image.fullUrl}" width="${image.width}" height="${image.height}" loading="lazy" alt="">
    </div>`).join('');
  grid.hidden = false;
} catch {
  document.querySelector('.error-message').hidden = false;
}
