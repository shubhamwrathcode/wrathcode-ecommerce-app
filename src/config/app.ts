export const APP = {
  name: 'ShopVerse',
  tagline: 'Everything you love, delivered.',
  version: '1.0.0',
  shareBaseUrl: 'https://shopverse.app/p/',
  deepLinkPrefixes: ['shopverse://', 'https://shopverse.app'],
  support: {
    phone: '+91 80000 12345',
    email: 'support@shopverse.app',
    hours: '9 AM – 9 PM, all days',
  },
  demo: {
    email: 'demo@shopverse.app',
    password: 'Demo@123',
    mobile: '9876543210',
  },
  storageKeys: { persist: 'root', db: '@shopverse/db' },
} as const;

/** Real product photos used on the onboarding slides: [hero, sticker, sticker]. */
export const ONBOARDING_PHOTOS: readonly (readonly [string, string, string])[] =
  [
    [
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp',
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
      'https://cdn.dummyjson.com/product-images/tops/gray-dress/1.webp',
    ],
    [
      'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/1.webp',
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/1.webp",
      'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp',
    ],
    [
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/1.webp',
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp',
      'https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/1.webp',
    ],
  ];
