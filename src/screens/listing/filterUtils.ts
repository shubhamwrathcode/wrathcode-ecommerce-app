import { t, tf } from '@/i18n';
import type { ProductFilters } from '@/types/models';
import { formatPrice } from '@/utils/format';

export interface FilterChip {
  key: string;
  label: string;
  remove: (f: ProductFilters) => ProductFilters;
}

/** Applied filters as removable chips (PL-05). */
export function filterChips(
  f: ProductFilters,
  categoryName: (id: string) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];
  f.categoryIds.forEach(id =>
    chips.push({
      key: `c-${id}`,
      label: categoryName(id),
      remove: x => ({ ...x, categoryIds: x.categoryIds.filter(c => c !== id) }),
    }),
  );
  f.brands.forEach(b =>
    chips.push({
      key: `b-${b}`,
      label: b,
      remove: x => ({ ...x, brands: x.brands.filter(y => y !== b) }),
    }),
  );
  if (f.priceMin != null || f.priceMax != null) {
    chips.push({
      key: 'price',
      label: `${formatPrice(f.priceMin ?? 0)} – ${
        f.priceMax != null ? formatPrice(f.priceMax) : '∞'
      }`,
      remove: x => ({ ...x, priceMin: null, priceMax: null }),
    });
  }
  if (f.minRating != null)
    chips.push({
      key: 'rating',
      label: tf(t.plp.ratingAbove, { n: f.minRating }),
      remove: x => ({ ...x, minRating: null }),
    });
  if (f.minDiscount != null)
    chips.push({
      key: 'discount',
      label: tf(t.plp.discountAbove, { n: f.minDiscount }),
      remove: x => ({ ...x, minDiscount: null }),
    });
  if (f.hideOutOfStock)
    chips.push({
      key: 'oos',
      label: t.plp.hideOos,
      remove: x => ({ ...x, hideOutOfStock: false }),
    });
  if (f.freeDelivery)
    chips.push({
      key: 'free',
      label: t.plp.freeDelivery,
      remove: x => ({ ...x, freeDelivery: false }),
    });
  return chips;
}

export const activeFilterCount = (f: ProductFilters) =>
  filterChips(f, id => id).length;
