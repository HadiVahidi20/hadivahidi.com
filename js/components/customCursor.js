// /js/components/customCursor.js

/**
 * Custom Cursor Functionality with Magnetic Nav Effect
 */
export function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const navDots = document.querySelectorAll('.nav-dot');
    const navContainer = document.querySelector('.side-nav');
    
    // Only initialize on desktop
    if (window.innerWidth <= 768) return;
    
    // Update cursor position
    const updateCursor = (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      
      // Use requestAnimationFrame for smooth animation
      window.requestAnimationFrame(() => {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
      });
      
      // Magnetic nav effect
      if (navContainer) {
        const navRect = navContainer.getBoundingClientRect();
        const navCenterX = navRect.left + navRect.width / 2;
        const magneticThreshold = 100;
        const maxPull = 15;
        const isNearNav = Math.abs(posX - navCenterX) < magneticThreshold * 1.5;
        
        if (isNearNav) {
          // Apply magnetic effect to each dot
          navDots.forEach(dot => {
            const dotRect = dot.getBoundingClientRect();
            const dotCenterX = dotRect.left + dotRect.width / 2;
            const dotCenterY = dotRect.top + dotRect.height / 2;
            
            // Calculate distance between mouse and dot center
            const distX = posX - dotCenterX;
            const distY = posY - dotCenterY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // Apply magnetic effect only if mouse is within threshold
            if (distance < magneticThreshold) {
              // Calculate pull factor (stronger when closer)
              const pullFactor = (1 - distance / magneticThreshold) * maxPull;
              
              // Calculate new position with smooth transition
              const moveX = (distX / distance) * pullFactor;
              const moveY = (distY / distance) * pullFactor;
              
              // Apply transform with damping for smoother effect
              dot.style.transform = `translate(${moveX}px, ${moveY}px) ${dot.classList.contains('active') ? 'scale(1.2)' : ''}`;
              
              // Add hover effect to cursor
              cursorDot.classList.add('cursor-hover');
            } else {
              // Reset position if outside threshold
              dot.style.transform = dot.classList.contains('active') ? 'scale(1.2)' : '';
            }
          });
        } else {
          // Reset all dots if mouse is far from nav
          navDots.forEach(dot => {
            dot.style.transform = dot.classList.contains('active') ? 'scale(1.2)' : '';
          });
        }
      }
    };
    
    // Add cursor hover effect
    const addCursorHover = () => {
      cursorDot.classList.add('cursor-hover');
      cursorOutline.style.width = '60px';
      cursorOutline.style.height = '60px';
    };
    
    // Remove cursor hover effect
    const removeCursorHover = () => {
      cursorDot.classList.remove('cursor-hover');
      cursorOutline.style.width = '40px';
      cursorOutline.style.height = '40px';
    };
    
    // Add cursor hiding
    const addCursorHidden = () => {
      cursorDot.classList.add('cursor-hidden');
      cursorOutline.classList.add('cursor-hidden');
    };
    
    // Remove cursor hiding
    const removeCursorHidden = () => {
      cursorDot.classList.remove('cursor-hidden');
      cursorOutline.classList.remove('cursor-hidden');
    };
    
    // Add event listeners
    document.addEventListener('mousemove', updateCursor);
    
    document.addEventListener('mouseenter', removeCursorHidden);
    document.addEventListener('mouseleave', addCursorHidden);
    
    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-node, .theme-toggle, .skill-category, .slide-nav, .slide-dot');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', addCursorHover);
      el.addEventListener('mouseleave', removeCursorHover);
    });
  }