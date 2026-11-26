import { RULES } from '@/config/rules';
import { mock } from '@/mock';
import type {
  Collection,
  Paginated,
  Product,
  ProductFilters,
  ProductQuery,
  SortOption,
  Variant,
} from '@/types/models';
import { discountPercent } from '@/utils/price';
import { simulate } from './apiClient';
import { db } from './db';

export const EMPTY_FILTERS: ProductFilters = {
  categoryIds: [],
  brands: [],
  priceMin: null,
  priceMax: null,
  minRating: null,
  minDiscount: null,
  hideOutOfStock: false,
  freeDelivery: false,
};

export const DEFAULT_QUERY: ProductQuery = {
  ...EMPTY_FILTERS,
  query: '',
  subCategoryId: null,
  collection: null,
  sort: 'relevance',
  page: 1,
  pageSize: RULES.listing.pageSize,
};

/** Applies live (server-side) stock levels on top of the static catalogue. */
function withStock(p: Product): Product {
  const overrides = db.get().stock;
  const variants: Variant[] = p.variants.map(v =>
    v.id in overrides ? { ...v, stock: overrides[v.id] } : v,
  );
  return { ...p, variants, stock: variants.reduce((s, v) => s + v.stock, 0) };
}

const allProducts = () => mock.products.map(withStock);

export function matchesText(p: Product, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const category = mock.categories.find(c => c.id === p.categoryId)?.name ?? '';
  const sub = mock.categories.find(c => c.id === p.subCategoryId)?.name ?? '';
  const hay = [p.name, p.brand, category, sub, ...p.tags]
    .join(' ')
    .toLowerCase();
  // Every word must match somewhere (case-insensitive, SR-03).
  return needle
    .split(/\s+/)
    .every(w => hay.includes(w) || hay.includes(w.replace(/s$/, '')));
}

function inCollection(
  p: Product,
  c: Collection | null,
  all: Product[],
): boolean {
  switch (c) {
    case null:
      return true;
    case 'bestsellers':
      return p.isBestSeller;
    case 'toprated':
      return p.rating >= 4.3;
    case 'deals':
      return p.isDealOfDay;
    case 'under999':
      return p.price <= 999;
    case 'new': {
      const sorted = [...all].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      return sorted.slice(0, 20).some(x => x.id === p.id);
    }
    case 'recommended':
      return p.rating >= 4 && discountPercent(p.mrp, p.price) >= 20;
  }
}

export function applyFilters(
  list: Product[],
  q: Omit<ProductQuery, 'page' | 'pageSize' | 'sort'>,
  all: Product[] = list,
): Product[] {
  return list.filter(p => {
    if (!matchesText(p, q.query)) return false;
    if (!inCollection(p, q.collection, all)) return false;
    if (q.subCategoryId && p.subCategoryId !== q.subCategoryId) return false;
    if (q.categoryIds.length && !q.categoryIds.includes(p.categoryId))
      return false;
    if (q.brands.length && !q.brands.includes(p.brand)) return false;
    if (q.priceMin != null && p.price < q.priceMin) return false;
    if (q.priceMax != null && p.price > q.priceMax) return false;
    if (q.minRating != null && p.rating < q.minRating) return false;
    if (
      q.minDiscount != null &&
      discountPercent(p.mrp, p.price) < q.minDiscount
    )
      return false;
    if (q.hideOutOfStock && p.stock <= 0) return false;
    if (q.freeDelivery && !p.freeDelivery) return false;
    return true;
  });
}

export function sortProducts(
  list: Product[],
  sort: SortOption,
  query = '',
): Product[] {
  const out = [...list];
  switch (sort) {
    case 'price_asc':
      return out.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return out.sort((a, b) => b.price - a.price);
    case 'rating':
      return out.sort(
        (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
      );
    case 'newest':
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'discount':
      return out.sort(
        (a, b) =>
          discountPercent(b.mrp, b.price) - discountPercent(a.mrp, a.price),
      );
    case 'relevance':
    default: {
      const q = query.trim().toLowerCase();
      const score = (p: Product) =>
        (q && p.name.toLowerCase().includes(q) ? 100 : 0) +
        (p.isBestSeller ? 20 : 0) +
        (p.stock > 0 ? 10 : -50) +
        p.rating * 4 +
        Math.log10(p.ratingCount + 1) * 3;
      return out.sort((a, b) => score(b) - score(a));
    }
  }
}

export interface Facets {
  brands: string[];
  categories: { id: string; name: string }[];
  priceMin: number;
  priceMax: number;
}

export const productService = {
  async getProducts(query: Partial<ProductQuery>): Promise<Paginated<Product>> {
    const q = { ...DEFAULT_QUERY, ...query };
    return simulate(() => {
      const all = allProducts();
      const filtered = sortProducts(applyFilters(all, q, all), q.sort, q.query);
      const start = (q.page - 1) * q.pageSize;
      const items = filtered.slice(start, start + q.pageSize);
      return {
        items,
        total: filtered.length,
        page: q.page,
        hasMore: start + q.pageSize < filtered.length,
      };
    });
  },

  /** Live result count for the filter sheet (PL-04). */
  async countProducts(query: Partial<ProductQuery>): Promise<number> {
    const q = { ...DEFAULT_QUERY, ...query };
    return simulate(() => {
      const all = allProducts();
      return applyFilters(all, q, all).length;
    }, 120);
  },

  /** Available filter values for the current search / category context. */
  async getFacets(query: Partial<ProductQuery>): Promise<Facets> {
    const q = { ...DEFAULT_QUERY, ...query, ...EMPTY_FILTERS };
    return simulate(() => {
      const all = allProducts();
      const base = applyFilters(all, q, all);
      const prices = base.map(p => p.price);
      const catIds = [...new Set(base.map(p => p.categoryId))];
      return {
        brands: [...new Set(base.map(p => p.brand))].sort(),
        categories: catIds.map(id => ({
          id,
          name: mock.categories.find(c => c.id === id)?.name ?? id,
        })),
        priceMin: prices.length ? Math.min(...prices) : 0,
        priceMax: prices.length ? Math.max(...prices) : 0,
      };
    }, 150);
  },

  async getProduct(id: string): Promise<Product | null> {
    return simulate(() => {
      const p = mock.products.find(x => x.id === id);
      return p ? withStock(p) : null;
    });
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return simulate(() =>
      ids
        .map(id => mock.products.find(p => p.id === id))
        .filter(Boolean)
        .map(p => withStock(p as Product)),
    );
  },

  async getCollection(collection: Collection, limit = 10): Promise<Product[]> {
    return simulate(() => {
      const all = allProducts();
      const list = applyFilters(all, { ...DEFAULT_QUERY, collection }, all);
      const sort: SortOption =
        collection === 'new'
          ? 'newest'
          : collection === 'toprated'
          ? 'rating'
          : 'relevance';
      return sortProducts(list, sort).slice(0, limit);
    });
  },

  async getDealsOfDay(): Promise<Product[]> {
    return simulate(() => allProducts().filter(p => p.isDealOfDay));
  },

  /** Personalised-ish: same categories as recently viewed, else top rated with good discounts. */
  async getRecommended(recentIds: string[], limit = 10): Promise<Product[]> {
    return simulate(() => {
      const all = allProducts();
      const cats = new Set(
        all.filter(p => recentIds.includes(p.id)).map(p => p.categoryId),
      );
      const pool = all.filter(
        p =>
          !recentIds.includes(p.id) &&
          p.stock > 0 &&
          (cats.size ? cats.has(p.categoryId) : true),
      );
      return sortProducts(pool, 'rating').slice(0, limit);
    });
  },

  async getSimilar(productId: string, limit = 10): Promise<Product[]> {
    return simulate(() => {
      const p = mock.products.find(x => x.id === productId);
      if (!p) return [];
      return allProducts()
        .filter(x => x.id !== p.id && x.subCategoryId === p.subCategoryId)
        .concat(
          allProducts().filter(
            x =>
              x.id !== p.id &&
              x.categoryId === p.categoryId &&
              x.subCategoryId !== p.subCategoryId,
          ),
        )
        .slice(0, limit);
    });
  },

  async getFrequentlyBoughtTogether(productId: string): Promise<Product[]> {
    return simulate(() => {
      const p = mock.products.find(x => x.id === productId);
      if (!p) return [];
      const all = allProducts();
      // Deterministic "co-purchase" picks: cheaper accessories from the same / related category.
      return all
        .filter(
          x =>
            x.id !== p.id &&
            x.categoryId === p.categoryId &&
            x.price < p.price &&
            x.stock > 0,
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    });
  },

  /** Synchronous stock lookup used by the cart validation endpoint. */
  stockOf(productId: string, variantId: string): number {
    const p = mock.products.find(x => x.id === productId);
    const v = p
      ? withStock(p).variants.find(x => x.id === variantId)
      : undefined;
    return v ? v.stock : 0;
  },
};
