// /js/centeredDetailPanelFix.js
// Enhanced detail panel fix that ensures panels are always centered in viewport

(function() {
  console.log('[DetailPanelFix] Starting centered panel fix...');
  
  // Run after DOM is loaded with a delay
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initFix, 1000);
  });
  
  function initFix() {
    console.log('[DetailPanelFix] Initializing centered panel fix...');
    
    // Create overlay element if it doesn't exist
    createOverlay();
    
    // Fix all detail panels
    fixDetailPanels();
    
    // Setup outside click handler
    setupOutsideClickHandler();
    
    // Watch for dynamically added panels
    setupMutationObserver();
    
    // Run additional check after a longer delay
    setTimeout(fixDetailPanels, 3000);
  }
  
  // Create overlay for better visual effect
  function createOverlay() {
    if (!document.querySelector('.detail-panel-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'detail-panel-overlay';
      document.body.appendChild(overlay);
      console.log('[DetailPanelFix] Created overlay element');
    }
  }
  
  function fixDetailPanels() {
    const detailPanels = document.querySelectorAll('.project-detail');
    const overlay = document.querySelector('.detail-panel-overlay');
    
    console.log(`[DetailPanelFix] Found ${detailPanels.length} detail panels to center`);
    
    detailPanels.forEach((panel, index) => {
      // Skip if already fixed
      if (panel._centeredFixApplied) return;
      
      // Move panels to body for proper fixed positioning
      if (panel.parentElement && !panel.parentElement.isSameNode(document.body)) {
        // Clone the panel to avoid any event binding issues
        const panelClone = panel.cloneNode(true);
        document.body.appendChild(panelClone);
        
        // Remove the original panel
        panel.parentElement.removeChild(panel);
        
        // Continue with the cloned panel
        panel = panelClone;
        console.log(`[DetailPanelFix] Moved panel ${index} to body for centered positioning`);
      }
      
      // Ensure proper initial state
      if (!panel.classList.contains('active')) {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        panel.style.zIndex = '-1';
      }
      
      // Fix close button
      const closeBtn = panel.querySelector('.close-detail');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          closePanel(panel);
        });
        
        // Ensure proper styling
        closeBtn.style.pointerEvents = 'auto';
        closeBtn.style.cursor = 'pointer';
      }
      
      // Setup panel activation handler via corresponding thumbnail
      const projectId = panel.id.replace('project-', '').replace('-detail', '');
      const thumbnail = document.querySelector(`.project-node[data-project="${projectId}"]`);
      
      if (thumbnail) {
        // Remove existing click listeners to avoid duplicates
        const thumbClone = thumbnail.cloneNode(true);
        thumbnail.parentNode.replaceChild(thumbClone, thumbnail);
        
        // Add new click handler to open panel
        thumbClone.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          openPanel(panel);
        });
        
        console.log(`[DetailPanelFix] Added click handler to thumbnail for project ${projectId}`);
      }
      
      // Add listener for when panel becomes active/inactive
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class') {
            if (panel.classList.contains('active')) {
              // When panel becomes active
              panel.style.opacity = '1';
              panel.style.pointerEvents = 'auto';
              panel.style.zIndex = '9999';
              
              // Activate overlay
              if (overlay) overlay.classList.add('active');
              
              // Disable scrolling
              document.body.classList.add('detail-panel-open');
              
              // Ensure slideshow works
              initSlideshow(panel);
            } else {
              // When panel becomes inactive
              panel.style.opacity = '0';
              panel.style.pointerEvents = 'none';
              panel.style.zIndex = '-1';
              
              // Deactivate overlay
              if (overlay) overlay.classList.remove('active');
              
              // Re-enable scrolling
              document.body.classList.remove('detail-panel-open');
            }
          }
        });
      });
      
      observer.observe(panel, { attributes: true });
      
      // Mark as fixed
      panel._centeredFixApplied = true;
      console.log(`[DetailPanelFix] Detail panel ${index} now centered`);
    });
  }
  
  // Function to open a panel
  function openPanel(panel) {
    // Add active class to panel
    panel.classList.add('active');
    
    // Activate overlay
    const overlay = document.querySelector('.detail-panel-overlay');
    if (overlay) overlay.classList.add('active');
    
    // Disable scrolling
    document.body.classList.add('detail-panel-open');
    
    console.log(`[DetailPanelFix] Opened panel: ${panel.id}`);
  }
  
  // Function to close a panel
  function closePanel(panel) {
    // Remove active class from panel
    panel.classList.remove('active');
    
    // Deactivate overlay
    const overlay = document.querySelector('.detail-panel-overlay');
    if (overlay) overlay.classList.remove('active');
    
    // Re-enable scrolling
    document.body.classList.remove('detail-panel-open');
    
    console.log(`[DetailPanelFix] Closed panel: ${panel.id}`);
  }
  
  // Setup outside click handler (overlay click)
  function setupOutsideClickHandler() {
    const overlay = document.querySelector('.detail-panel-overlay');
    
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        // Find active panel
        const activePanel = document.querySelector('.project-detail.active');
        
        if (activePanel) {
          closePanel(activePanel);
        }
      });
      
      console.log('[DetailPanelFix] Added click handler to overlay for closing panels');
    }
  }
  
  // Initialize slideshow for a detail panel
  function initSlideshow(detailPanel) {
    const slideshow = detailPanel.querySelector('.slideshow-container');
    if (!slideshow || slideshow._initialized) return;
    
    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.slide-dot');
    
    if (slides.length === 0) return;
    
    console.log(`[DetailPanelFix] Initializing slideshow with ${slides.length} slides`);
    
    // Make first slide active if none is active
    let activeFound = false;
    slides.forEach(slide => {
      if (slide.classList.contains('active')) {
        activeFound = true;
      }
    });
    
    if (!activeFound) {
      slides[0].classList.add('active');
      if (dots.length > 0) {
        dots[0].classList.add('active');
      }
    }
    
    // Add navigation handlers
    let currentIndex = 0;
    
    // Previous button
    const prevBtn = slideshow.querySelector('.slide-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
      });
    }
    
    // Next button
    const nextBtn = slideshow.querySelector('.slide-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
      });
    }
    
    // Dot navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        currentIndex = i;
        updateSlides();
      });
    });
    
    // Update slides function
    function updateSlides() {
      // Update slides
      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      
      // Update dots
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
    
    // Mark as initialized
    slideshow._initialized = true;
  }
  
  // Set up mutation observer to watch for new detail panels
  function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
      let shouldCheck = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.classList && node.classList.contains('project-detail')) {
              shouldCheck = true;
            } else if (node.querySelectorAll && node.querySelectorAll('.project-detail').length > 0) {
              shouldCheck = true;
            }
          });
        }
      });
      
      if (shouldCheck) {
        fixDetailPanels();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();