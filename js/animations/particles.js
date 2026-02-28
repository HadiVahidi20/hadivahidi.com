// /js/animations/particles.js

import { SimplexNoise } from '../utils/simplexNoise.js';

/**
 * Particles Animation
 * Creates an interactive particle background for sections
 * @param {string} canvasId - The ID of the canvas element to use
 */
export function initParticles(canvasId = 'particles') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Make canvas responsive
  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Particle class
  class Particle {
    constructor(x, y, size, speed, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = speed;
      this.color = color;
      this.direction = Math.random() * Math.PI * 2; // Random direction
      this.moveDistance = Math.random() * 2 + 1; // Random movement distance
    }
    
    update() {
      // Move particles using sin and cos for more natural movement
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
      
      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) {
        this.direction = Math.PI - this.direction;
      }
      
      if (this.y < 0 || this.y > canvas.height) {
        this.direction = -this.direction;
      }
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Create particles
  const particles = [];
  const particleCount = Math.min(100, Math.floor(window.innerWidth / 15)); // Responsive amount
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  
  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 3 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const speed = Math.random() * 0.5 + 0.2;
    const opacity = Math.random() * 0.7 + 0.3; // Increased opacity range for better visibility
    const color = `${accentColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    
    particles.push(new Particle(x, y, size, speed, color));
  }
  
  // Connect nearby particles with lines
  const connectParticles = () => {
    const maxDistance = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance; // Fades with distance
          ctx.strokeStyle = `${accentColor}${Math.floor(opacity * 150).toString(16).padStart(2, '0')}`; // Increased opacity
          ctx.lineWidth = 0.8; // Slightly thicker lines
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };
  
  // Track mouse position for particle interaction
  let mouseX = null;
  let mouseY = null;
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
  });
  
  // Animate particles
  const animate = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      // Add mouse interaction
      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repel particles when mouse is near
        if (distance < 80) {
          const angle = Math.atan2(dy, dx);
          const force = (80 - distance) / 80;
          particle.x -= Math.cos(angle) * force * 2;
          particle.y -= Math.sin(angle) * force * 2;
        }
      }
      
      particle.update();
      particle.draw();
    });
    
    // Connect particles
    connectParticles();
    
    // Request next frame
    requestAnimationFrame(animate);
  };
  
  // Start animation
  animate();
}