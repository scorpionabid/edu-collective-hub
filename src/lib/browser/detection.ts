
/**
 * Browser detection utility for InfoLine application
 * Provides functions to detect browser type, version, and compatibility
 */

export type SupportedBrowser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'unsupported';

export interface BrowserInfo {
  name: SupportedBrowser;
  version: number;
  isSupported: boolean;
}

/**
 * Detects the current browser and its version
 * @returns {BrowserInfo} Object containing browser name, version and support status
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  
  // Default to unsupported
  const result: BrowserInfo = {
    name: 'unsupported',
    version: 0,
    isSupported: false
  };

  // Chrome detection
  const chromeMatch = /Chrome\/([0-9]+)/.exec(userAgent);
  if (chromeMatch && !/Edg\//.test(userAgent)) {
    result.name = 'chrome';
    result.version = parseInt(chromeMatch[1], 10);
  }
  
  // Firefox detection
  const firefoxMatch = /Firefox\/([0-9]+)/.exec(userAgent);
  if (firefoxMatch) {
    result.name = 'firefox';
    result.version = parseInt(firefoxMatch[1], 10);
  }
  
  // Safari detection (exclude Chrome-based browsers that include Safari in UA)
  const safariMatch = /Safari\/([0-9]+)/.exec(userAgent);
  if (safariMatch && !/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) {
    result.name = 'safari';
    const versionMatch = /Version\/([0-9]+)/.exec(userAgent);
    result.version = versionMatch ? parseInt(versionMatch[1], 10) : 0;
  }
  
  // Edge detection
  const edgeMatch = /Edg\/([0-9]+)/.exec(userAgent);
  if (edgeMatch) {
    result.name = 'edge';
    result.version = parseInt(edgeMatch[1], 10);
  }
  
  // Check if the browser version is supported (last 2 versions)
  // This is a simplified check - in a real app you'd compare against
  // current browser versions, but for this example we'll use thresholds
  const minVersions = {
    chrome: 90,
    firefox: 90,
    safari: 14,
    edge: 90
  };
  
  if (result.name !== 'unsupported') {
    result.isSupported = result.version >= minVersions[result.name];
  }
  
  return result;
}

/**
 * Checks if the current browser supports a specific CSS feature
 * @param {string} property - CSS property to check
 * @returns {boolean} Whether the property is supported
 */
export function supportsCSS(property: string): boolean {
  return CSS.supports(property, 'initial');
}

/**
 * Checks if the current browser supports specific JavaScript features
 * @param {string} feature - Feature to check (e.g. 'Promise', 'Map', etc.)
 * @returns {boolean} Whether the feature is supported
 */
export function supportsJSFeature(feature: string): boolean {
  switch (feature) {
    case 'Promise':
      return typeof Promise !== 'undefined';
    case 'Map':
      return typeof Map !== 'undefined';
    case 'Set':
      return typeof Set !== 'undefined';
    case 'Symbol':
      return typeof Symbol !== 'undefined';
    case 'IntersectionObserver':
      return typeof IntersectionObserver !== 'undefined';
    default:
      return false;
  }
}
