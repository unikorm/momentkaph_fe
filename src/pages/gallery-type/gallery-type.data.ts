export const GALLERY_TYPE_META: Record<string, { titleKey: string; headerClass?: string }> = {
  babies: { titleKey: 'galleryType.title.babies' },
  weddings: { titleKey: 'galleryType.title.weddings' },
  portrait: { titleKey: 'galleryType.title.portrait', headerClass: 'adjusted-title' },
  'love-story': { titleKey: 'galleryType.title.loveStory', headerClass: 'adjusted-title' },
  family: { titleKey: 'galleryType.title.family' },
  studio: { titleKey: 'galleryType.title.studio' },
  pregnancy: { titleKey: 'galleryType.title.pregnancy', headerClass: 'pregnancy-title' },
};

/** 3 headline/content pairs — keys match galleryType.wedding.description.<index>.headline|content in the i18n dictionaries. */
export const WEDDING_DESCRIPTION_COUNT = 3;

/** 8 tip cards — keys match galleryType.wedding.tips.<index>.headline|content in the i18n dictionaries. */
export const WEDDING_TIPS_COUNT = 8;
