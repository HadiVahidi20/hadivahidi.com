// /js/components/typingEffect.js

/**
 * Typing Effect
 * Creates a typewriter effect for text rotation
 */
export function initTypingEffect() {
    const typingElement = document.querySelector('.typing');
    if (!typingElement) return;
    
    const phrases = [
      'elegant web experiences.',
      'responsive interfaces.',
      'accessible applications.',
      'optimized solutions.',
      'pixel-perfect designs.'
    ];
    
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let pauseDuration = 1500;
    
    const typePhrase = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        // Deleting text
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50;
      } else {
        // Typing text
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 100;
      }
      
      // Handle end of typing or deleting
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        // Finished typing
        isDeleting = true;
        typingSpeed = pauseDuration;
      } else if (isDeleting && currentCharIndex === 0) {
        // Finished deleting
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      }
      
      setTimeout(typePhrase, typingSpeed);
    };
    
    // Start the typing effect
    setTimeout(typePhrase, 1000);
  }