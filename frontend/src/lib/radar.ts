"use client"

import { useState, useEffect, useCallback } from 'react'
import { RadarItem, RadarCategory, WeeklyRadar } from '@/app/radar/radar-types'

export function useRadarItems(category?: string) {
  const [items, setItems] = useState<RadarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = category ? `/api/radar/items?category=${encodeURIComponent(category)}` : '/api/radar/items'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch radar items: ${response.statusText}`)
      }
      
      const data = await response.json()
      setItems(data)
    } catch (err) {
      console.error('Error fetching radar items:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch radar items')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, loading, error, refetch: fetchItems }
}

export function useRadarCategories() {
  const [categories, setCategories] = useState<RadarCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/radar/categories')
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`)
        }
        
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching radar categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

export function useRadarItem(id: string) {
  const [item, setItem] = useState<RadarItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/radar/items/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setItem(null)
            return
          }
          throw new Error(`Failed to fetch radar item: ${response.statusText}`)
        }
        
        const data = await response.json()
        setItem(data)
      } catch (err) {
        console.error('Error fetching radar item:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch radar item')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchItem()
    }
  }, [id])

  return { item, loading, error }
}

export function useWeeklyRadar(weekNumber: string) {
  const [weeklyData, setWeeklyData] = useState<WeeklyRadar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeeklyRadar() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/radar/weekly/${encodeURIComponent(weekNumber)}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch weekly radar: ${response.statusText}`)
        }
        
        const data = await response.json()
        setWeeklyData(data)
      } catch (err) {
        console.error('Error fetching weekly radar:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch weekly radar')
      } finally {
        setLoading(false)
      }
    }

    if (weekNumber) {
      fetchWeeklyRadar()
    }
  }, [weekNumber])

  return { weeklyData, loading, error }
}

// Utility functions
export function filterItemsByMaturity(items: RadarItem[], maturity: string): RadarItem[] {
  return items.filter(item => item.maturity === maturity)
}

export function filterItemsByCategory(items: RadarItem[], category: string): RadarItem[] {
  return items.filter(item => item.category === category)
}

export function sortItemsByDate(items: RadarItem[], order: 'asc' | 'desc' = 'desc'): RadarItem[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export function getCategoryStats(items: RadarItem[]): Record<string, number> {
  return items.reduce((stats, item) => {
    stats[item.category] = (stats[item.category] || 0) + 1
    return stats
  }, {} as Record<string, number>)
}

export function getMaturityStats(items: RadarItem[]): Record<string, number> {
  return items.reduce((stats, item) => {
    stats[item.maturity] = (stats[item.maturity] || 0) + 1
    return stats
  }, {} as Record<string, number>)
}

export function formatLastVerified(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return '今天'
  } else if (diffInDays === 1) {
    return '1天前'
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}周前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}