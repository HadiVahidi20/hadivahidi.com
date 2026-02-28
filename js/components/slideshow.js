// /js/components/slideshow.js

/**
 * Slideshow Component
 * Handles project detail slideshows with navigation
 */
export function initSlideshows() {
  const slideshows = document.querySelectorAll('.slideshow-container');
  
  slideshows.forEach(slideshow => {
    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.slide-dot');
    const prevBtn = slideshow.querySelector('.slide-prev');
    const nextBtn = slideshow.querySelector('.slide-next');
    const parentContainer = slideshow.closest('.project-slideshow');
    
    let currentSlide = 0;
    let isAnimating = false;
    let slideshowInterval = null;
    
    /**
     * Show a specific slide with direction-aware animation
     * @param {number} n - Index of slide to show
     * @param {string} direction - Direction of transition ('next' or 'prev')
     */
    function showSlide(n, direction = 'next') {
      if (isAnimating) return;
      isAnimating = true;
      
      // Reset any prev/next slide status
      slides.forEach(slide => {
        slide.classList.remove('prev');
      });
      
      // Get current slide and make it temporarily prev
      const currentElement = slides[currentSlide];
      
      // Set direction based transition
      if (direction === 'prev') {
        currentElement.classList.add('prev');
      }
      
      // Remove active class from current slide
      currentElement.classList.remove('active');
      
      // Remove active class from all dots
      dots.forEach(dot => {
        dot.classList.remove('active');
      });
      
      // Update current slide index
      currentSlide = n;
      
      // Show the selected slide
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        isAnimating = false;
      }, 800); // Match the transition duration
    }
    
    /**
     * Go to next slide
     */
    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next, 'next');
    }
    
    /**
     * Go to previous slide
     */
    function prevSlide() {
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev, 'prev');
    }
    
    /**
     * Start auto-advancing slideshow
     */
    function startAutoSlide() {
      // Clear any existing interval first
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
      slideshowInterval = setInterval(nextSlide, 5000);
    }
    
    /**
     * Pause auto-advancing slideshow
     */
    function pauseAutoSlide() {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
    }
    
    // Add event listeners to dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        // Skip if already on this slide
        if (index === currentSlide) return;
        
        // Determine direction for animation
        const direction = index > currentSlide ? 'next' : 'prev';
        showSlide(index, direction);
        
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      });
    });
    
    // Add event listeners to prev/next buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      });
    }
    
    // Add wheel event listener for scrolling through images
    if (parentContainer) {
      parentContainer.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent page scroll
        
        // Determine scroll direction
        if (e.deltaY > 0) {
          nextSlide(); // Scroll down = next slide
        } else {
          prevSlide(); // Scroll up = previous slide
        }
        
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      }, { passive: false });
      
      // Touch support for mobile
      let touchStartY = 0;
      
      parentContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      parentContainer.addEventListener('touchmove', (e) => {
        if (!touchStartY) return;
        
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY;
        
        // If significant vertical swipe detected
        if (Math.abs(diff) > 30) {
          e.preventDefault();
          if (diff > 0) {
            nextSlide(); // Swipe up = next slide
          } else {
            prevSlide(); // Swipe down = previous slide
          }
          touchStartY = 0; // Reset to prevent multiple triggers
          
          // Reset the auto-slide timer on user interaction
          if (slideshowInterval) {
            pauseAutoSlide();
            startAutoSlide();
          }
        }
      }, { passive: false });
    }
    
    // Keyboard navigation
    function handleKeyDown(e) {
      // Only handle keys if this slideshow is visible
      const slideshowRect = slideshow.getBoundingClientRect();
      const isVisible = slideshowRect.top < window.innerHeight && 
                       slideshowRect.bottom > 0 && 
                       getComputedStyle(slideshow).opacity !== '0';
      
      if (!isVisible) return;
      
      if (e.key === 'ArrowLeft') {
        prevSlide();
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        // Reset the auto-slide timer on user interaction
        if (slideshowInterval) {
          pauseAutoSlide();
          startAutoSlide();
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Pause on hover
    slideshow.addEventListener('mouseenter', pauseAutoSlide);
    slideshow.addEventListener('mouseleave', startAutoSlide);
    
    // Start auto advance slideshow
    startAutoSlide();
    
    // Provide a public API for external control
    slideshow.slideController = {
      next: nextSlide,
      prev: prevSlide,
      goTo: showSlide,
      pause: pauseAutoSlide,
      play: startAutoSlide,
      getCurrentIndex: () => currentSlide
    };
  });
}