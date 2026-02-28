// /js/components/sectionSizing.js

/**
 * Enhanced Section Sizing
 * Dynamically adjusts section heights and positioning for optimal viewport fitting
 * Ensures each section fits within the viewport as much as possible
 * Improved to use CSS variables and handle content overflow better
 */
export function initSectionSizing() {
  // Select all sections
  const sections = document.querySelectorAll('section.section');
  const footer = document.querySelector('.site-footer');
  
  // Variables for state tracking
  let lastWindowWidth = window.innerWidth;
  let lastWindowHeight = window.innerHeight;
  let resizeTimer;
  
  // Get CSS spacing variables for consistency
  const getCSSVar = (name) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };
  
  // Get spacing values from CSS (with px fallbacks)
  const getSpacingValue = (spacingVar) => {
    const value = getCSSVar(spacingVar);
    return value ? value : (spacingVar.includes('16') ? '4rem' : '1.5rem');
  };
  
  // Function to calculate and apply section heights
  const adjustSectionSizes = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    
    // Get spacing values from CSS for consistency
    const largeSpacing = getSpacingValue('--space-16'); // 4rem/64px
    const mediumSpacing = getSpacingValue('--space-8');  // 2rem/32px
    const smallSpacing = getSpacingValue('--space-6');   // 1.5rem/24px
    
    // Determine appropriate padding based on screen size
    let paddingTop, paddingBottom, paddingSides;
    
    if (isMobile) {
      paddingTop = mediumSpacing;
      paddingBottom = mediumSpacing;
      paddingSides = smallSpacing;
    } else if (isTablet) {
      paddingTop = `calc(${mediumSpacing} * 1.25)`;
      paddingBottom = `calc(${mediumSpacing} * 1.25)`;
      paddingSides = mediumSpacing;
    } else {
      paddingTop = largeSpacing;
      paddingBottom = largeSpacing;
      paddingSides = mediumSpacing;
    }
    
    // Minimum height for sections (percentage of viewport)
    const minHeightPercent = isMobile ? 0.85 : 0.9; // 85-90% of viewport minimum
    const minHeight = windowHeight * minHeightPercent;
    
    sections.forEach(section => {
      // Get original content height (without forced min-height)
      const originalStyles = section.getAttribute('style') || '';
      section.style.minHeight = 'auto'; // Temporarily remove min-height
      
      // Clear padding temporarily to get true content height
      const originalPadding = section.style.padding;
      section.style.padding = '1px 0'; // 1px to avoid collapsing margins
      
      const contentHeight = section.scrollHeight;
      
      // Restore original padding and styles
      section.style.padding = originalPadding;
      section.setAttribute('style', originalStyles);
      
      // Calculate optimal section handling based on content and screen size
      let optimalHeight;
      let shouldCenter = false;
      
      // Different thresholds depending on device size
      const shortContentThreshold = isMobile ? 0.6 : 0.7; // Percentage of viewport
      const fitViewportThreshold = isMobile ? 1.2 : 1.1; // Percentage of viewport
      
      if (contentHeight < windowHeight * shortContentThreshold) {
        // Content is significantly smaller than viewport, center it
        optimalHeight = windowHeight;
        shouldCenter = true;
      } else if (contentHeight <= windowHeight * fitViewportThreshold) {
        // Content is close to viewport height, fit it with minimum height
        optimalHeight = Math.max(contentHeight, minHeight);
        shouldCenter = false;
      } else {
        // Content is larger than viewport, use natural height with minimum
        // Add some extra space to ensure it doesn't feel cramped
        optimalHeight = Math.max(contentHeight + (isMobile ? 40 : 60), minHeight);
        shouldCenter = false;
      }
      
      // For very tall content on mobile, cap the height to avoid excessively long sections
      if (isMobile && contentHeight > windowHeight * 2.5) {
        // Let it flow naturally by not setting a specific height
        section.style.minHeight = `${minHeight}px`;
      } else {
        // Apply calculated height
        section.style.minHeight = `${optimalHeight}px`;
      }
      
      // Apply consistent padding using CSS variables
      section.style.paddingTop = paddingTop;
      section.style.paddingBottom = paddingBottom;
      section.style.paddingLeft = paddingSides;
      section.style.paddingRight = paddingSides;
      
      // Apply vertical centering if needed
      if (shouldCenter) {
        section.classList.add('vertical-center');
      } else {
        section.classList.remove('vertical-center');
      }
      
      // Special handling for specific sections
      if (section.id === 'intro') {
        // Intro section should always be full height and centered
        section.style.minHeight = `${windowHeight}px`;
        section.classList.add('vertical-center');
      }
      
      // Adjust scroll snap behavior based on device and section content
      if (isMobile) {
        // More relaxed scroll snap on mobile
        section.style.scrollSnapAlign = 'start';
        section.style.scrollMarginTop = '0px';
      } else {
        // Stronger scroll snap on desktop
        section.style.scrollSnapAlign = contentHeight > windowHeight * 1.5 ? 'start' : 'center';
        section.style.scrollMarginTop = '0px';
      }
    });
    
    // Make footer snap too if needed
    if (footer) {
      footer.style.scrollSnapAlign = isMobile ? 'none' : 'end';
    }
    
    // Set overall scroll snap type
    document.querySelector('main').style.scrollSnapType = isMobile ? 
      'y proximity' : 'y mandatory';
  };
  
  // Function to reapply sizing on screen resize with improved debouncing
  const handleResize = () => {
    // Skip if the change is very small (prevents unnecessary recalculations)
    const widthChange = Math.abs(window.innerWidth - lastWindowWidth);
    const heightChange = Math.abs(window.innerHeight - lastWindowHeight);
    const significantChange = widthChange > 20 || heightChange > 20;
    
    // Always update tracking variables for next comparison
    lastWindowWidth = window.innerWidth;
    lastWindowHeight = window.innerHeight;
    
    // For significant changes, adjust immediately for better UX while resizing
    if (significantChange) {
      // Quick rough adjustment (might be less perfect but feels more responsive)
      adjustSectionSizes();
      
      // Then do a full precise adjustment after resize settles
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        adjustSectionSizes();
      }, 200);
    }
  };
  
  // Function to handle orientation changes more effectively
  const handleOrientationChange = () => {
    // Close any open project details first (as screen size drastically changed)
    const activeProjects = document.querySelectorAll('.project-detail.active');
    activeProjects.forEach(project => {
      project.classList.remove('active');
    });
    
    // Immediately adjust for better responsiveness
    adjustSectionSizes();
    
    // Then do more precise adjustment after browser finishes orientation change
    setTimeout(() => {
      adjustSectionSizes();
    }, 300);
  };
  
  // Handle sections becoming visible (for better animations and sizing)
  const handleVisibilityChange = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ensure content in visible section is properly positioned
        setTimeout(() => {
          adjustSectionSizes();
        }, 100);
      }
    });
  };
  
  // Initial sizing (run immediately)
  adjustSectionSizes();
  
  // Set up event listeners
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('load', adjustSectionSizes);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Set up intersection observer to track section visibility
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(handleVisibilityChange, {
      threshold: 0.2 // Fire when 20% of the section is visible (more responsive)
    });
    
    sections.forEach(section => {
      observer.observe(section);
    });
  }
  
  // Make sections adjust if navigation links are clicked
  document.querySelectorAll('.nav-dot, a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      // Small delay to allow scroll to complete
      setTimeout(adjustSectionSizes, 300);
    });
  });
  
  // Expose public method for other components to request section sizing updates
  window.updateSectionSizing = adjustSectionSizes;
}