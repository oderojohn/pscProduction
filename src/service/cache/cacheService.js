/**
 * Cache Service for API responses
 * Prevents unnecessary backend queries when data hasn't changed
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default
    this.LONG_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for stats
  }

  /**
   * Generate cache key from URL and params
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cached data is still valid
   */
  isValid(cacheEntry) {
    if (!cacheEntry) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < cacheEntry.duration;
  }

  /**
   * Get data from cache
   */
  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const cacheEntry = this.cache.get(key);

    if (this.isValid(cacheEntry)) {
      console.log(`🔄 Cache hit for: ${key}`);
      return cacheEntry.data;
    }

    // Try localStorage as fallback
    const localData = this.getFromLocalStorage(key);
    if (localData && this.isValid(localData)) {
      console.log(`💾 LocalStorage hit for: ${key}`);
      this.cache.set(key, localData); // Restore to memory cache
      return localData.data;
    }

    console.log(`❌ Cache miss for: ${key}`);
    return null;
  }

  /**
   * Store data in cache
   */
  set(endpoint, params = {}, data, customDuration = null) {
    const key = this.generateKey(endpoint, params);
    const duration = customDuration || this.CACHE_DURATION;

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      duration,
      key
    };

    this.cache.set(key, cacheEntry);
    this.saveToLocalStorage(key, cacheEntry);

    console.log(`💾 Cached data for: ${key}`);
  }

  /**
   * Clear specific cache entry
   */
  clear(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
    localStorage.removeItem(`cache_${key}`);
    console.log(`🗑️ Cleared cache for: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
    // Clear all cache entries from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Cleared all cache');
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern) {
    // Clear from memory cache
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }

    // Clear from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_') && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });

    console.log(`🗑️ Cleared cache pattern: ${pattern}`);
  }

  /**
   * Get data from localStorage
   */
  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(`cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save data to localStorage
   */
  saveToLocalStorage(key, cacheEntry) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // If localStorage is full, clear old entries
      this.clearOldEntries();
    }
  }

  /**
   * Clear old entries when localStorage is full
   */
  clearOldEntries() {
    try {
      const cacheKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .map(key => ({
          key,
          entry: JSON.parse(localStorage.getItem(key))
        }))
        .sort((a, b) => a.entry.timestamp - b.entry.timestamp);

      // Remove oldest 20% of entries
      const toRemove = Math.ceil(cacheKeys.length * 0.2);
      cacheKeys.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
      });

      console.log(`🗑️ Cleared ${toRemove} old cache entries`);
    } catch (error) {
      console.error('Error clearing old entries:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryEntries = this.cache.size;
    const localStorageEntries = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_')).length;

    return {
      memoryEntries,
      localStorageEntries,
      totalEntries: memoryEntries + localStorageEntries
    };
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache invalidation helpers
export const CacheInvalidation = {
  // Clear all item-related caches
  clearItemsCache: () => {
    cacheService.clearPattern('items');
    cacheService.clearPattern('lost');
    cacheService.clearPattern('found');
  },

  // Clear stats cache
  clearStatsCache: () => {
    cacheService.clearPattern('stats');
  },

  // Clear matches cache
  clearMatchesCache: () => {
    cacheService.clearPattern('matches');
    cacheService.clearPattern('generate_matches');
  },

  // Clear pickups cache
  clearPickupsCache: () => {
    cacheService.clearPattern('pickup');
    cacheService.clearPattern('pickuplogs');
  }
};