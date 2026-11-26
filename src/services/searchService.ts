import { mock } from '@/mock';
import { simulate } from './apiClient';
import { matchesText } from './productService';

export type SuggestionKind = 'product' | 'brand' | 'category';
export interface Suggestion {
  kind: SuggestionKind;
  label: string;
  id: string;
}

export const searchService = {
  async getTrending(): Promise<string[]> {
    return simulate(() => mock.trending, 200);
  },

  /** Live suggestions (SR-02): product names, brands and categories. */
  async suggest(q: string, limit = 8): Promise<Suggestion[]> {
    return simulate(() => {
      const needle = q.trim().toLowerCase();
      if (!needle) return [];
      const cats: Suggestion[] = mock.categories
        .filter(c => c.name.toLowerCase().includes(needle))
        .slice(0, 2)
        .map(c => ({ kind: 'category', label: c.name, id: c.id }));
      const brands: Suggestion[] = mock.brands
        .filter(b => b.toLowerCase().includes(needle))
        .slice(0, 2)
        .map(b => ({ kind: 'brand', label: b, id: b }));
      const products: Suggestion[] = mock.products
        .filter(p => matchesText(p, needle))
        .slice(0, limit)
        .map(p => ({ kind: 'product', label: p.name, id: p.id }));
      return [...cats, ...brands, ...products].slice(0, limit);
    }, 150);
  },
};
