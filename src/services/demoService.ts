import { mock } from '@/mock';
import type { Address, User } from '@/types/models';

/** Demo-account fixtures (section 8.1: 2 addresses, 4 past orders, 6 wishlist items). */
export const demoService = {
  isDemoUser: (u: User | null) => !!u && u.id === mock.demo.user.id,
  addresses: (): Address[] => mock.demo.addresses.map(a => ({ ...a })),
  wishlist: () => mock.demo.wishlist.map(w => ({ ...w })),
  productSnapshot(productId: string) {
    const p = mock.products.find(x => x.id === productId);
    return p
      ? { name: p.name, image: p.images[0], price: p.price, brand: p.brand }
      : null;
  },
};
