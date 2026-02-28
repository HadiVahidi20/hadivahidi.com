// /js/components/progressBar.js

/**
 * Progress Bar
 * Shows scroll progress through the page
 */
export function initProgressBar() {
    const progressBar = document.querySelector('.progress-indicator');
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      
      progressBar.style.width = `${scrollPercent}%`;
    });
  }