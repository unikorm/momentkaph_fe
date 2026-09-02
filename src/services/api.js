/**
 * Backend calls. On localhost `API` is '' — i.e. same-origin '/cloud_storage/...'
 * requests that dev.js proxies onward, because the API's CORS allowlist only
 * names momentkaph.sk and would reject a direct call from localhost.
 */
const API = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '' : 'https://api.momentkaph.sk';

/** Gallery images, with `aspectRatio` precomputed from the desktop dimensions. */
export async function fetchGalleryImagesLinks(galleryType) {
  const res = await fetch(`${API}/cloud_storage/${galleryType}`);
  if (!res.ok) throw new Error(`Failed to fetch gallery images: ${res.status}`);

  const images = await res.json();
  return images.map((img) => ({
    ...img,
    aspectRatio: img.width && img.height ? img.width / img.height : 0,
  }));
}

/** `data` is `{ name, email, phone, message }`. */
export async function sendEmail(data) {
  const res = await fetch(`${API}/email_sending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status };
}
