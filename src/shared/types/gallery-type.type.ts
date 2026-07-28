export type GalleryTypeImageType = {
  fullUrl: string;
  mobileUrl: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  mobileHeight?: number;
  aspectRatio?: number;
};

export type DisplayImage = {
  url: string;
  width?: number;
  height?: number;
  aspectRatio?: string; // precomputed for convenience
  originalFullUrl: string; // keep for tracking identity
};

// Plain const object instead of `enum` — TS enums emit a runtime construct that
// `erasableSyntaxOnly` (tsc-only build, no transpile-away-the-weird-bits bundler) rejects.
export const GalleryTypeEnum = {
  WEDDINGS: 'weddings',
  PORTRAIT: 'portrait',
  LOVE_STORY: 'love-story',
  FAMILY: 'family',
  STUDIO: 'studio',
  PREGNANCY: 'pregnancy',
  BAPTISM: 'baptism',
  BABIES: 'babies',
  NEWBORN: 'newborn',
} as const;

export type GalleryTypeEnum = (typeof GalleryTypeEnum)[keyof typeof GalleryTypeEnum];

export type PostGalleryTypeImageTypeResponseType = {
  fullUrl: string;
  mobileUrl: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  mobileHeight?: number;
  aspectRatio?: number;
};
