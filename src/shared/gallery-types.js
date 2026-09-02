/**
 * The gallery types the backend serves at GET /cloud_storage/{type}.
 * Note 'babies' is a URL-only grouping — it has no endpoint of its own, its
 * routes resolve to the 'baptism' or 'newborn' variant (see routes.js).
 */
export const GALLERY_TYPES = new Set([
  'weddings',
  'portrait',
  'love-story',
  'family',
  'studio',
  'pregnancy',
  'baptism',
  'babies',
  'newborn',
]);
