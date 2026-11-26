import { mock } from '@/mock';
import type { Paginated, Review } from '@/types/models';
import { uid } from '@/utils/id';
import { simulate } from './apiClient';
import { db } from './db';

export type ReviewSort = 'helpful' | 'recent' | 'positive' | 'critical';

const allFor = (productId: string): Review[] => {
  const helpful = db.get().helpful;
  return [
    ...db.get().reviews.filter(r => r.productId === productId),
    ...mock.reviews.filter(r => r.productId === productId),
  ].map(r =>
    helpful[r.id] ? { ...r, helpfulCount: r.helpfulCount + helpful[r.id] } : r,
  );
};

const sorters: Record<ReviewSort, (a: Review, b: Review) => number> = {
  helpful: (a, b) => b.helpfulCount - a.helpfulCount,
  recent: (a, b) => b.date.localeCompare(a.date),
  positive: (a, b) => b.rating - a.rating || b.helpfulCount - a.helpfulCount,
  critical: (a, b) => a.rating - b.rating || b.helpfulCount - a.helpfulCount,
};

export const reviewService = {
  async getReviews(
    productId: string,
    opts: {
      page?: number;
      pageSize?: number;
      sort?: ReviewSort;
      rating?: number | null;
    } = {},
  ): Promise<Paginated<Review>> {
    const { page = 1, pageSize = 10, sort = 'helpful', rating = null } = opts;
    return simulate(() => {
      let list = allFor(productId).sort(sorters[sort]);
      if (rating) list = list.filter(r => r.rating === rating);
      const start = (page - 1) * pageSize;
      return {
        items: list.slice(start, start + pageSize),
        total: list.length,
        page,
        hasMore: start + pageSize < list.length,
      };
    });
  },

  async getTopReviews(productId: string, n = 3): Promise<Review[]> {
    return simulate(() => allFor(productId).sort(sorters.helpful).slice(0, n));
  },

  async addReview(
    input: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'isLocal'>,
  ): Promise<Review> {
    return simulate(() => {
      const review: Review = {
        ...input,
        id: uid('rl_'),
        date: new Date().toISOString(),
        helpfulCount: 0,
        isLocal: true,
      };
      db.update(s => {
        s.reviews.unshift(review);
      });
      return review;
    });
  },

  async markHelpful(reviewId: string): Promise<void> {
    return simulate(() => {
      db.update(s => {
        s.helpful[reviewId] = (s.helpful[reviewId] ?? 0) + 1;
      });
    }, 150);
  },
};
