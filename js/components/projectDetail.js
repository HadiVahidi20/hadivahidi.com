// /js/components/projectDetail.js

/**
 * Project Detail Panel Functionality
 * Handles creation and interaction with project detail panels
 */

/**
 * Create HTML for project detail panel based on project data
 * @param {Object} project - Project data object
 * @returns {HTMLElement} - The detail panel DOM element
 */
export function createProjectDetail(project) {
  const detail = document.createElement('div');
  detail.className = 'project-detail';
  detail.id = `project-${project.id}-detail`;
  
  // Create slideshow HTML
  const slidesHTML = project.images.map(image => 
    `<div class="slide">
      <img src="${image}" alt="${project.title}">
    </div>`
  ).join('');
  
  const slidesDotsHTML = project.images.map((_, index) => 
    `<div class="slide-dot${index === 0 ? ' active' : ''}"></div>`
  ).join('');
  
  // Create tags HTML
  const tagsHTML = project.technologies.map(tech => 
    `<span>${tech}</span>`
  ).join('');
  
  // Create highlights HTML
  const highlightsHTML = project.highlights.map(highlight => 
    `<li>${highlight}</li>`
  ).join('');
  
  // Create links HTML
  const linksHTML = project.links.map(link => {
    let icon, text;
    if (link.type === 'live') {
      icon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      text = 'View Live';
    } else {
      icon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      text = 'View Code';
    }
    
    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn ${link.type === 'live' ? '' : 'btn-outline'}">${icon} ${text}</a>`;
  }).join('');
  
  // Assemble final HTML
  detail.innerHTML = `
    <div class="project-slideshow">
      <div class="slideshow-container">
        ${slidesHTML}
        <div class="slide-instruction">Scroll or swipe to navigate</div>
        <div class="slideshow-nav">
          ${slidesDotsHTML}
        </div>
        <div class="slide-nav slide-prev">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="slide-nav slide-next">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="project-content">
      <button class="close-detail">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h3>${project.title}</h3>
      <div class="project-tags">
        ${tagsHTML}
      </div>
      <div class="project-description">
        <p>${project.description}</p>
        <ul class="project-highlights">
          ${highlightsHTML}
        </ul>
      </div>
      <div class="project-actions">
        ${linksHTML}
      </div>
    </div>
  `;
  
  return detail;
}

/**
 * Initialize slideshow functionality for project detail panels
 * @param {HTMLElement} detailPanel - The project detail panel element
 */
export function initSlideshow(detailPanel) {
  const slideshow = detailPanel.querySelector('.slideshow-container');
  if (!slideshow) return;
  
  const slides = slideshow.querySelectorAll('.slide');
  const dots = slideshow.querySelectorAll('.slide-dot');
  const prevBtn = slideshow.querySelector('.slide-prev');
  const nextBtn = slideshow.querySelector('.slide-next');
  const parentContainer = slideshow.closest('.project-slideshow');
  
  // If no slides, skip this slideshow
  if (slides.length === 0) return;
  
  // Set first slide as active
  slides[0].classList.add('active');
  
  let currentSlide = 0;
  let isAnimating = false;
  
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
    if (dots.length > currentSlide) {
      dots[currentSlide].classList.add('active');
    }
    
    // Reset animation flag after transition completes
    setTimeout(() => {
      isAnimating = false;
    }, 800); // Match the transition duration
  }
  
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next, 'next');
  }
  
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev, 'prev');
  }
  
  // Add event listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const direction = index > currentSlide ? 'next' : 'prev';
      showSlide(index, direction);
    });
  });
  
  // Add event listeners to prev/next buttons
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
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
      }
    }, { passive: false });
  }
  
  // Auto advance slideshow (slower to give more time to see the transition)
  let slideshowInterval = setInterval(nextSlide, 5000);
  
  // Pause on hover
  slideshow.addEventListener('mouseenter', () => {
    clearInterval(slideshowInterval);
  });
  
  slideshow.addEventListener('mouseleave', () => {
    slideshowInterval = setInterval(nextSlide, 5000);
  });
}

/**
 * Initialize project detail panel interactions
 * @param {HTMLElement} container - The container element for all project panels
 */
export function initProjectDetailInteractions(container) {
  // Get all project nodes and detail panels
  const projectNodes = container.querySelectorAll('.project-node');
  const projectDetails = container.querySelectorAll('.project-detail');
  
  // Add click event listeners to project nodes
  projectNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const projectId = node.getAttribute('data-project');
      const projectDetail = document.getElementById(`project-${projectId}-detail`);
      
      if (projectDetail) {
        projectDetail.classList.add('active');
        // Initialize or refresh slideshow for this detail panel
        initSlideshow(projectDetail);
      }
    });
    
    // Make sure cursor shows this is clickable
    node.style.cursor = 'pointer';
  });
  
  // Add click event listeners to close buttons
  projectDetails.forEach(detail => {
    const closeButton = detail.querySelector('.close-detail');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        detail.classList.remove('active');
      });
      
      // Make sure cursor shows this is clickable
      closeButton.style.cursor = 'pointer';
    }
  });
}