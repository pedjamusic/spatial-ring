import { useMemo, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'uiConfig_';

/**
 * Merges default uiConfig with user preferences from localStorage
 * @param {string} modelName - The model name (e.g., 'Event')
 * @param {object} defaultConfig - Default uiConfig from server
 * @returns {object} Merged config and setter function
 */
export function useUiConfigWithPreferences(modelName, defaultConfig = {}) {
  const storageKey = `${STORAGE_KEY_PREFIX}${modelName}`;
  
  const mergedConfig = useMemo(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return defaultConfig;
      
      const userPrefs = JSON.parse(stored);
      
      // Deep merge: user preferences override defaults
      const merged = { ...defaultConfig };
      Object.entries(userPrefs).forEach(([fieldName, userFieldConfig]) => {
        merged[fieldName] = {
          ...merged[fieldName],
          ...userFieldConfig,
        };
      });
      
      return merged;
    } catch (err) {
      console.warn(`⚠️ Failed to load preferences for ${modelName}:`, err);
      return defaultConfig;
    }
  }, [modelName, defaultConfig, storageKey]);
  
  const updatePreferences = useCallback((fieldName, updates) => {
    try {
      const stored = localStorage.getItem(storageKey);
      const current = stored ? JSON.parse(stored) : {};
      
      current[fieldName] = {
        ...current[fieldName],
        ...updates,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(current));
      
      // Trigger re-render by dispatching custom event
      window.dispatchEvent(new CustomEvent('uiConfigChanged', {
        detail: { modelName, fieldName, updates }
      }));
    } catch (err) {
      console.error(`⚠️ Failed to save preferences for ${modelName}:`, err);
    }
  }, [modelName, storageKey]);
  
  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new CustomEvent('uiConfigChanged', {
        detail: { modelName, reset: true }
      }));
    } catch (err) {
      console.error(`⚠️ Failed to reset preferences for ${modelName}:`, err);
    }
  }, [modelName, storageKey]);
  
  return {
    config: mergedConfig,
    updatePreferences,
    resetPreferences,
  };
}
