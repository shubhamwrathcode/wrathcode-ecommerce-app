import { mock } from '@/mock';
import { applyFilters, DEFAULT_QUERY, matchesText, sortProducts } from '@/services/productService';
import { discountPercent } from '@/utils/price';

const all = mock.products;

describe('mock data volume (8.1)', () => {
  it('has 8 main categories with 3-4 sub-categories each', () => {
    const main = mock.categories.filter(c => !c.parentId);
    expect(main).toHaveLength(8);
    main.forEach(m => {
      const n = mock.categories.filter(c => c.parentId === m.id).length;
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(4);
    });
  });
  it('has 80-100 products, 25-30 brands, 6 coupons, ~50 pincodes, 5-15 reviews per product', () => {
    expect(all.length).toBeGreaterThanOrEqual(80);
    expect(all.length).toBeLessThanOrEqual(100);
    expect(mock.brands.length).toBeGreaterThanOrEqual(25);
    expect(mock.coupons).toHaveLength(6);
    expect(mock.pincodes.serviceable.length).toBeGreaterThanOrEqual(45);
    all.forEach(p => {
      const n = mock.reviews.filter(r => r.productId === p.id).length;
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(15);
    });
  });
});

describe('search (SR-03)', () => {
  it('is case-insensitive across name, brand, category and tags', () => {
    const shoes = all.filter(p => matchesText(p, 'SHOES'));
    expect(shoes.length).toBeGreaterThan(3);
    const brand = all[0].brand;
    expect(all.filter(p => matchesText(p, brand.toLowerCase())).every(p => p.brand === brand || p.tags.join(' ').includes(brand.toLowerCase()) || p.name.includes(brand))).toBe(true);
    expect(all.filter(p => matchesText(p, 'beauty')).every(p => p.categoryId === 'beauty' || p.tags.includes('beauty'))).toBe(true);
  });
});

describe('filters & sort (PL-03, PL-04)', () => {
  it('filters by price, rating, discount, stock', () => {
    const res = applyFilters(all, { ...DEFAULT_QUERY, priceMax: 999, minRating: 4, minDiscount: 25, hideOutOfStock: true });
    res.forEach(p => {
      expect(p.price).toBeLessThanOrEqual(999);
      expect(p.rating).toBeGreaterThanOrEqual(4);
      expect(discountPercent(p.mrp, p.price)).toBeGreaterThanOrEqual(25);
      expect(p.stock).toBeGreaterThan(0);
    });
  });
  it('sorts by price ascending / descending', () => {
    const asc = sortProducts(all, 'price_asc');
    const desc = sortProducts(all, 'price_desc');
    expect(asc[0].price).toBeLessThanOrEqual(asc[asc.length - 1].price);
    expect(desc[0].price).toBeGreaterThanOrEqual(desc[desc.length - 1].price);
  });
});
