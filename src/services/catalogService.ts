import { mock } from '@/mock';
import type { Banner, Category, Faq } from '@/types/models';
import { simulate } from './apiClient';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return simulate(() =>
      mock.categories
        .filter(c => !c.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },
  async getSubCategories(parentId: string): Promise<Category[]> {
    return simulate(() =>
      mock.categories
        .filter(c => c.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },
  async getAll(): Promise<Category[]> {
    return simulate(() => mock.categories, 100);
  },
};

export const bannerService = {
  async getHomeBanners(): Promise<Banner[]> {
    return simulate(() => mock.banners.filter(b => b.placement === 'home'));
  },
  async getCategoryBanners(): Promise<Banner[]> {
    return simulate(() => mock.banners.filter(b => b.placement === 'category'));
  },
};

export const contentService = {
  async getFaqs(): Promise<Faq[]> {
    return simulate(() => mock.faqs);
  },
  async getBankOffers(): Promise<string[]> {
    return simulate(() => mock.bankOffers, 50);
  },
};
