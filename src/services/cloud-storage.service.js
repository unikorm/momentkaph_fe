import { apiUrl } from '../config/env.js';

/**
 * Returns the gallery's images, each with `aspectRatio` precomputed from the
 * desktop dimensions (0 when the backend omits them).
 */
export async function fetchGalleryImagesLinks(galleryType) {
  const res = await fetch(`${apiUrl}/cloud_storage/${galleryType}`);
  if (!res.ok) throw new Error(`Failed to fetch gallery images: ${res.status}`);

  const images = await res.json();
  return images.map((img) => ({
    ...img,
    aspectRatio: img.width && img.height ? img.width / img.height : 0,
  }));
}
