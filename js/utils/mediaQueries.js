// /js/utils/mediaQueries.js

/**
 * Media Queries Utility
 * Handles responsive design functionality in JavaScript
 */

// Breakpoint constants that match CSS media queries
export const BREAKPOINTS = {
  mobile: 480,    // max-width for mobile
  tablet: 768,    // max-width for tablet
  desktop: 1024,  // max-width for desktop (larger is considered large desktop)
  maxWidth: 1440  // max content width
};

/**
 * Check if viewport matches a specific media query
 * @param {string} query - Media query to check
 * @returns {boolean} True if query matches
 */
export function matchesQuery(query) {
  return window.matchMedia(query).matches;
}

/**
 * Check if viewport is mobile size
 * @returns {boolean} True if viewport is mobile size
 */
export function isMobile() {
  return window.innerWidth <= BREAKPOINTS.mobile;
}

/**
 * Check if viewport is tablet size
 * @returns {boolean} True if viewport is tablet size
 */
export function isTablet() {
  return window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
}

/**
 * Check if viewport is desktop size
 * @returns {boolean} True if viewport is desktop size
 */
export function isDesktop() {
  return window.innerWidth > BREAKPOINTS.tablet && window.innerWidth <= BREAKPOINTS.desktop;
}

/**
 * Check if viewport is large desktop size
 * @returns {boolean} True if viewport is large desktop size
 */
export function isLargeDesktop() {
  return window.innerWidth > BREAKPOINTS.desktop;
}

/**
 * Register a viewport change listener
 * @param {Function} callback - Function to call when viewport changes
 * @param {number} [debounceTime=200] - Debounce time in ms
 * @returns {Function} Cleanup function to remove the listener
 */
export function onViewportChange(callback, debounceTime = 200) {
  let timeoutId;
  
  const debouncedCallback = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, debounceTime);
  };
  
  window.addEventListener('resize', debouncedCallback);
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', debouncedCallback);
  };
}

/**
 * Create a media query that executes code at specific breakpoints
 * @param {Object} queries - Object with breakpoint names as keys and callbacks as values
 * @returns {Function} Cleanup function to remove all listeners
 */
export function createResponsiveHandler(queries) {
  const mediaQueries = {
    mobile: window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`),
    tablet: window.matchMedia(`(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`),
    desktop: window.matchMedia(`(min-width: ${BREAKPOINTS.tablet + 1}px) and (max-width: ${BREAKPOINTS.desktop}px)`),
    largeDesktop: window.matchMedia(`(min-width: ${BREAKPOINTS.desktop + 1}px)`)
  };
  
  // Function to check and execute callbacks
  const checkQueries = () => {
    Object.entries(mediaQueries).forEach(([name, query]) => {
      if (query.matches && queries[name]) {
        queries[name]();
      }
    });
  };
  
  // Add listeners
  Object.values(mediaQueries).forEach(query => {
    query.addListener(checkQueries);
  });
  
  // Initial check
  checkQueries();
  
  // Return cleanup function
  return () => {
    Object.values(mediaQueries).forEach(query => {
      query.removeListener(checkQueries);
    });
  };
}

/**
 * Handle orientation changes
 * @param {Object} handlers - Object with portrait and landscape callbacks
 * @returns {Function} Cleanup function to remove the listener
 */
export function onOrientationChange(handlers) {
  const portraitQuery = window.matchMedia('(orientation: portrait)');
  const landscapeQuery = window.matchMedia('(orientation: landscape)');
  
  const checkOrientation = () => {
    if (portraitQuery.matches && handlers.portrait) {
      handlers.portrait();
    } else if (landscapeQuery.matches && handlers.landscape) {
      handlers.landscape();
    }
  };
  
  // Add listeners
  portraitQuery.addListener(checkOrientation);
  landscapeQuery.addListener(checkOrientation);
  
  // Initial check
  checkOrientation();
  
  // Return cleanup function
  return () => {
    portraitQuery.removeListener(checkOrientation);
    landscapeQuery.removeListener(checkOrientation);
  };
}

/**
 * Get current viewport information
 * @returns {Object} Viewport information object
 */
export function getViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    devicePixelRatio: window.devicePixelRatio || 1,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isLargeDesktop: isLargeDesktop()
  };
}