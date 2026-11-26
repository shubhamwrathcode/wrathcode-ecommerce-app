import type { CartItem } from '@/types/models';
import { simulate } from './apiClient';
import { productService } from './productService';

export interface CartLineStatus {
  key: string;
  stock: number;
}

export const cartKey = (productId: string, variantId: string) =>
  `${productId}:${variantId}`;

export const cartService = {
  /** Server-side cart validation: returns current stock per line (CT-08). */
  async validate(items: CartItem[]): Promise<Record<string, number>> {
    return simulate(() => {
      const out: Record<string, number> = {};
      items.forEach(i => {
        out[cartKey(i.productId, i.variantId)] = productService.stockOf(
          i.productId,
          i.variantId,
        );
      });
      return out;
    }, 250);
  },
};
