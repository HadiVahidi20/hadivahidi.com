// /js/utils/domUtils.js

/**
 * DOM Utility Functions
 * A collection of helper functions for DOM manipulation
 */

/**
 * Select DOM elements with error handling
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Parent element for search context
 * @returns {Element|null} The selected element or null if not found
 */
export function select(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Error selecting ${selector}:`, error);
    return null;
  }
}

/**
 * Select all matching DOM elements
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Parent element for search context
 * @returns {Element[]} Array of matching elements
 */
export function selectAll(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.error(`Error selecting all ${selector}:`, error);
    return [];
  }
}

/**
 * Add multiple event listeners to an element
 * @param {Element} element - DOM element to attach events to
 * @param {string[]} events - Array of event names
 * @param {Function} handler - Event handler function
 */
export function addMultipleEvents(element, events, handler) {
  if (!element) return;
  events.forEach(event => element.addEventListener(event, handler));
}

/**
 * Add event with optional delegation
 * @param {Element} element - Element to attach event to
 * @param {string} eventType - Type of event (e.g., 'click')
 * @param {string|Function} selectorOrHandler - CSS selector for delegation or handler function
 * @param {Function} [handler] - Handler function (if using delegation)
 */
export function addEvent(element, eventType, selectorOrHandler, handler) {
  if (!element) return;
  
  // If the third parameter is a function, we're not using delegation
  if (typeof selectorOrHandler === 'function') {
    element.addEventListener(eventType, selectorOrHandler);
    return;
  }
  
  // Otherwise, we're using delegation
  element.addEventListener(eventType, (e) => {
    const target = e.target.closest(selectorOrHandler);
    if (target && element.contains(target)) {
      handler.call(target, e);
    }
  });
}

/**
 * Toggle class on an element with optional condition
 * @param {Element} element - Element to modify
 * @param {string} className - Class to toggle
 * @param {boolean} [condition] - If provided, add class when true, remove when false
 */
export function toggleClass(element, className, condition) {
  if (!element) return;
  
  if (condition === undefined) {
    element.classList.toggle(className);
  } else {
    condition ? element.classList.add(className) : element.classList.remove(className);
  }
}

/**
 * Create an element with attributes and content
 * @param {string} tag - Element tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {string|Element|Element[]} [content=''] - Text content or child elements
 * @returns {Element} The created element
 */
export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add content
  if (content) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(item => {
        if (item instanceof Element) {
          element.appendChild(item);
        }
      });
    }
  }
  
  return element;
}

/**
 * Get the visible height of an element
 * @param {Element} element - The element to check
 * @returns {number} Visible height in pixels
 */
export function getVisibleHeight(element) {
  if (!element) return 0;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Element is completely above or below viewport
  if (rect.bottom <= 0 || rect.top >= windowHeight) {
    return 0;
  }
  
  // Element is fully in viewport
  if (rect.top >= 0 && rect.bottom <= windowHeight) {
    return rect.height;
  }
  
  // Element is partially in viewport
  if (rect.top < 0) {
    return rect.bottom;
  } else {
    return windowHeight - rect.top;
  }
}

/**
 * Check if an element is in viewport
 * @param {Element} element - Element to check
 * @param {number} [threshold=0] - Threshold between 0 and 1
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                     (rect.bottom >= windowHeight * threshold);
  const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                     (rect.right >= windowWidth * threshold);
                     
  return vertInView && horInView;
}

/**
 * Smoothly scroll to element
 * @param {Element|string} element - Element or selector to scroll to
 * @param {number} [offset=0] - Offset from the top in pixels
 * @param {number} [duration=500] - Animation duration in ms
 */
export function scrollToElement(element, offset = 0, duration = 500) {
  let target;
  
  if (typeof element === 'string') {
    target = document.querySelector(element);
  } else {
    target = element;
  }
  
  if (!target) return;
  
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  // Easing function
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
}

/**
 * Handle loading/lazy loading of images
 * @param {string} selector - CSS selector for images
 * @param {Function} [callback] - Callback after all images loaded
 */
export function loadImages(selector, callback) {
  const images = document.querySelectorAll(selector);
  let loadedCount = 0;
  
  if (images.length === 0 && callback) {
    callback();
    return;
  }
  
  function imageLoaded() {
    loadedCount++;
    if (loadedCount === images.length && callback) {
      callback();
    }
  }
  
  images.forEach(img => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded);
    }
    
    // Handle lazy loading
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  });
}