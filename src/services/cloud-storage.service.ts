import { apiUrl } from '../config/env.js';
import type { GalleryTypeEnum, GalleryTypeImageType } from '../shared/types/gallery-type.type.js';

export async function fetchGalleryImagesLinks(galleryType: GalleryTypeEnum): Promise<GalleryTypeImageType[]> {
  const res = await fetch(`${apiUrl}/cloud_storage/${galleryType}`);
  if (!res.ok) throw new Error(`Failed to fetch gallery images: ${res.status}`);

  const images: GalleryTypeImageType[] = await res.json();
  return images.map((img) => ({
    ...img,
    aspectRatio: img.width && img.height ? img.width / img.height : 0,
  }));
}
