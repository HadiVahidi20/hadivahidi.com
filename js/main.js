// /js/main.js
// Main JavaScript Entry Point - Updated with Dynamic Experience Timeline
// Imports and initializes all modules including the new database-driven experience

// Import component modules
import { initThemeToggle } from './components/themeToggle.js';
import { initCustomCursor } from './components/customCursor.js';
import { initScrollSpy } from './components/scrollSpy.js';
import { initProgressBar } from './components/progressBar.js';
import { initTypingEffect } from './components/typingEffect.js';
import { initSwipeNavigation } from './components/swipeNavigation.js';
import { initSectionSizing } from './components/sectionSizing.js';
import { initProjectDetailInteractions } from './components/projectDetail.js';
import { initExperienceTimeline } from './components/experienceTimeline.js'; // NEW: Dynamic experience

// Import animation modules
import { initParticles } from './animations/particles.js';
import { initEnhancedSkillGraph } from './animations/skillGraph.js';
import { initProjectUniverseVisualization } from './animations/projectUniverse.js';

// Import other utilities
import { initSkillCategories } from './components/skillCategories.js';

/**
 * Initialize on Document Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing portfolio components...');
  
  // Initialize core components
  initThemeToggle();
  initCustomCursor();
  initScrollSpy();
  initProgressBar();
  initTypingEffect();
  initSwipeNavigation();
  initSectionSizing();
  
  // Initialize particles for intro section
  initParticles('particles');
  
  // Initialize particles for work section
  initParticles('work-particles');
  
  // Initialize skill visualization (database-driven)
  initEnhancedSkillGraph();
  initSkillCategories();
  
  // Initialize project visualization (database-driven)
  initProjectUniverseVisualization();
  
  // NEW: Initialize dynamic experience timeline (database-driven)
  initExperienceTimeline();
  
  // For any project detail panels already in the DOM
  const projectContainer = document.querySelector('.project-universe');
  if (projectContainer) {
    initProjectDetailInteractions(projectContainer);
  }
  
  // Add delay before showing elements to allow for initial load
  setTimeout(() => {
    // Make sure section titles are visible
    document.querySelectorAll('.section-title').forEach(title => {
      title.classList.add('visible');
    });
    
    // Add visible class to elements in the first section
    const firstSection = document.querySelector('section');
    if (firstSection) {
      const elements = firstSection.querySelectorAll('.timeline-item, .contact-method, .social-link, .timeline-container, .contact-container');
      elements.forEach(el => {
        el.classList.add('visible');
      });
    }
  }, 800); // Slightly longer delay to allow for API loading
  
  console.log('Portfolio initialization complete');
});

/**
 * Handle page visibility changes for performance optimization
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause animations if needed
    console.log('Page hidden - pausing animations');
  } else {
    // Page is visible, resume animations
    console.log('Page visible - resuming animations');
  }
});

/**
 * Handle window resize for responsive updates
 */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Trigger any necessary updates on resize
    console.log('Window resized - updating layouts');
    
    // Reinitialize section sizing if needed
    if (typeof initSectionSizing === 'function') {
      initSectionSizing();
    }
  }, 250);
});

/**
 * Global error handling
 */
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Could send error reports in production
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default handling (which would log to console anyway)
  event.preventDefault();
});