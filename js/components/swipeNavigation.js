// /js/components/swipeNavigation.js

/**
 * Enhanced Swipe Navigation
 * Enables horizontal swipe navigation between sections on touch devices
 * with improved gesture detection and conflict resolution
 */
export function initSwipeNavigation() {
  // Only initialize on touch devices to avoid unnecessary event listeners
  if (!('ontouchstart' in window)) return;
  
  const sections = document.querySelectorAll('section');
  const navDots = document.querySelectorAll('.nav-dot');
  
  // If there are no sections or dots, exit early
  if (!sections.length || !navDots.length) return;
  
  // Add swipe indicator element to the body if it doesn't exist already
  let swipeIndicator = document.querySelector('.swipe-indicator');
  if (!swipeIndicator) {
    swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator';
    swipeIndicator.textContent = 'Swipe to navigate';
    document.body.appendChild(swipeIndicator);
  }
  
  // Show swipe indicator on page load
  setTimeout(() => {
    showSwipeIndicator();
  }, 1500);
  
  // Touch tracking variables
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoveX = 0;
  let touchMoveY = 0;
  let currentSection = null;
  let isScrolling = false;
  let isSwiping = false;
  let isInteractingWithSwipeable = false;
  let swipeThreshold = 80; // Minimum distance to trigger swipe
  let swipeTimeout;
  let lockNavigation = false;
  
  // Function to show the swipe indicator with animation
  function showSwipeIndicator() {
    swipeIndicator.classList.remove('visible');
    // Force reflow to restart animation
    void swipeIndicator.offsetWidth;
    swipeIndicator.classList.add('visible');
  }
  
  // Get the current active section index with improved reliability
  const getCurrentSectionIndex = () => {
    // First try to get by active nav dot
    const activeNavDot = document.querySelector('.nav-dot.active');
    if (activeNavDot) {
      const sectionId = activeNavDot.getAttribute('data-section');
      const index = Array.from(sections).findIndex(section => section.id === sectionId);
      if (index !== -1) return index;
    }
    
    // Fallback: determine the most visible section in the viewport
    let mostVisibleSection = 0;
    let maxVisibility = 0;
    
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      
      if (visibleBottom > visibleTop) {
        const visibleHeight = visibleBottom - visibleTop;
        const percentVisible = visibleHeight / viewportHeight;
        
        if (percentVisible > maxVisibility) {
          maxVisibility = percentVisible;
          mostVisibleSection = index;
        }
      }
    });
    
    return mostVisibleSection;
  };
  
  // Scroll to a specific section with improved transition
  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length || lockNavigation) return;
    
    // Lock navigation to prevent multiple swipes during transition
    lockNavigation = true;
    
    const targetSection = sections[index];
    const targetId = targetSection.getAttribute('id');
    const offset = 160; // Match the existing scroll offset
    
    // Calculate position with offset to ensure the section is properly visible
    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
    
    // Smooth scroll to the calculated position
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Update active nav dot
    navDots.forEach(dot => {
      dot.classList.remove('active');
      if (dot.getAttribute('data-section') === targetId) {
        dot.classList.add('active');
      }
    });
    
    // Show swipe indicator
    showSwipeIndicator();
    
    // Release navigation lock after animation completes
    setTimeout(() => {
      lockNavigation = false;
    }, 800); // Match scroll animation duration
  };
  
  // Check if touch is on or inside a swipeable element (like project slideshow)
  const checkSwipeableElement = (element) => {
    if (!element) return false;
    
    // Check if element or any parent has a class that indicates it's swipeable
    let current = element;
    while (current && current !== document.body) {
      if (
        current.classList.contains('slideshow-container') ||
        current.classList.contains('project-slideshow') ||
        current.classList.contains('slide')
      ) {
        return true;
      }
      current = current.parentElement;
    }
    
    return false;
  };
  
  // Touch start event - track starting position
  document.addEventListener('touchstart', (e) => {
    // Clear any existing timeouts
    clearTimeout(swipeTimeout);
    
    // Reset tracking variables
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoveX = touchStartX;
    touchMoveY = touchStartY;
    currentSection = getCurrentSectionIndex();
    isScrolling = false;
    isSwiping = false;
    
    // Check if we're touching a swipeable element
    isInteractingWithSwipeable = checkSwipeableElement(e.target);
  }, { passive: true });
  
  // Touch move event - determine if scrolling vertically or swiping horizontally
  document.addEventListener('touchmove', (e) => {
    if (currentSection === null || isInteractingWithSwipeable) return;
    
    touchMoveX = e.touches[0].clientX;
    touchMoveY = e.touches[0].clientY;
    
    // Calculate distances
    const distX = touchMoveX - touchStartX;
    const distY = touchMoveY - touchStartY;
    
    // If we haven't determined the gesture yet
    if (!isScrolling && !isSwiping) {
      // Determine if primarily scrolling or swiping
      if (Math.abs(distY) > Math.abs(distX)) {
        isScrolling = true;
      } else if (Math.abs(distX) > 15) { // Small threshold to start detecting swipe
        isSwiping = true;
        
        // If clear horizontal swipe, provide visual feedback
        if (Math.abs(distX) > 30 && Math.abs(distX) > Math.abs(distY) * 2) {
          // Show the indicator immediately for faster feedback
          if (Math.abs(distX) > 40) {
            showSwipeIndicator();
            
            // Add directional class for visual feedback
            swipeIndicator.classList.remove('swiping-left', 'swiping-right');
            swipeIndicator.classList.add(distX < 0 ? 'swiping-left' : 'swiping-right');
          }
        }
      }
    }
  }, { passive: true }); // Keep passive for better scroll performance
  
  // Touch end event - process the completed swipe
  document.addEventListener('touchend', (e) => {
    if (currentSection === null || isInteractingWithSwipeable) return;
    
    // Remove directional classes
    swipeIndicator.classList.remove('swiping-left', 'swiping-right');
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate final distances
    const distX = touchEndX - touchStartX;
    const distY = touchEndY - touchStartY;
    
    // Only trigger navigation if:
    // 1. Clear horizontal swipe (more horizontal than vertical movement)
    // 2. Exceeds minimum threshold
    // 3. Not actively scrolling
    // 4. Not locked by another navigation in progress
    if (
      !isScrolling && 
      Math.abs(distX) > Math.abs(distY) && 
      Math.abs(distX) > swipeThreshold &&
      !lockNavigation
    ) {
      // Left swipe (next section)
      if (distX < 0) {
        scrollToSection(currentSection + 1);
      } 
      // Right swipe (previous section)
      else {
        scrollToSection(currentSection - 1);
      }
    }
    
    // Reset tracking variables
    currentSection = null;
    isScrolling = false;
    isSwiping = false;
  }, { passive: true });
  
  // Touch cancel event - reset tracking variables
  document.addEventListener('touchcancel', () => {
    currentSection = null;
    isScrolling = false;
    isSwiping = false;
    swipeIndicator.classList.remove('swiping-left', 'swiping-right');
  }, { passive: true });
  
  // Handle window resize - update swipe threshold based on screen width
  window.addEventListener('resize', () => {
    // Adjust swipe threshold based on screen width (smaller for smaller screens)
    swipeThreshold = window.innerWidth < 480 ? 60 : 80;
  }, { passive: true });
  
  // Adjust initial swipe threshold based on current screen size
  swipeThreshold = window.innerWidth < 480 ? 60 : 80;
  
  // Show swipe indicator when changing sections via navigation
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      // Short delay to show after the navigation occurs
      setTimeout(showSwipeIndicator, 300);
    });
  });
}