/**
 * Generates the static mock "database" for ShopVerse (section 8 of the SRD).
 *
 *   node scripts/generate-mock-data.js
 *
 * Output is deterministic (seeded PRNG) so the demo looks the same on every
 * machine. Brand names are fictional. Product photos come from DummyJSON (a free
 * demo catalogue) and book covers from Open Library — see scripts/data/product-photos.json.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'mock');

// ---------- seeded PRNG ----------
let seed = 20261124;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const ri = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};
const round9 = n => Math.max(49, Math.round(n / 10) * 10 - 1);
const img = (icon, hex, i) => `pi|${icon}|${hex}|${i}`;

const NOW = new Date('2026-11-24T09:00:00.000Z').getTime();
const DAY = 86400000;

// ---------- palette ----------
const COLORS = {
  Black: '#1F2933',
  White: '#E9EDF2',
  Navy: '#1E3A5F',
  Blue: '#2F6FDB',
  Red: '#D64545',
  Green: '#2F9E6B',
  Grey: '#8A94A3',
  Beige: '#D8C3A5',
  Pink: '#E77FA8',
  Olive: '#6B7A3A',
  Maroon: '#7A2E3B',
  Teal: '#1F8A8A',
  Silver: '#B8C0CC',
  Gold: '#C9A227',
  Purple: '#7C4DBA',
  Orange: '#E8833A',
};
const col = name => ({ name, hex: COLORS[name] });

// ---------- realistic product photos ----------
// Curated from DummyJSON (free demo catalogue, white-background product shots)
// and Open Library covers for books. See scripts/data/product-photos.json.
const PHOTOS = require('./data/product-photos.json');
const photosOf = key => {
  const entry = PHOTOS[String(key)];
  if (!entry) throw new Error(`No photo for ${key}`);
  return entry.images;
};

// ---------- categories ----------
const categoryDefs = [
  {
    id: 'electronics', name: 'Electronics', icon: 'laptop-outline', color: '#7C03B2',
    subs: [
      ['audio', 'Audio', 'headset-outline'],
      ['laptops', 'Laptops', 'laptop-outline'],
      ['smart-devices', 'Smart Devices', 'watch-outline'],
      ['camera-gear', 'Camera Gear', 'camera-outline'],
    ],
  },
  {
    id: 'mobiles', name: 'Mobiles', icon: 'phone-portrait-outline', color: '#A218C2',
    subs: [
      ['smartphones', 'Smartphones', 'phone-portrait-outline'],
      ['tablets', 'Tablets', 'tablet-portrait-outline'],
      ['mobile-accessories', 'Accessories', 'battery-charging-outline'],
    ],
  },
  {
    id: 'fashion-men', name: 'Men', icon: 'shirt-outline', color: '#54018B',
    subs: [
      ['men-shirts', 'Shirts & Tees', 'shirt-outline'],
      ['men-footwear', 'Sneakers', 'footsteps-outline'],
      ['men-watches', 'Watches', 'watch-outline'],
      ['men-sunglasses', 'Sunglasses', 'glasses-outline'],
    ],
  },
  {
    id: 'fashion-women', name: 'Women', icon: 'woman-outline', color: '#DE24F8',
    subs: [
      ['women-dresses', 'Dresses', 'woman-outline'],
      ['women-footwear', 'Heels & Flats', 'footsteps-outline'],
      ['women-bags', 'Handbags', 'bag-handle-outline'],
      ['women-jewellery', 'Jewellery', 'diamond-outline'],
    ],
  },
  {
    id: 'home-kitchen', name: 'Home & Kitchen', icon: 'home-outline', color: '#8E0FB8',
    subs: [
      ['cookware', 'Cookware', 'restaurant-outline'],
      ['appliances', 'Appliances', 'cafe-outline'],
      ['decor', 'Decor', 'flower-outline'],
      ['furniture', 'Furniture', 'bed-outline'],
    ],
  },
  {
    id: 'beauty', name: 'Beauty', icon: 'sparkles-outline', color: '#C21BE0',
    subs: [
      ['makeup', 'Makeup', 'color-palette-outline'],
      ['fragrance', 'Fragrance', 'flask-outline'],
      ['skincare', 'Bath & Body', 'water-outline'],
    ],
  },
  {
    id: 'books', name: 'Books', icon: 'book-outline', color: '#410574',
    subs: [
      ['fiction', 'Fiction', 'book-outline'],
      ['non-fiction', 'Non-Fiction', 'library-outline'],
      ['kids-books', 'Kids', 'happy-outline'],
    ],
  },
  {
    id: 'sports', name: 'Sports', icon: 'football-outline', color: '#7C03B2',
    subs: [
      ['cricket', 'Cricket', 'baseball-outline'],
      ['ball-sports', 'Ball Sports', 'football-outline'],
      ['racquet-sports', 'Racquet Sports', 'tennisball-outline'],
    ],
  },
];

const categories = [];
categoryDefs.forEach((c, i) => {
  categories.push({
    id: c.id, name: c.name, icon: c.icon, image: img(c.icon, c.color, 0),
    parentId: null, sortOrder: i + 1, color: c.color,
  });
  c.subs.forEach(([id, name, icon], j) => {
    categories.push({
      id, name, icon, image: img(icon, c.color, j + 1),
      parentId: c.id, sortOrder: j + 1, color: c.color,
    });
  });
});

// ---------- brands (fictional) ----------
const brandsByCategory = {
  electronics: ['Voltrix', 'Sonique', 'Pixelon', 'Auralink'],
  mobiles: ['Nexora', 'Zentra', 'Lumio', 'Voltrix'],
  'fashion-men': ['Urban Thread', 'Northloom', 'Denimark', 'Stridewell'],
  'fashion-women': ['Velora', 'Bloomway', 'Chicora', 'Stridewell'],
  'home-kitchen': ['Hearthly', 'Kitchora', 'Nestique', 'Brewmaster Co'],
  beauty: ['Glowveda', 'Purelle', 'Aromiq', 'Lushora'],
  books: ['Inkwell Press', 'Paperleaf', 'Brightpage'],
  sports: ['Fitcore', 'Trailblaze', 'Kinetiq', 'Stridewell'],
};
const brands = [...new Set(Object.values(brandsByCategory).flat())].sort();

// ---------- product templates ----------
// [subId, baseName, priceRange, variantKind, tags, photoKey, extra?]
const T = {
  electronics: [
    ['audio', 'Over-Ear Wireless Headphones', [6999, 24999], 'color', ['headphones', 'bluetooth', 'anc'], 101],
    ['audio', 'True Wireless Earbuds', [1999, 9999], 'none', ['earbuds', 'tws', 'bluetooth'], 100],
    ['audio', 'Wireless Neckband Earphones', [999, 3999], 'color', ['earphones', 'neckband', 'bluetooth'], 107],
    ['laptops', 'Dual Screen Creator Laptop', [99999, 169999], 'storage', ['laptop', 'creator', 'oled'], 79],
    ['laptops', 'Thin & Light Laptop 14"', [54999, 89999], 'storage', ['laptop', 'notebook', 'work'], 80],
    ['laptops', '2-in-1 Convertible Laptop', [49999, 84999], 'storage', ['laptop', 'convertible', 'touch'], 81],
    ['laptops', 'Ultrabook 13" InfinityEdge', [69999, 119999], 'storage', ['laptop', 'ultrabook'], 82],
    ['smart-devices', 'Smart Speaker with Voice Assistant', [3999, 9999], 'none', ['smart speaker', 'alexa', 'home'], 99],
    ['smart-devices', 'Mini Smart Speaker', [4999, 9999], 'color', ['smart speaker', 'mini', 'home'], 103],
    ['smart-devices', 'Smartwatch Series 4', [14999, 34999], 'color', ['smartwatch', 'fitness', 'watch'], 106],
    ['camera-gear', 'Aluminium Monopod', [999, 2999], 'none', ['monopod', 'camera', 'vlog'], 109],
    ['camera-gear', 'Bluetooth Selfie Stick', [499, 1499], 'color', ['selfie stick', 'camera', 'vlog'], 111],
  ],
  mobiles: [
    ['smartphones', 'A57 5G (Glowing Green)', [12999, 17999], 'storage', ['phone', 'mobile', '5g', 'android'], 125],
    ['smartphones', 'F19 Pro+ 5G', [21999, 27999], 'storage', ['phone', 'mobile', 'camera', '5g'], 126],
    ['smartphones', 'K1 Gradient Edition', [14999, 19999], 'storage', ['phone', 'mobile', 'gradient'], 127],
    ['smartphones', 'C35 Budget Phone', [8999, 11999], 'storage', ['phone', 'mobile', 'budget'], 128],
    ['smartphones', 'XT 64MP Camera Phone', [15999, 21999], 'storage', ['phone', 'mobile', 'camera'], 130],
    ['smartphones', 'S10 Flagship', [44999, 69999], 'storage', ['phone', 'mobile', 'flagship'], 133],
    ['smartphones', 'S1 Diamond Glow', [13999, 18999], 'storage', ['phone', 'mobile', 'selfie'], 134],
    ['smartphones', 'X21 In-Display Fingerprint', [24999, 32999], 'storage', ['phone', 'mobile', 'flagship'], 136],
    ['tablets', 'Mini Tablet 8.3" Starlight', [39999, 54999], 'storage', ['tablet', 'pad', 'mini'], 159],
    ['tablets', 'Tab S8+ 12.4" AMOLED', [59999, 84999], 'storage', ['tablet', 'pad', 'amoled'], 160],
    ['tablets', 'Tab 10.4" Wi-Fi', [17999, 27999], 'storage', ['tablet', 'pad', 'study'], 161],
    ['mobile-accessories', '20W USB-C Fast Charger', [999, 1999], 'none', ['charger', 'adapter', 'fast charging'], 104],
    ['mobile-accessories', 'Magnetic Power Bank', [2999, 6999], 'none', ['power bank', 'magnetic', 'battery'], 105],
    ['mobile-accessories', 'Silicone Case with MagSafe', [999, 2499], 'none', ['case', 'cover', 'magsafe'], 108],
    ['mobile-accessories', 'Multi-Device Wireless Charger', [2999, 7999], 'none', ['wireless charger', 'qi'], 102],
  ],
  'fashion-men': [
    ['men-shirts', 'Men Blue & Black Check Shirt', [799, 1999], 'apparel', ['shirt', 'check', 'casual'], 83],
    ['men-shirts', 'Men Plaid Flannel Shirt', [899, 2199], 'apparel', ['shirt', 'plaid', 'flannel'], 85],
    ['men-shirts', 'Men Short Sleeve Shirt', [599, 1499], 'apparel', ['shirt', 'half sleeve', 'summer'], 86],
    ['men-shirts', 'Men Gaming Graphic T-Shirt', [499, 1299], 'apparel', ['tshirt', 't-shirt', 'tee', 'gaming'], 84],
    ['men-footwear', 'High-Top Basketball Sneakers', [3999, 12999], 'shoes', ['shoes', 'sneakers', 'high top'], 88],
    ['men-footwear', 'Retro Rider Trainers', [2999, 6999], 'shoes', ['shoes', 'trainers', 'running', 'sneakers'], 90],
    ['men-footwear', 'Off-White & Red Sports Sneakers', [1999, 4999], 'shoes', ['shoes', 'sports shoes', 'sneakers'], 91],
    ['men-footwear', 'Street Style Chunky Sneakers', [2499, 5499], 'shoes', ['shoes', 'chunky', 'sneakers'], 92],
    ['men-watches', 'Brown Leather Strap Watch', [1999, 5999], 'none', ['watch', 'leather', 'analog'], 93],
    ['men-watches', 'Master Collection Automatic Watch', [24999, 59999], 'none', ['watch', 'automatic', 'luxury'], 94],
    ['men-watches', 'Diver Style Steel Watch', [8999, 24999], 'none', ['watch', 'diver', 'steel'], 98],
    ['men-sunglasses', 'Black Wayfarer Sunglasses', [799, 2499], 'none', ['sunglasses', 'shades', 'uv'], 154],
    ['men-sunglasses', 'Classic Aviator Sunglasses', [999, 2999], 'none', ['sunglasses', 'aviator', 'shades'], 155],
    ['men-sunglasses', 'Square Frame Sunglasses', [699, 1999], 'none', ['sunglasses', 'square', 'shades'], 158],
  ],
  'fashion-women': [
    ['women-dresses', 'Women Blue Frock Dress', [799, 1999], 'apparel', ['dress', 'frock', 'casual'], 162],
    ['women-dresses', 'Girls Summer Floral Dress', [699, 1799], 'apparel', ['dress', 'summer', 'floral'], 163],
    ['women-dresses', 'Women Grey Bodycon Dress', [899, 2299], 'apparel', ['dress', 'bodycon', 'party'], 164],
    ['women-dresses', 'Women Tartan Check Dress', [999, 2499], 'apparel', ['dress', 'tartan', 'check'], 166],
    ['women-dresses', 'Women Pea Green Midi Dress', [1199, 2999], 'apparel', ['dress', 'midi', 'party'], 180],
    ['women-footwear', 'Women Pointed Block Heels', [1499, 3999], 'shoes', ['heels', 'shoes', 'party'], 186],
    ['women-footwear', 'Women Golden Party Heels', [1299, 3499], 'shoes', ['heels', 'golden', 'shoes'], 187],
    ['women-footwear', 'Women Casual Slip-Ons', [799, 1999], 'shoes', ['flats', 'slip on', 'shoes'], 188],
    ['women-footwear', 'Women Red Stilettos', [1499, 3999], 'shoes', ['heels', 'stilettos', 'shoes'], 189],
    ['women-bags', 'Women Blue Structured Handbag', [1299, 3999], 'none', ['bag', 'handbag', 'office'], 172],
    ['women-bags', 'Women Leather Shoulder Bag', [1999, 5999], 'none', ['bag', 'leather', 'shoulder bag'], 173],
    ['women-bags', 'Women Black Tote Handbag', [999, 2999], 'none', ['bag', 'tote', 'handbag'], 176],
    ['women-jewellery', 'Green Crystal Drop Earrings', [499, 1499], 'none', ['earrings', 'jewellery', 'crystal'], 182],
    ['women-jewellery', 'Green Oval Statement Earrings', [599, 1599], 'none', ['earrings', 'jewellery', 'statement'], 183],
    ['women-jewellery', 'Tropical Fringe Earrings', [399, 1199], 'none', ['earrings', 'jewellery', 'boho'], 184],
  ],
  'home-kitchen': [
    ['cookware', 'Carbon Steel Wok', [899, 2499], 'none', ['wok', 'kadai', 'cookware'], 52],
    ['cookware', 'Non-Stick Frying Pan 26cm', [699, 1799], 'none', ['pan', 'non-stick', 'cookware'], 68],
    ['cookware', 'Steel Pot with Glass Lid', [999, 2499], 'none', ['pot', 'steel', 'cookware'], 71],
    ['appliances', 'Personal Blender with Bottles', [1999, 4999], 'color', ['blender', 'mixer', 'smoothie'], 51],
    ['appliances', 'Induction Electric Stove', [2499, 5999], 'none', ['stove', 'induction', 'cooktop'], 56],
    ['appliances', 'Hand Blender 400W', [999, 2499], 'none', ['hand blender', 'mixer'], 61],
    ['appliances', 'Microwave Oven 20L', [6999, 12999], 'none', ['microwave', 'oven'], 66],
    ['decor', 'Artificial Showpiece Plant', [499, 1499], 'none', ['plant', 'decor', 'showpiece'], 45],
    ['decor', 'Ceramic Plant Pot', [399, 1199], 'color', ['plant pot', 'planter', 'decor'], 46],
    ['decor', 'Bedside Table Lamp', [799, 2499], 'none', ['lamp', 'lighting', 'decor'], 47],
    ['furniture', 'Upholstered King Bed', [39999, 89999], 'none', ['bed', 'king size', 'furniture'], 11],
    ['furniture', '3-Seater Fabric Sofa', [29999, 69999], 'none', ['sofa', 'couch', 'furniture'], 12],
    ['furniture', 'Wooden Bedside Table', [3999, 9999], 'none', ['bedside table', 'nightstand', 'furniture'], 13],
  ],
  beauty: [
    ['makeup', 'Lash Princess Volume Mascara', [299, 699], 'none', ['mascara', 'eyes', 'makeup'], 1],
    ['makeup', 'Eyeshadow Palette with Mirror', [599, 1499], 'none', ['eyeshadow', 'palette', 'makeup'], 2],
    ['makeup', 'Matte Red Lipstick', [349, 899], 'shade', ['lipstick', 'makeup', 'matte'], 4],
    ['makeup', 'Gel Finish Nail Polish', [199, 499], 'shade', ['nail polish', 'nails', 'makeup'], 5],
    ['fragrance', 'Unisex Citrus Eau de Toilette', [1499, 3999], 'volume', ['perfume', 'fragrance', 'unisex'], 6],
    ['fragrance', 'Floral Eau de Parfum for Women', [2499, 6999], 'volume', ['perfume', 'fragrance', 'women'], 8],
    ['fragrance', 'Shine Eau de Parfum', [1999, 5999], 'volume', ['perfume', 'fragrance'], 9],
    ['fragrance', 'Bloom Eau de Parfum', [2999, 7999], 'volume', ['perfume', 'fragrance', 'floral'], 10],
    ['skincare', 'Super Leaves Hand Soap', [249, 599], 'volume', ['hand soap', 'bath', 'skincare'], 118],
    ['skincare', 'Ultra Moisture Shea Body Wash', [299, 799], 'volume', ['body wash', 'shower gel', 'skincare'], 119],
    ['skincare', 'Men Body & Face Lotion', [249, 699], 'volume', ['lotion', 'moisturiser', 'men', 'skincare'], 120],
  ],
  books: [
    ['fiction', 'Pride and Prejudice', [199, 499], 'format', ['novel', 'classic', 'fiction', 'book'], 'ol:14348537', { author: 'Jane Austen' }],
    ['fiction', 'The Adventures of Sherlock Holmes', [249, 549], 'format', ['mystery', 'detective', 'fiction', 'book'], 'ol:6717853', { author: 'Arthur Conan Doyle' }],
    ['fiction', "Harry Potter and the Philosopher's Stone", [399, 799], 'format', ['fantasy', 'fiction', 'book'], 'ol:15155833', { author: 'J. K. Rowling' }],
    ['non-fiction', 'Atomic Habits', [399, 799], 'format', ['self help', 'habits', 'book'], 'ol:12539702', { author: 'James Clear' }],
    ['non-fiction', 'Rich Dad Poor Dad', [249, 499], 'format', ['finance', 'money', 'book'], 'ol:8315603', { author: 'Robert T. Kiyosaki' }],
    ['non-fiction', 'Ikigai', [299, 599], 'format', ['self help', 'japanese', 'book'], 'ol:11300391', { author: 'Héctor García' }],
    ['non-fiction', 'Sapiens', [399, 799], 'format', ['history', 'humanity', 'book'], 'ol:8634250', { author: 'Yuval Noah Harari' }],
    ['non-fiction', 'Wings of Fire', [249, 499], 'format', ['autobiography', 'india', 'book'], 'ol:9153819', { author: 'A. P. J. Abdul Kalam' }],
    ['kids-books', 'The Very Hungry Caterpillar', [199, 499], 'format', ['kids', 'picture book', 'book'], 'ol:7835968', { author: 'Eric Carle' }],
    ['kids-books', "Charlotte's Web", [249, 499], 'format', ['kids', 'stories', 'book'], 'ol:8461797', { author: 'E. B. White' }],
    ['kids-books', 'The Jungle Book', [199, 449], 'format', ['kids', 'classic', 'book'], 'ol:3344204', { author: 'Rudyard Kipling' }],
  ],
  sports: [
    ['cricket', 'Leather Cricket Ball', [299, 899], 'none', ['cricket', 'ball', 'leather'], 142],
    ['cricket', 'English Willow Cricket Bat', [2499, 8999], 'none', ['cricket', 'bat', 'willow'], 143],
    ['cricket', 'Cricket Helmet with Steel Grill', [1499, 3999], 'none', ['cricket', 'helmet', 'safety'], 144],
    ['ball-sports', 'Basketball Size 7', [699, 1999], 'none', ['basketball', 'ball'], 140],
    ['ball-sports', 'Training Football Size 5', [599, 1499], 'none', ['football', 'soccer', 'ball'], 147],
    ['ball-sports', 'Beach Volleyball', [499, 1299], 'none', ['volleyball', 'ball', 'beach'], 153],
    ['racquet-sports', 'Feather Shuttlecocks (Pack of 6)', [399, 999], 'none', ['badminton', 'shuttlecock'], 146],
    ['racquet-sports', 'Graphite Tennis Racket', [2499, 7999], 'none', ['tennis', 'racket', 'racquet'], 152],
    ['racquet-sports', 'Tennis Balls (Can of 3)', [299, 799], 'none', ['tennis', 'ball'], 151],
  ],
};

const sizeLabels = {
  storage: 'Storage', apparel: 'Size', waist: 'Waist', shoes: 'UK Size', volume: 'Quantity',
  shade: 'Shade', format: 'Format', frame: 'Frame', color: null, none: null,
};

// Real photos show one colourway, so variants only vary by size / storage / volume
// (a colour picker would not match the photo).
function variantAxes(kind, catId) {
  return withoutColours(rawVariantAxes(kind, catId));
}
function withoutColours(axes) {
  return { ...axes, colors: kindHasShade(axes) ? axes.colors : [null] };
}
function kindHasShade(axes) {
  return axes.shade === true;
}
function rawVariantAxes(kind, catId) {
  const apparelColors = ['Black', 'White', 'Navy', 'Olive', 'Maroon', 'Grey', 'Beige', 'Blue'];
  const womenColors = ['Pink', 'Black', 'White', 'Beige', 'Teal', 'Red', 'Purple'];
  const techColors = ['Black', 'White', 'Blue', 'Silver', 'Green', 'Grey'];
  switch (kind) {
    case 'color':
      return { colors: pickN(catId === 'fashion-women' ? womenColors : techColors, ri(2, 4)), sizes: [null] };
    case 'storage':
      return { colors: pickN(techColors, ri(2, 3)), sizes: pickN(['64 GB', '128 GB', '256 GB', '512 GB'], ri(2, 3)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)), priceStep: [0, 2000, 6000, 12000] };
    case 'apparel':
      return { colors: pickN(catId === 'fashion-women' ? womenColors : apparelColors, ri(2, 4)), sizes: ['S', 'M', 'L', 'XL', 'XXL'].slice(0, ri(4, 5)) };
    case 'waist':
      return { colors: pickN(['Blue', 'Black', 'Grey', 'Beige', 'Olive'], ri(2, 3)), sizes: ['28', '30', '32', '34', '36'] };
    case 'shoes':
      return { colors: pickN(['Black', 'White', 'Grey', 'Navy', 'Red', 'Beige'], ri(2, 3)), sizes: catId === 'fashion-women' ? ['3', '4', '5', '6', '7'] : ['6', '7', '8', '9', '10'] };
    case 'volume':
      return { colors: [null], sizes: ['30 ml', '50 ml', '100 ml'].slice(0, ri(2, 3)), priceStep: [0, 150, 400] };
    case 'shade':
      return { colors: pickN(['Red', 'Maroon', 'Pink', 'Orange', 'Purple'], ri(3, 4)), sizes: [null], shade: true };
    case 'format':
      return { colors: [null], sizes: ['Paperback', 'Hardcover'], priceStep: [0, 250] };
    case 'frame':
      return { colors: pickN(['Black', 'Red', 'Blue', 'Green'], 2), sizes: ['M (17")', 'L (19")'] };
    default:
      return { colors: [null], sizes: [null] };
  }
}

const sellers = ['RetailHub Traders', 'PrimeKart Sellers', 'CityMart Retail', 'Everyday Essentials', 'BlueOak Commerce', 'Sunrise Distributors'];

const highlightPool = {
  electronics: ['Up to 40 hours battery life', 'Fast charging support', '1 year manufacturer warranty', 'Bluetooth 5.3 connectivity', 'Lightweight and compact design', 'Built-in microphone for calls'],
  mobiles: ['6.7" FHD+ 120Hz display', '50MP AI triple camera', '5000 mAh battery with fast charging', 'Octa-core processor', 'Dual SIM, 5G ready', '1 year warranty on device'],
  'fashion-men': ['100% cotton, breathable fabric', 'Regular fit', 'Machine washable', 'Colour-fast dyes', 'Comfortable all-day wear', 'Easy returns'],
  'fashion-women': ['Soft, skin-friendly fabric', 'Flattering fit', 'Machine washable', 'Perfect for casual and festive wear', 'Lightweight and comfortable', 'Easy returns'],
  'home-kitchen': ['Food-grade materials', 'Easy to clean', 'Energy efficient', '1 year warranty', 'Compact design for Indian kitchens', 'ISI certified'],
  beauty: ['Dermatologically tested', 'Suitable for all skin types', 'Paraben free', 'Cruelty free', 'Lightweight, non-greasy formula', 'Long lasting'],
  books: ['Easy-to-read print', 'Bestselling author', 'Recommended for ages 12+', 'Includes discussion guide', 'Printed on recycled paper', 'Great gift choice'],
  sports: ['Durable and long lasting', 'Ergonomic design', 'Suitable for beginners and pros', 'Lightweight build', 'Weather resistant', '6 months warranty'],
};

const specKeys = {
  electronics: () => ({ 'Model Number': `VX-${ri(100, 999)}`, Connectivity: pick(['Bluetooth 5.3', 'Bluetooth 5.0', 'Wi-Fi + Bluetooth', 'Wired']), 'Battery Life': `${ri(8, 40)} hours`, Warranty: '1 Year', 'In the Box': 'Device, Cable, User Manual' }),
  mobiles: () => ({ Display: `${pick(['6.5', '6.7', '6.1'])} inch`, RAM: `${pick([4, 6, 8, 12])} GB`, Battery: `${pick([4500, 5000, 6000])} mAh`, Processor: 'Octa Core 2.4 GHz', 'Operating System': 'Android 16', Warranty: '1 Year' }),
  'fashion-men': () => ({ Fabric: pick(['Cotton', 'Cotton Blend', 'Denim', 'Polyester', 'Synthetic']), Fit: pick(['Slim', 'Regular', 'Relaxed']), Pattern: pick(['Solid', 'Striped', 'Checked', 'Printed']), Occasion: pick(['Casual', 'Formal', 'Sports']), 'Wash Care': 'Machine wash cold' }),
  'fashion-women': () => ({ Fabric: pick(['Rayon', 'Cotton', 'Georgette', 'Linen', 'Synthetic']), Fit: pick(['Regular', 'Flared', 'Straight']), Pattern: pick(['Floral', 'Solid', 'Printed']), Occasion: pick(['Casual', 'Party', 'Festive']), 'Wash Care': 'Hand wash' }),
  'home-kitchen': () => ({ Material: pick(['Aluminium', 'Stainless Steel', 'Ceramic', 'Cotton', 'Plastic']), Capacity: pick(['1.5 L', '3 L', '5 L', 'N/A']), Warranty: pick(['1 Year', '6 Months', '2 Years']), 'Country of Origin': 'India' }),
  beauty: () => ({ 'Skin Type': 'All', 'Key Ingredient': pick(['Vitamin C', 'Hyaluronic Acid', 'Niacinamide', 'Aloe Vera', 'Shea Butter']), 'Shelf Life': '24 Months', 'Country of Origin': 'India' }),
  books: () => ({ Author: pick(['A. Raman', 'Meera Iyer', 'J. Thomas', 'S. Kulkarni', 'R. Banerjee']), Publisher: pick(brandsByCategory.books), Language: 'English', Pages: String(ri(120, 480)), ISBN: `978-${ri(1000000000, 9999999999)}` }),
  sports: () => ({ Material: pick(['PVC', 'Steel', 'Nylon', 'Aluminium', 'Polyester']), 'Suitable For': pick(['Men & Women', 'Unisex', 'Adults']), Warranty: pick(['6 Months', '1 Year']), 'Country of Origin': 'India' }),
};

const descriptions = {
  electronics: n => `The ${n} delivers rich, reliable performance for everyday life. Designed with premium materials and tuned by our audio and hardware team, it is built to keep up with work, travel and play.`,
  mobiles: n => `Meet the ${n} — a smooth display, all-day battery and a capable camera system in a slim body. Ideal for streaming, gaming and capturing moments.`,
  'fashion-men': n => `This ${n} is crafted from soft, breathable fabric and cut for a sharp, comfortable fit. Pair it with your favourite denims or chinos for an effortless look.`,
  'fashion-women': n => `Step out in style with this ${n}. Thoughtfully designed with flattering lines and comfortable fabric, it moves easily from day to evening.`,
  'home-kitchen': n => `Upgrade your home with the ${n}. Sturdy, easy to maintain and designed for Indian homes and kitchens.`,
  beauty: n => `Our ${n} is formulated with skin-loving ingredients for visible results. Lightweight, quick-absorbing and suitable for daily use.`,
  books: n => `"${n}" is a page-turner loved by readers across the country. A perfect addition to your bookshelf or a thoughtful gift.`,
  sports: n => `Train harder and recover better with the ${n}. Built for durability and comfort, whether you are a beginner or a seasoned athlete.`,
};

function ratingBreakdown(count, avg) {
  // Skew distribution towards the average.
  const w = {
    5: Math.max(0.05, (avg - 3) * 0.45),
    4: 0.3,
    3: Math.max(0.04, (4.6 - avg) * 0.18),
    2: Math.max(0.02, (4.6 - avg) * 0.07),
    1: Math.max(0.02, (4.6 - avg) * 0.06),
  };
  const sum = w[1] + w[2] + w[3] + w[4] + w[5];
  const out = {};
  let acc = 0;
  [1, 2, 3, 4].forEach(k => {
    out[k] = Math.round((w[k] / sum) * count);
    acc += out[k];
  });
  out[5] = Math.max(0, count - acc);
  return out;
}

const products = [];
let pid = 1;
const dealIds = new Set();
categoryDefs.forEach(cat => {
  T[cat.id].forEach(([subId, baseName, [lo, hi], kind, tags, photoKey, extra]) => {
    const photos = photosOf(photoKey);
    const brand = pick(brandsByCategory[cat.id]);
    const sub = categories.find(c => c.id === subId);
    const id = `p${String(pid).padStart(3, '0')}`;
    pid += 1;
    const mrp = round9(lo + rand() * (hi - lo));
    const discountPct = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
    const basePrice = discountPct === 0 ? mrp : round9(mrp * (1 - discountPct / 100));
    const axes = variantAxes(kind, cat.id);
    const variants = [];
    let vi = 1;
    axes.colors.forEach((colorName, ci) => {
      axes.sizes.forEach((size, si) => {
        const step = axes.priceStep ? axes.priceStep[si] || 0 : 0;
        const vMrp = mrp + step;
        const vPrice = basePrice + Math.round(step * 0.9);
        const r = rand();
        const stock = r < 0.12 ? 0 : r < 0.27 ? ri(1, 5) : ri(6, 60);
        const color = colorName ? col(colorName) : null;
        variants.push({
          id: `${id}-v${vi}`,
          productId: id,
          color,
          size,
          price: vPrice,
          mrp: vMrp,
          stock,
          images: photos,
        });
        vi += 1;
      });
    });
    // A few products fully out of stock to demo the "Notify me" flow.
    if (rand() < 0.05) variants.forEach(v => (v.stock = 0));
    const stock = variants.reduce((s, v) => s + v.stock, 0);
    const images = photos;
    const rating = Math.round((3.2 + rand() * 1.7) * 10) / 10;
    const ratingCount = ri(25, 18000);
    const name = cat.id === 'books' ? baseName : `${brand} ${baseName}`;
    const createdAt = new Date(NOW - ri(1, 240) * DAY).toISOString();
    const isDealOfDay = false;
    products.push({
      id, name, brand, categoryId: cat.id, subCategoryId: subId,
      images,
      price: variants[0].price,
      mrp: variants[0].mrp,
      rating, ratingCount, ratingBreakdown: ratingBreakdown(ratingCount, rating),
      stock,
      variants,
      sizeLabel: sizeLabels[kind],
      highlights: pickN(highlightPool[cat.id], 4),
      description: descriptions[cat.id](baseName.toLowerCase()),
      specs: {
        Brand: brand,
        ...specKeys[cat.id](),
        ...(extra && extra.author ? { Author: extra.author } : {}),
      },
      tags: [...tags, cat.name.toLowerCase(), sub.name.toLowerCase()],
      isReturnable: cat.id !== 'beauty' && !(cat.id === 'books' && rand() < 0.5),
      returnDays: cat.id.startsWith('fashion') ? 10 : 7,
      isDealOfDay,
      isBestSeller: rand() < 0.25,
      freeDelivery: variants[0].price >= 499 || rand() < 0.2,
      seller: pick(sellers),
      createdAt,
    });
  });
});

// Category tiles use a real photo of one of their products.
categories.forEach(c => {
  const p = products.find(x => (c.parentId ? x.subCategoryId : x.categoryId) === c.id);
  if (p) c.image = p.images[0];
});

// Deal of the Day: 6 products with deep discounts and stock.
pickN(products.filter(p => p.stock > 10), 6).forEach(p => {
  p.isDealOfDay = true;
  dealIds.add(p.id);
  p.variants.forEach(v => {
    v.price = round9(v.mrp * 0.45);
  });
  p.price = p.variants[0].price;
});
// Make sure a couple of products explicitly have low stock for the demo.
products.slice(0, 3).forEach(p => {
  p.variants[0].stock = 3;
  p.stock = p.variants.reduce((s, v) => s + v.stock, 0);
});

// ---------- reviews ----------
const firstNames = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Kabir', 'Isha', 'Vihaan', 'Meera', 'Arjun', 'Sara', 'Nikhil', 'Pooja', 'Rahul', 'Sneha', 'Karan', 'Neha', 'Aditya', 'Priya', 'Farhan', 'Lakshmi', 'Joseph', 'Harpreet', 'Tanvi', 'Siddharth'];
const lastInitials = ['S.', 'K.', 'M.', 'P.', 'R.', 'D.', 'G.', 'B.', 'N.', 'T.'];
const reviewText = {
  5: [['Absolutely love it!', 'Exceeded my expectations. Great quality for the price and delivery was quick.'], ['Worth every rupee', 'Using it daily for two weeks now and it works perfectly. Highly recommended.'], ['Excellent product', 'Premium build and looks exactly like the pictures. Packaging was also good.'], ['Superb', 'Bought it as a gift and they loved it. Will buy again from this brand.']],
  4: [['Very good', 'Good quality and value for money. Only small issue is the packaging could be better.'], ['Nice product', 'Works as described. Delivery took a day longer than expected but overall happy.'], ['Good buy', 'Comfortable and well made. Would have given 5 stars if there were more colour options.']],
  3: [['Decent', 'It is okay for the price. Nothing extraordinary, does the job.'], ['Average', 'Quality is average. Expected a bit more after reading the reviews.']],
  2: [['Not satisfied', 'The product is not as good as shown. Size/fit was slightly off for me.'], ['Could be better', 'Stopped working properly after a few days of use. Replacement process was easy though.']],
  1: [['Disappointed', 'Did not meet expectations at all. Returned it.'], ['Poor quality', 'Material feels cheap. Would not recommend.']],
};
function weightedStar(avg) {
  const r = rand();
  if (avg >= 4.3) return r < 0.6 ? 5 : r < 0.88 ? 4 : r < 0.95 ? 3 : r < 0.98 ? 2 : 1;
  if (avg >= 3.8) return r < 0.4 ? 5 : r < 0.75 ? 4 : r < 0.88 ? 3 : r < 0.95 ? 2 : 1;
  return r < 0.25 ? 5 : r < 0.5 ? 4 : r < 0.75 ? 3 : r < 0.88 ? 2 : 1;
}
const reviews = [];
let rid = 1;
products.forEach(p => {
  const n = ri(5, 15);
  for (let i = 0; i < n; i += 1) {
    const star = weightedStar(p.rating);
    const [title, text] = pick(reviewText[star]);
    reviews.push({
      id: `r${rid}`,
      productId: p.id,
      userName: `${pick(firstNames)} ${pick(lastInitials)}`,
      rating: star,
      title,
      text,
      date: new Date(NOW - ri(1, 200) * DAY).toISOString(),
      images: rand() < 0.15 ? [p.images[0]] : [],
      helpfulCount: ri(0, 240),
    });
    rid += 1;
  }
});

// ---------- banners ----------
const ph = key => PHOTOS[String(key)].images[0];
const banners = [
  { id: 'b1', title: 'Bass Drop Sale 🎧', subtitle: 'Up to 60% off on headphones, earbuds & speakers', cta: 'Shop now', color: '#410574', accent: '#DE24F8', icon: 'headset-outline', image: ph(101), tag: 'UP TO 60% OFF', placement: 'home', target: { type: 'category', categoryId: 'electronics' } },
  { id: 'b2', title: 'Drip Check 👗', subtitle: 'Fresh fits at flat 50% off and more', cta: 'Explore', color: '#7C03B2', accent: '#F6A8FF', icon: 'shirt-outline', image: ph(164), tag: 'FLAT 50% OFF', placement: 'home', target: { type: 'list', title: 'Fashion — 50% off & more', filters: { categoryIds: ['fashion-men', 'fashion-women'], minDiscount: 50 } } },
  { id: 'b3', title: 'Phone Glow-Up 📱', subtitle: 'Latest 5G phones with no-cost EMI', cta: 'Grab deals', color: '#54018B', accent: '#B11BD8', icon: 'phone-portrait-outline', image: ph(133), tag: 'NO-COST EMI', placement: 'home', target: { type: 'category', categoryId: 'mobiles' } },
  { id: 'b4', title: 'Room Makeover ✨', subtitle: 'Decor, kitchen & furniture from Rs. 399', cta: 'Discover', color: '#2A0B52', accent: '#7C03B2', icon: 'home-outline', image: ph(12), tag: 'FROM ₹399', placement: 'home', target: { type: 'category', categoryId: 'home-kitchen' } },
  { id: 'b5', title: 'Steals Under ₹999 💸', subtitle: 'Pocket-friendly picks across categories', cta: 'View all', color: '#8E0FB8', accent: '#F06BFF', icon: 'pricetags-outline', image: ph(154), tag: 'UNDER ₹999', placement: 'home', target: { type: 'list', title: 'Under Rs. 999', filters: { priceMax: 999 } } },
  { id: 'cb1', title: 'Game On 🏏', subtitle: 'Sports gear from Rs. 299', cta: 'Shop', color: '#410574', accent: '#DE24F8', icon: 'baseball-outline', image: ph(143), tag: 'FROM ₹299', placement: 'category', categoryId: 'sports', target: { type: 'category', categoryId: 'sports' } },
  { id: 'cb2', title: 'Glow Up ✨', subtitle: 'Makeup & fragrance bestsellers', cta: 'Shop', color: '#7C03B2', accent: '#DE24F8', icon: 'sparkles-outline', image: ph(8), tag: 'BESTSELLERS', placement: 'category', categoryId: 'beauty', target: { type: 'category', categoryId: 'beauty' } },
  { id: 'cb3', title: 'Read More 📚', subtitle: 'Bestselling books from Rs. 199', cta: 'Shop', color: '#54018B', accent: '#DE24F8', icon: 'book-outline', image: ph('ol:12539702'), tag: 'FROM ₹199', placement: 'category', categoryId: 'books', target: { type: 'category', categoryId: 'books' } },
];

// ---------- coupons (section 7.3) ----------
const future = new Date(NOW + 365 * DAY).toISOString();
const coupons = [
  { code: 'WELCOME10', title: '10% off on your first order', description: 'Get 10% off up to Rs. 200 on your first order. Min cart value Rs. 299.', type: 'percent', value: 10, maxDiscount: 200, minCart: 299, categoryIds: null, firstOrderOnly: true, excludeDeals: false, notWithExpress: false, expiry: future },
  { code: 'SAVE100', title: 'Flat Rs. 100 off', description: 'Flat Rs. 100 off on orders of Rs. 999 and above.', type: 'flat', value: 100, maxDiscount: null, minCart: 999, categoryIds: null, firstOrderOnly: false, excludeDeals: false, notWithExpress: false, expiry: future },
  { code: 'FREESHIP', title: 'Free delivery', description: 'Delivery charge waived on any cart value. Not valid with Express delivery.', type: 'shipping', value: 0, maxDiscount: null, minCart: 0, categoryIds: null, firstOrderOnly: false, excludeDeals: false, notWithExpress: true, expiry: future },
  { code: 'FASHION20', title: '20% off on Fashion', description: '20% off up to Rs. 500 on Fashion Men & Women items in your cart.', type: 'percent', value: 20, maxDiscount: 500, minCart: 0, categoryIds: ['fashion-men', 'fashion-women'], firstOrderOnly: false, excludeDeals: false, notWithExpress: false, expiry: future },
  { code: 'MEGA500', title: 'Flat Rs. 500 off', description: 'Flat Rs. 500 off on orders of Rs. 4,999 and above. Not valid on Deal of the Day items.', type: 'flat', value: 500, maxDiscount: null, minCart: 4999, categoryIds: null, firstOrderOnly: false, excludeDeals: true, notWithExpress: false, expiry: future },
  { code: 'EXPIRED50', title: 'Flat Rs. 50 off', description: 'Flat Rs. 50 off on any order.', type: 'flat', value: 50, maxDiscount: null, minCart: 0, categoryIds: null, firstOrderOnly: false, excludeDeals: false, notWithExpress: false, expiry: new Date(NOW - 30 * DAY).toISOString() },
];

// ---------- pincodes (~50) ----------
const pincodes = [
  ['110001', 'New Delhi', 'Delhi'], ['110017', 'New Delhi', 'Delhi'], ['110085', 'New Delhi', 'Delhi'], ['110092', 'New Delhi', 'Delhi'],
  ['400001', 'Mumbai', 'Maharashtra'], ['400050', 'Mumbai', 'Maharashtra'], ['400076', 'Mumbai', 'Maharashtra'], ['400703', 'Navi Mumbai', 'Maharashtra'],
  ['560001', 'Bengaluru', 'Karnataka'], ['560034', 'Bengaluru', 'Karnataka'], ['560066', 'Bengaluru', 'Karnataka'], ['560103', 'Bengaluru', 'Karnataka'],
  ['600001', 'Chennai', 'Tamil Nadu'], ['600028', 'Chennai', 'Tamil Nadu'], ['600096', 'Chennai', 'Tamil Nadu'],
  ['700001', 'Kolkata', 'West Bengal'], ['700019', 'Kolkata', 'West Bengal'], ['700091', 'Kolkata', 'West Bengal'],
  ['411001', 'Pune', 'Maharashtra'], ['411057', 'Pune', 'Maharashtra'],
  ['500001', 'Hyderabad', 'Telangana'], ['500032', 'Hyderabad', 'Telangana'], ['500081', 'Hyderabad', 'Telangana'],
  ['380001', 'Ahmedabad', 'Gujarat'], ['380015', 'Ahmedabad', 'Gujarat'], ['395003', 'Surat', 'Gujarat'],
  ['302001', 'Jaipur', 'Rajasthan'], ['302017', 'Jaipur', 'Rajasthan'], ['313001', 'Udaipur', 'Rajasthan'],
  ['226001', 'Lucknow', 'Uttar Pradesh'], ['201301', 'Noida', 'Uttar Pradesh'], ['208001', 'Kanpur', 'Uttar Pradesh'],
  ['122001', 'Gurugram', 'Haryana'], ['160017', 'Chandigarh', 'Chandigarh'], ['141001', 'Ludhiana', 'Punjab'],
  ['452001', 'Indore', 'Madhya Pradesh'], ['462001', 'Bhopal', 'Madhya Pradesh'],
  ['440001', 'Nagpur', 'Maharashtra'], ['682001', 'Kochi', 'Kerala'], ['695001', 'Thiruvananthapuram', 'Kerala'],
  ['641001', 'Coimbatore', 'Tamil Nadu'], ['641018', 'Coimbatore', 'Tamil Nadu'], ['530001', 'Visakhapatnam', 'Andhra Pradesh'],
  ['751001', 'Bhubaneswar', 'Odisha'], ['781001', 'Guwahati', 'Assam'], ['800001', 'Patna', 'Bihar'],
  ['834001', 'Ranchi', 'Jharkhand'], ['248001', 'Dehradun', 'Uttarakhand'], ['403001', 'Panaji', 'Goa'], ['180001', 'Jammu', 'Jammu & Kashmir'],
].map(([pincode, city, state]) => ({ pincode, city, state }));
const nonServiceablePincodes = ['999999', '744101', '194101', '737101', '790001'];

// ---------- demo user ----------
const demoUser = {
  id: 'u_demo',
  name: 'Riya Sharma',
  mobile: '9876543210',
  email: 'demo@shopverse.app',
  password: 'Demo@123',
  gender: 'female',
  dob: '14/08/1995',
  avatar: null,
  createdAt: new Date(NOW - 400 * DAY).toISOString(),
};
const demoAddresses = [
  { id: 'a_demo_1', userId: 'u_demo', name: 'Riya Sharma', mobile: '9876543210', pincode: '560034', line1: 'Flat 302, Lakeview Residency', line2: '17th Main Road, Koramangala', landmark: 'Near Forum Mall', city: 'Bengaluru', state: 'Karnataka', type: 'Home', isDefault: true },
  { id: 'a_demo_2', userId: 'u_demo', name: 'Riya Sharma', mobile: '9876543210', pincode: '400076', line1: '5th Floor, Orbit Tech Park', line2: 'Hiranandani Gardens, Powai', landmark: 'Opp. Lake Gate', city: 'Mumbai', state: 'Maharashtra', type: 'Work', isDefault: false },
];
const demoWishlist = pickN(products.filter(p => p.stock > 0 && !p.isDealOfDay), 6).map((p, i) => ({
  productId: p.id,
  // First two items were added at a higher price so the "Price drop" tag shows.
  priceAtAdd: i < 2 ? p.price + round9(p.price * 0.12) + 1 : p.price,
}));
// Pre-loaded orders (statuses are relative to login time — see orderService.seedDemoOrders)
const orderCandidates = products.filter(p => p.stock > 5 && p.isReturnable);
const demoOrders = [
  { key: 'delivered', productIds: [orderCandidates[2].id, orderCandidates[30].id], payment: 'upi' },
  { key: 'in_transit', productIds: [orderCandidates[12].id], payment: 'card' },
  { key: 'placed', productIds: [orderCandidates[45].id], payment: 'cod' },
  { key: 'cancelled', productIds: [orderCandidates[20].id], payment: 'upi' },
];

// ---------- misc ----------
const trendingSearches = ['sneakers', 'headphones', 'smartwatch', '5g phone', 'dress', 'perfume', 'atomic habits', 'cricket bat', 'sunglasses', 'earbuds'];

const faqs = [
  ['How do I track my order?', 'Go to Account > My Orders, open the order and tap "Track order" to see the live timeline.'],
  ['Can I cancel my order?', 'Yes. Orders can be cancelled any time before they are shipped from the order details page.'],
  ['What is the return policy?', 'Most items can be returned or replaced within 7 days of delivery (10 days for fashion). Items like beauty products are not returnable.'],
  ['When will I get my refund?', 'Refunds for prepaid orders are initiated to the original payment method as soon as the return is picked up, and usually reflect in 5-7 business days.'],
  ['Is Cash on Delivery available?', 'Yes, COD is available for orders up to Rs. 10,000 with a Rs. 10 handling fee.'],
  ['How do I apply a coupon?', 'On the cart page tap "Apply coupon", pick a coupon from the list or type a code. Only one coupon can be used per order.'],
  ['What are the delivery charges?', 'Standard delivery is free for orders of Rs. 499 and above, otherwise Rs. 40. Express delivery costs Rs. 99 extra.'],
  ['How do I change my delivery address?', 'You can add or edit addresses from Account > Saved addresses, or while placing an order in the checkout address step.'],
  ['Is it safe to save my card?', 'We only keep the last 4 digits of your card for display. Full card numbers and CVV are never stored.'],
  ['Why is my pincode not serviceable?', 'We are expanding fast! Some remote pincodes are not yet covered. Try a nearby pincode or check back soon.'],
  ['How do I write a review?', 'Once your order is delivered, open it from My Orders and tap "Rate & review" next to the item.'],
  ['How can I contact support?', 'Use the Contact us section below to call, email or chat with our support team, available 9 AM to 9 PM.'],
  ['Can I change my order after placing it?', 'Orders cannot be edited after placing them. You can cancel and place a new order before it is shipped.'],
].map(([question, answer], i) => ({ id: `faq${i + 1}`, question, answer }));

const offerNotifications = [
  { id: 'n_offer_1', type: 'offer', title: 'Weekend sale is live 🎉', body: 'Up to 60% off on electronics. Use SAVE100 for an extra Rs. 100 off.', orderId: null, isRead: false, createdAt: new Date(NOW - 2 * 3600000).toISOString() },
  { id: 'n_offer_2', type: 'offer', title: 'Free delivery on everything', body: 'Apply FREESHIP at checkout and skip the delivery fee today.', orderId: null, isRead: false, createdAt: new Date(NOW - 26 * 3600000).toISOString() },
  { id: 'n_offer_3', type: 'offer', title: 'Fashion Week: 20% off', body: 'Use FASHION20 on fashion items, up to Rs. 500 off.', orderId: null, isRead: true, createdAt: new Date(NOW - 3 * DAY).toISOString() },
];

const bankOffers = [
  '10% instant discount on DemoBank credit cards, up to Rs. 1,000',
  '5% cashback on ShopVerse Pay UPI transactions',
  'No-cost EMI on orders above Rs. 3,000 (demo)',
  'Use code SAVE100 for Rs. 100 off on orders above Rs. 999',
];

// ---------- write ----------
fs.mkdirSync(OUT, { recursive: true });
const write = (name, data) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1) + '\n');
write('categories.json', categories);
write('products.json', products);
write('reviews.json', reviews);
write('brands.json', brands);
write('banners.json', banners);
write('coupons.json', coupons);
write('pincodes.json', { serviceable: pincodes, nonServiceable: nonServiceablePincodes, metroPrefixes: ['11', '40', '56', '60', '70'] });
write('demoUser.json', { user: demoUser, addresses: demoAddresses, wishlist: demoWishlist, orders: demoOrders });
write('search.json', { trending: trendingSearches });
write('faqs.json', faqs);
write('notifications.json', offerNotifications);
write('offers.json', { bankOffers });

console.log(`Generated: ${categories.length} categories, ${products.length} products, ${reviews.length} reviews, ${brands.length} brands, ${pincodes.length} pincodes.`);
