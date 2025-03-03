
/**
 * Feature detection and polyfill loading utilities
 */

// Function to load a script dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

// Load polyfills based on feature detection
export const loadPolyfillsIfNeeded = async (): Promise<void> => {
  const polyfillsNeeded: string[] = [];
  
  // Check for Promise support
  if (typeof Promise === 'undefined') {
    polyfillsNeeded.push('https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js');
  }
  
  // Check for fetch support
  if (typeof fetch === 'undefined') {
    polyfillsNeeded.push('https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js');
  }
  
  // Check for IntersectionObserver
  if (typeof IntersectionObserver === 'undefined') {
    polyfillsNeeded.push('https://cdn.jsdelivr.net/npm/intersection-observer@0.12.2/intersection-observer.js');
  }
  
  // Check for Array.from, Object.assign, etc.
  if (!Array.from || !Object.assign) {
    polyfillsNeeded.push('https://cdn.jsdelivr.net/npm/core-js-bundle@3.24.1/minified.js');
  }
  
  // Load all necessary polyfills
  const loadPromises = polyfillsNeeded.map(loadScript);
  try {
    await Promise.all(loadPromises);
    console.log('Polyfills loaded successfully:', polyfillsNeeded);
  } catch (error) {
    console.error('Failed to load polyfills:', error);
  }
};

// CSS feature detection
export const detectCSSFeatures = (): Record<string, boolean> => {
  return {
    flexbox: CSS.supports('display', 'flex'),
    grid: CSS.supports('display', 'grid'),
    variables: CSS.supports('--custom-property', 'value'),
    position: CSS.supports('position', 'sticky')
  };
};

// JavaScript features detection
export const detectJSFeatures = (): Record<string, boolean> => {
  return {
    promises: typeof Promise !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    mutationObserver: typeof MutationObserver !== 'undefined',
    localStorage: (() => {
      try {
        return typeof localStorage !== 'undefined';
      } catch (e) {
        return false;
      }
    })()
  };
};
