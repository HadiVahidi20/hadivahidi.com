// /js/improvedSlideshowScroll.js
// Improved slideshow scroll with better integration between scroll and button navigation

(function() {
  console.log('[SlideshowScroll] Starting improved slideshow scroll navigation...');
  
  // Run after DOM is loaded with a delay
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initSlideshowScroll, 1000);
  });
  
  function initSlideshowScroll() {
    console.log('[SlideshowScroll] Initializing improved wheel scroll for slideshow...');
    
    // Store state for all slideshows
    const slideshowStates = new Map();
    
    // Initialize existing panels first
    initExistingPanels();
    
    // Use event delegation on body to catch all current and future panels
    document.body.addEventListener('wheel', function(e) {
      handleSlideshowScroll(e, slideshowStates);
    }, { passive: false });
    
    // Watch for new panels
    setupMutationObserver(slideshowStates);
    
    // Also add support for touchpad swipe gestures on the slideshow
    setupTouchGestures(slideshowStates);
  }
  
  function initExistingPanels() {
    const panels = document.querySelectorAll('.project-detail');
    panels.forEach(panel => {
      initPanelNavigation(panel);
    });
  }
  
  function initPanelNavigation(panel) {
    if (panel._navigationInitialized) return;
    
    const slideshow = panel.querySelector('.project-slideshow');
    if (!slideshow) return;
    
    const slideshowContainer = slideshow.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    const dots = slideshowContainer.querySelectorAll('.slide-dot');
    const prevBtn = slideshowContainer.querySelector('.slide-prev');
    const nextBtn = slideshowContainer.querySelector('.slide-next');
    
    if (slides.length === 0) return;
    
    // Create a unique ID for this slideshow
    const slideshowId = 'slideshow-' + Math.random().toString(36).substr(2, 9);
    slideshow.setAttribute('data-slideshow-id', slideshowId);
    
    // Initialize state for this slideshow
    const state = {
      currentIndex: 0,
      slides: slides,
      dots: dots,
      isAnimating: false,
      slideshowId: slideshowId
    };
    
    // Find the initially active slide
    slides.forEach((slide, index) => {
      if (slide.classList.contains('active')) {
        state.currentIndex = index;
      }
    });
    
    // Store state globally
    window.slideshowStates = window.slideshowStates || new Map();
    window.slideshowStates.set(slideshowId, state);
    
    // Override the existing next/prev button handlers with our unified approach
    if (nextBtn) {
      // Remove existing listeners
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
      
      newNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        changeSlide(slideshowId, 'next');
      });
    }
    
    if (prevBtn) {
      // Remove existing listeners
      const newPrevBtn = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
      
      newPrevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        changeSlide(slideshowId, 'prev');
      });
    }
    
    // Override dot navigation
    dots.forEach((dot, index) => {
      // Remove existing listeners
      const newDot = dot.cloneNode(true);
      dot.parentNode.replaceChild(newDot, dot);
      
      newDot.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        changeToSlide(slideshowId, index);
      });
    });
    
    panel._navigationInitialized = true;
    console.log(`[SlideshowScroll] Initialized navigation for panel with ID ${slideshowId}`);
  }
  
  // Universal function to change slides used by all navigation methods
  function changeSlide(slideshowId, direction) {
    const state = window.slideshowStates.get(slideshowId);
    if (!state || state.isAnimating) return;
    
    // Set animating state
    state.isAnimating = true;
    
    // Save current index for animation
    const currentIndex = state.currentIndex;
    
    // Calculate new index
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % state.slides.length;
    } else {
      newIndex = (currentIndex - 1 + state.slides.length) % state.slides.length;
    }
    
    // Update state
    state.currentIndex = newIndex;
    
    // Update slides
    state.slides.forEach((slide, index) => {
      // Remove all special classes first
      slide.classList.remove('active', 'prev');
      
      if (index === newIndex) {
        // New active slide
        slide.classList.add('active');
      } else if (index === currentIndex && direction === 'next') {
        // Outgoing slide, only add prev class for next direction
        slide.classList.add('prev');
      }
    });
    
    // Update dots
    state.dots.forEach((dot, index) => {
      if (index === newIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Reset animation flag after transition
    setTimeout(() => {
      state.isAnimating = false;
    }, 800); // Match your transition time
    
    console.log(`[SlideshowScroll] Changed slide: ${currentIndex} → ${newIndex} (${direction})`);
  }
  
  // Direct change to a specific slide
  function changeToSlide(slideshowId, targetIndex) {
    const state = window.slideshowStates.get(slideshowId);
    if (!state || state.isAnimating) return;
    
    // Determine direction for animation
    const direction = targetIndex > state.currentIndex ? 'next' : 'prev';
    
    // Set animating state
    state.isAnimating = true;
    
    // Save current index for animation
    const currentIndex = state.currentIndex;
    
    // Update state
    state.currentIndex = targetIndex;
    
    // Update slides
    state.slides.forEach((slide, index) => {
      // Remove all special classes first
      slide.classList.remove('active', 'prev');
      
      if (index === targetIndex) {
        // New active slide
        slide.classList.add('active');
      } else if (index === currentIndex && direction === 'next') {
        // Outgoing slide
        slide.classList.add('prev');
      }
    });
    
    // Update dots
    state.dots.forEach((dot, index) => {
      if (index === targetIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Reset animation flag after transition
    setTimeout(() => {
      state.isAnimating = false;
    }, 800); // Match your transition time
    
    console.log(`[SlideshowScroll] Changed to slide: ${targetIndex} (from ${currentIndex})`);
  }
  
  function handleSlideshowScroll(e, slideshowStates) {
    // Find the active panel
    const activePanel = document.querySelector('.project-detail.active');
    if (!activePanel) return;
    
    // Check if the cursor is over the slideshow area
    const slideshow = activePanel.querySelector('.project-slideshow');
    if (!slideshow) return;
    
    // Get slideshow ID
    const slideshowId = slideshow.getAttribute('data-slideshow-id');
    if (!slideshowId) {
      // Initialize if not already done
      initPanelNavigation(activePanel);
      return;
    }
    
    // Check if mouse is over the slideshow
    const slideshowRect = slideshow.getBoundingClientRect();
    if (
      e.clientX >= slideshowRect.left && 
      e.clientX <= slideshowRect.right && 
      e.clientY >= slideshowRect.top && 
      e.clientY <= slideshowRect.bottom
    ) {
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Determine scroll direction (with a small threshold to avoid accidental triggers)
      const threshold = 5;
      if (Math.abs(e.deltaY) < threshold) return;
      
      const scrollDown = e.deltaY > 0;
      const direction = scrollDown ? 'next' : 'prev';
      
      // Change slide using the unified function
      changeSlide(slideshowId, direction);
    }
  }
  
  function setupTouchGestures(slideshowStates) {
    // Track touch start position
    let touchStartY = 0;
    let touchStartX = 0;
    
    document.body.addEventListener('touchstart', function(e) {
      // Store touch start position
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    document.body.addEventListener('touchmove', function(e) {
      // Find the active panel
      const activePanel = document.querySelector('.project-detail.active');
      if (!activePanel) return;
      
      // Check if touch is over the slideshow area
      const slideshow = activePanel.querySelector('.project-slideshow');
      if (!slideshow) return;
      
      // Get slideshow ID
      const slideshowId = slideshow.getAttribute('data-slideshow-id');
      if (!slideshowId) {
        // Initialize if not already done
        initPanelNavigation(activePanel);
        return;
      }
      
      // Get touch position
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      
      // Check if touch started over the slideshow
      const slideshowRect = slideshow.getBoundingClientRect();
      if (
        touchX >= slideshowRect.left && 
        touchX <= slideshowRect.right && 
        touchY >= slideshowRect.top && 
        touchY <= slideshowRect.bottom
      ) {
        // Calculate vertical and horizontal movement
        const deltaY = touchStartY - touchY;
        const deltaX = touchStartX - touchX;
        
        // Only handle vertical swipes that are more vertical than horizontal
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
          e.preventDefault();
          
          // Determine swipe direction
          const swipeDown = deltaY > 0;
          const direction = swipeDown ? 'next' : 'prev';
          
          // Change slide using the unified function
          changeSlide(slideshowId, direction);
          
          // Reset touch start to prevent repeated triggers
          touchStartY = 0;
        }
      }
    }, { passive: false });
  }
  
  function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.classList && node.classList.contains('project-detail')) {
              // Initialize navigation for new panel
              initPanelNavigation(node);
            } else if (node.querySelectorAll) {
              const panels = node.querySelectorAll('.project-detail');
              panels.forEach(panel => initPanelNavigation(panel));
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();