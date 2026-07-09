'use client';

import { useEffect, useState } from 'react';
import { listCompareArticles, listCompareCategories } from '../api/compareApi';
import type { CompareArticle, CompareCategory } from '../types/compare.types';

export function useCompareList() {
  const [articles, setArticles] = useState<CompareArticle[]>([]);
  const [categories, setCategories] = useState<CompareCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listCompareArticles(), listCompareCategories()])
      .then(([articlesData, categoriesData]) => {
        if (cancelled) return;
        setArticles(articlesData.articles);
        setCategories(categoriesData.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('Failed to fetch compare data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category === selectedCategory)
    : articles;

  return {
    articles,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredArticles,
    loading,
    error,
  };
}
