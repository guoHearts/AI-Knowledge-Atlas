'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  listRadarCategories,
  listRadarItems,
} from '../api/radarApi';
import type { RadarCategory, RadarItem } from '../types/radar.types';

export function useRadarList() {
  const locale = useLocale();
  const [items, setItems] = useState<RadarItem[]>([]);
  const [categories, setCategories] = useState<RadarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The proxy route reads the locale cookie itself; re-running this effect
  // when `locale` changes is what actually triggers the refetch.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listRadarItems(),
      listRadarCategories(),
    ])
      .then(([itemsData, categoriesData]) => {
        if (cancelled) return;
        setItems(itemsData.items);
        setCategories(categoriesData.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('Failed to fetch radar data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return {
    items,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    loading,
    error,
  };
}
