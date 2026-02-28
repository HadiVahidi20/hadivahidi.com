// /js/animations/skillGraph.js

import { SimplexNoise } from '../utils/simplexNoise.js';

/**
 * Enhanced Network Constellation for Skills - Database Integration
 * Creates an interactive visualization of skills with connections and particle effects
 * Fetches skills from database API while maintaining all original visual effects
 */

// Fallback static data (your original skills) in case API fails
const fallbackSkills = [
  {
    name: 'HTML5',
    level: '95%',
    group: 'frontend',
    description: 'Semantic markup, accessibility, and modern HTML features',
    size: 45
  },
  {
    name: 'CSS3/SASS',
    level: '90%',
    group: 'frontend',
    description: 'Responsive design, animations, and modern layout techniques',
    size: 42
  },
  {
    name: 'JavaScript (ES6+)',
    level: '85%',
    group: 'frontend',
    description: 'Modern JavaScript, async/await, and DOM manipulation',
    size: 48
  },
  {
    name: 'React',
    level: '80%',
    group: 'frontend',
    description: 'Component-based architecture, hooks, and state management',
    size: 46
  },
  {
    name: 'Node.js',
    level: '75%',
    group: 'backend',
    description: 'Server-side JavaScript and API development',
    size: 40
  },
  {
    name: 'Express',
    level: '70%',
    group: 'backend',
    description: 'RESTful API development and middleware integration',
    size: 38
  },
  {
    name: 'MongoDB',
    level: '65%',
    group: 'backend',
    description: 'NoSQL database design and integration',
    size: 36
  },
  {
    name: 'Git/GitHub',
    level: '90%',
    group: 'tools',
    description: 'Version control, branching strategies, and collaboration',
    size: 42
  },
  {
    name: 'Responsive Design',
    level: '95%',
    group: 'frontend',
    description: 'Mobile-first approach and cross-device compatibility',
    size: 45
  },
  {
    name: 'Performance Optimization',
    level: '85%',
    group: 'tools',
    description: 'Code splitting, lazy loading, and resource optimization',
    size: 42
  },
  {
    name: 'Accessibility (A11y)',
    level: '80%',
    group: 'tools',
    description: 'WCAG compliance and inclusive design principles',
    size: 40
  }
];

// Fallback static relationships in case API fails
const fallbackRelationships = [
  { source: 'HTML5', target: 'CSS3/SASS', strength: 0.9 },
  { source: 'HTML5', target: 'JavaScript (ES6+)', strength: 0.8 },
  { source: 'HTML5', target: 'Accessibility (A11y)', strength: 0.7 },
  { source: 'CSS3/SASS', target: 'Responsive Design', strength: 0.9 },
  { source: 'JavaScript (ES6+)', target: 'React', strength: 0.8 },
  { source: 'JavaScript (ES6+)', target: 'Node.js', strength: 0.7 },
  { source: 'React', target: 'Performance Optimization', strength: 0.7 },
  { source: 'Node.js', target: 'Express', strength: 0.9 },
  { source: 'Express', target: 'MongoDB', strength: 0.8 },
  { source: 'Git/GitHub', target: 'Performance Optimization', strength: 0.6 }
];

// Global variables to store current data
let currentSkills = fallbackSkills;
let currentRelationships = fallbackRelationships;
let isUsingDatabaseData = false;

/**
 * Load skills data from API with fallback to static data
 */
async function loadSkillsFromAPI() {
  try {
    console.log('🔄 Loading skills from database API...');
    
    const response = await fetch('/api/skills.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn('❌ API returned error:', data.message);
      throw new Error(data.message || 'API error');
    }
    
    if (data.skills && data.skills.length > 0) {
      // Transform API data to match expected format
      const transformedSkills = data.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        group: skill.group || 'tools',
        description: skill.description || `Professional experience with ${skill.name}`,
        size: skill.size || (30 + (parseInt(skill.level) || 50) * 0.2)
      }));
      
      currentSkills = transformedSkills;
      currentRelationships = data.relationships || fallbackRelationships;
      isUsingDatabaseData = true;
      
      console.log('✅ Successfully loaded', currentSkills.length, 'skills from database');
      return true;
    } else {
      throw new Error('No skills data received from API');
    }
    
  } catch (error) {
    console.warn('⚠️ Failed to load from database, using static fallback:', error.message);
    currentSkills = fallbackSkills;
    currentRelationships = fallbackRelationships;
    isUsingDatabaseData = false;
    return false;
  }
}

export async function initEnhancedSkillGraph() {
  const canvas = document.getElementById('skill-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const skillName = document.querySelector('.skill-name');
  const skillLevel = document.querySelector('.skill-level');
  const skillDescription = document.querySelector('.skill-description');
  const skillDetails = document.querySelector('.skill-details');
  const skillDetailHeight = skillDetails.offsetHeight;
  
  // Load skills data from API first
  await loadSkillsFromAPI();
  
  // Create noise for natural movement
  const noise = new SimplexNoise();
  
  // Make canvas responsive
  const resizeCanvas = () => {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 500; // Fixed height or you can make it responsive too
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Use current skills data (either from API or fallback)
  const skills = currentSkills;
  const relationships = currentRelationships;
  
  // Enhanced Node class with improved physics and dragging (UNCHANGED - All original animations preserved)
  class SkillNode {
    constructor(skill, index) {
      this.skill = skill;
      this.index = index; // Store index for identification
      
      // Initial position with randomness across wider area
      this.x = canvas.width/2 + (Math.random() - 0.5) * canvas.width * 1.5;
      this.y = canvas.height/2 + (Math.random() - 0.5) * canvas.height * 1.5;
      this.vx = 0;
      this.vy = 0;
      
      // Position with perlin noise effect
      this.noiseSeedX = Math.random() * 1000;
      this.noiseSeedY = Math.random() * 1000;
      this.noiseSpeed = 0.0002 + Math.random() * 0.0001; // Slower noise for gentler movement
      this.noiseMagnitude = 0.15 + Math.random() * 0.1; // Reduced noise magnitude
      
      // Target position (for organization and dragging)
      this.targetX = this.x;
      this.targetY = this.y;
      
      // Physics properties
      this.mass = skill.size / 10;
      this.friction = 0.985; // Slightly higher friction for smoother movement
      this.maxSpeed = 1.7; // Reduced max speed for more control
      
      // Visual properties
      this.baseRadius = skill.size * 0.65;
      this.radius = this.baseRadius;
      this.orbitRadius = this.baseRadius * 1.5;
      this.orbitWidth = 3;
      this.orbitProgress = 0;
      this.orbitSpeed = 0.01;
      
      // For pulsing effect
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.03 + Math.random() * 0.01; // Slower pulsing
      
      // State properties
      this.isVisible = true;
      this.opacity = 1;
      this.targetOpacity = 1;
      this.isHovered = false;
      this.isSelected = false;
      this.isDragging = false;
      this.zIndex = 0; // For layering nodes
      
      // Expanded hover area (larger than visible radius)
      this.hoverRadiusMultiplier = 1.3;
      
      // For glow effect
      this.glowIntensity = 0;
      this.targetGlowIntensity = 0.2;
      
      // For rotation effect
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.001; // Slower rotation
      
      // Define colors based on group
      switch (skill.group) {
        case 'frontend':
          this.color = '#5469d4'; // Blue
          this.particleColor = '#8e9bec';
          break;
        case 'backend':
          this.color = '#63d471'; // Green
          this.particleColor = '#9de5a6';
          break;
        case 'tools':
          this.color = '#f9a826'; // Orange
          this.particleColor = '#fbc36e';
          break;
        default:
          this.color = '#808080';
          this.particleColor = '#b0b0b0';
      }
      
      // Create particles that orbit around the node
      this.particles = [];
      const particleCount = Math.round(skill.size / 6); // Fewer particles
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          angle: Math.random() * Math.PI * 2,
          distance: this.radius * (1.2 + Math.random() * 0.8),
          speed: 0.01 + Math.random() * 0.01, // Slower particles
          size: 1 + Math.random() * 1.5, // Smaller particles
          opacity: 0.4 + Math.random() * 0.4 // Lower opacity
        });
      }
      
      // Extract level value for orbital progress
      this.levelValue = parseInt(skill.level) / 100;
    }
    
    // Gentle perpetual motion using noise
    applyNoiseMovement(time) {
      if (this.isDragging) return; // Skip if being dragged
      
      // Update noise seeds
      this.noiseSeedX += this.noiseSpeed;
      this.noiseSeedY += this.noiseSpeed;
      
      // Get noise values
      const noiseX = noise.noise2D(this.noiseSeedX, time * 0.0001) * this.noiseMagnitude;
      const noiseY = noise.noise2D(this.noiseSeedY, time * 0.0001) * this.noiseMagnitude;
      
      // Apply gentle force
      this.vx += noiseX * 0.04; // Reduced force
      this.vy += noiseY * 0.04;
    }
    
    // Visual pulsing effect
    pulse(time) {
      // Make nodes gently pulse in size
      const pulseFactor = Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.07; // Reduced pulse amplitude
      const targetRadius = this.baseRadius * (1 + pulseFactor);
      
      // Smooth size transition
      this.radius += (targetRadius - this.radius) * 0.1;
      
      // Animate orbital ring around node
      this.orbitProgress += this.orbitSpeed;
      if (this.orbitProgress > Math.PI * 2) {
        this.orbitProgress -= Math.PI * 2;
      }
      
      // Update rotation
      this.rotation += this.rotationSpeed;
    }
    
    // Physics update
    update(mouseX, mouseY, isDragging, isMouseDown, draggedNode, time, nodes) {
      // Skip updates for filtered out nodes
      if (!this.isVisible) {
        this.opacity += (0.2 - this.opacity) * 0.1; // Fade out to 20% opacity
        return;
      } else {
        this.opacity += (this.targetOpacity - this.opacity) * 0.1; // Fade in to target opacity
      }
      
      // Smooth transition for glow effect
      this.glowIntensity += (this.targetGlowIntensity - this.glowIntensity) * 0.1;
      
      // Apply random motion
      this.applyNoiseMovement(time);
      
      // Update each orbital particle
      this.particles.forEach(particle => {
        particle.angle += particle.speed * (this.isHovered ? 1.5 : 1); // Speed up when hovered, but less dramatically
        if (particle.angle > Math.PI * 2) particle.angle -= Math.PI * 2;
      });
      
      // Only apply attraction to target position if not dragging this node
      if (!this.isDragging) {
        // Apply very weak spring force toward target position (to prevent clustering)
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // Apply attraction force with strength based on distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {  // Only apply when far from target
          const springFactor = 0.0005; // Extremely weak for more independent movement
          this.vx += dx * springFactor;
          this.vy += dy * springFactor;
        }
      }
      
      // Node collision detection and avoidance - with increased minimum distance
      this.handleNodeCollisions(nodes);
      
      // Mouse interaction if not currently dragging another node
      if (mouseX !== null && mouseY !== null && draggedNode !== this) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Reset hovered state first
        this.isHovered = false;
        
        // Use expanded radius for hover detection
        const hoverRadius = this.radius * this.hoverRadiusMultiplier;
        
        // If mouse is within hover radius, set hovered state
        if (distance < hoverRadius) {
          this.isHovered = true;
          this.targetGlowIntensity = 0.8;
          this.zIndex = 100; // Bring to front when hovered
          
          if (!isDragging) {
            // Very gentle repulsion to prevent fleeing too quickly
            if (distance < this.radius * 0.8) {
              const angle = Math.atan2(dy, dx);
              const repulsionForce = 0.05; // Very reduced repulsion force
              this.vx -= Math.cos(angle) * repulsionForce;
              this.vy -= Math.sin(angle) * repulsionForce;
            }
          }
        } else {
          if (!this.isSelected) {
            this.targetGlowIntensity = 0.2; // Dim glow when not hovered/selected
            this.zIndex = 0; // Reset z-index
          }
        }
      } else if (!this.isSelected) {
        this.targetGlowIntensity = 0.2;
        this.zIndex = 0;
      }
      
      // Apply drag position directly
      if (this.isDragging && mouseX !== null && mouseY !== null) {
        this.x = mouseX;
        this.y = mouseY;
        this.zIndex = 200; // Highest z-index when dragging
        // Reset velocity when dragging
        this.vx = 0;
        this.vy = 0;
      } else {
        // Apply velocity with damping
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Limit maximum speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
          this.vx = (this.vx / speed) * this.maxSpeed;
          this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
      }
      
      // Boundary checks with bounce effect and inset for info panel
      const margin = this.radius + 10;
      const bottomMargin = margin + skillDetailHeight + 20; // Extra margin at bottom for info panel
      
      if (this.x < margin) {
        this.x = margin;
        this.vx = Math.abs(this.vx) * 0.5; // Bounce with energy loss
      } else if (this.x > canvas.width - margin) {
        this.x = canvas.width - margin;
        this.vx = -Math.abs(this.vx) * 0.5;
      }
      
      if (this.y < margin) {
        this.y = margin;
        this.vy = Math.abs(this.vy) * 0.5;
      } else if (this.y > canvas.height - bottomMargin) {
        // Special handling for bottom margin (info panel)
        this.y = canvas.height - bottomMargin;
        this.vy = -Math.abs(this.vy) * 0.5;
      }
    }
    
    // Handle collisions between nodes with increased separation
    handleNodeCollisions(nodes) {
      for (const otherNode of nodes) {
        // Skip self or invisible nodes
        if (otherNode === this || !otherNode.isVisible || !this.isVisible) continue;
        
        const dx = otherNode.x - this.x;
        const dy = otherNode.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Significantly increased minimum distance to keep nodes farther apart
        const minDistance = (this.radius + otherNode.radius) * 2.5; // Much larger minimum distance
        
        // If nodes are closer than the minimum distance
        if (distance < minDistance && distance > 0) {
          // Calculate separation force
          const angle = Math.atan2(dy, dx);
          const forceMagnitude = (minDistance - distance) * 0.04; // Stronger separation force
          
          // Apply force to both nodes inversely proportional to their masses
          const totalMass = this.mass + otherNode.mass;
          const thisForce = forceMagnitude * (otherNode.mass / totalMass);
          const otherForce = forceMagnitude * (this.mass / totalMass);
          
          // Only apply force if not dragging
          if (!this.isDragging) {
            this.vx -= Math.cos(angle) * thisForce;
            this.vy -= Math.sin(angle) * thisForce;
          }
          
          if (!otherNode.isDragging) {
            otherNode.vx += Math.cos(angle) * otherForce;
            otherNode.vy += Math.sin(angle) * otherForce;
          }
          
          // If one is hovered/selected, it should be on top
          if (this.isHovered || this.isSelected) {
            this.zIndex = Math.max(this.zIndex, otherNode.zIndex + 1);
          } else if (otherNode.isHovered || otherNode.isSelected) {
            otherNode.zIndex = Math.max(otherNode.zIndex, this.zIndex + 1);
          }
        }
      }
    }
    
    // Draw the node and its effects
    draw(ctx, time) {
      // Skip drawing completely invisible nodes
      if (this.opacity < 0.05) return;
      
      ctx.globalAlpha = this.opacity;
      
      // Draw glow effect for hovered/selected nodes
      if (this.glowIntensity > 0.1) {
        const glow = ctx.createRadialGradient(
          this.x, this.y, this.radius * 0.5,
          this.x, this.y, this.radius * 4
        );
        
        // Parse the color to RGB for glow effect
        let r, g, b;
        if (this.color.startsWith('#')) {
          r = parseInt(this.color.slice(1, 3), 16);
          g = parseInt(this.color.slice(3, 5), 16);
          b = parseInt(this.color.slice(5, 7), 16);
        } else {
          // Fallback
          r = 84; g = 105; b = 212;
        }
        
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.2 * this.glowIntensity})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw orbital particles
      this.particles.forEach(particle => {
        const particleX = this.x + Math.cos(particle.angle) * particle.distance;
        const particleY = this.y + Math.sin(particle.angle) * particle.distance;
        
        ctx.beginPath();
        ctx.fillStyle = this.particleColor;
        ctx.globalAlpha = particle.opacity * this.opacity;
        ctx.arc(particleX, particleY, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Reset global alpha
      ctx.globalAlpha = this.opacity;
      
      // Draw skill orbit (showing skill level)
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.orbitWidth;
      ctx.lineCap = 'round';
      
      // Draw full orbit with transparency
      ctx.globalAlpha = 0.2 * this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw skill level progress with full opacity
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      
      // Animate the progress line with a "filling" effect
      const startAngle = -Math.PI / 2; // Start from top
      const progressAngle = this.levelValue * Math.PI * 2;
      
      // For animated effect when first appearing
      const animatedProgress = Math.min(time * 0.002, this.levelValue);
      const currentProgressAngle = animatedProgress * Math.PI * 2;
      
      ctx.arc(this.x, this.y, this.orbitRadius, startAngle, startAngle + currentProgressAngle);
      ctx.stroke();
      
      // Draw the main node circle
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      
      // Parse the color to RGB for gradient
      let r, g, b;
      if (this.color.startsWith('#')) {
        r = parseInt(this.color.slice(1, 3), 16);
        g = parseInt(this.color.slice(3, 5), 16);
        b = parseInt(this.color.slice(5, 7), 16);
      } else {
        // Fallback
        r = 84; g = 105; b = 212;
      }
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add subtle inner border
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + (this.isHovered ? 0.4 : 0)})`;
      ctx.lineWidth = this.isHovered ? 2 : 1;
      ctx.stroke();
      
      // Draw node text with improved readability
      if (this.radius > 15) {
        ctx.save();
        
        // Text size based on node size but with minimum for readability
        const fontSize = Math.max(12, this.radius / 2.2);
        
        // Add text background/container for better readability
        const textWidth = ctx.measureText(this.skill.name).width + 16; // Add padding
        const textHeight = fontSize + 8; // Add padding
        
        // Draw text with shadow for better readability
        ctx.font = `${this.isHovered ? 'bold ' : ''}${fontSize}px var(--font-sans)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text background for readability (semi-transparent background)
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (!isDarkMode) {
          // For light mode: darker background for better contrast
          ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(this.x - textWidth/2, this.y - textHeight/2, textWidth, textHeight, 4);
          } else {
            // Fallback for browsers without roundRect
            ctx.rect(this.x - textWidth/2, this.y - textHeight/2, textWidth, textHeight);
          }
          ctx.fill();
          ctx.fillStyle = '#ffffff';
        } else {
          // For dark mode: node color as background with white text
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(this.x - textWidth/2, this.y - textHeight/2, textWidth, textHeight, 4);
          } else {
            // Fallback for browsers without roundRect
            ctx.rect(this.x - textWidth/2, this.y - textHeight/2, textWidth, textHeight);
          }
          ctx.fill();
          ctx.fillStyle = '#ffffff';
        }
        
        // Add strong text shadow for more readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw text
        ctx.fillText(this.skill.name, this.x, this.y);
        ctx.restore();
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1;
    }
    
    // Check if a point is inside this node (with expanded detection area)
    containsPoint(x, y) {
      const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
      // Use expanded radius for easier hover detection
      return distance <= this.radius * this.hoverRadiusMultiplier;
    }
  }
  
  // Create skill nodes
  const nodes = skills.map((skill, index) => new SkillNode(skill, index));
  
  // Map skill names to nodes for relationship lookup
  const nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.skill.name] = node;
  });
  
  // Initialize node positions with wide distribution and space between
  function arrangeNodesByGroup() {
    const groups = {};
    
    // Group nodes
    nodes.forEach(node => {
      const group = node.skill.group;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(node);
    });
    
    // Position each group with wide spacing between groups
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Expanded radius to use more of the canvas
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Bottom inset to avoid info panel
    const bottomInset = skillDetailHeight + 40;
    
    Object.keys(groups).forEach((group, index) => {
      // Position group centers farther apart
      const groupAngle = (index / Object.keys(groups).length) * Math.PI * 2 + Math.random() * 0.3;
      // Use a larger portion of the canvas
      const groupDist = maxRadius * (0.7 + Math.random() * 0.3);
      let groupX = centerX + Math.cos(groupAngle) * groupDist;
      let groupY = centerY + Math.sin(groupAngle) * groupDist;
      
      // Adjust Y position if too close to bottom edge
      if (groupY > canvas.height - bottomInset) {
        groupY = canvas.height - bottomInset - Math.random() * 50;
      }
      
      // Position nodes in this group with much more spacing
      groups[group].forEach((node, nodeIndex) => {
        // Spiral layout for more even distribution within groups
        const angle = nodeIndex * 2.5 + Math.random();
        // Much larger distance between nodes in same group
        const distance = (node.radius * 4) + Math.random() * maxRadius * 0.3;
        
        // Set initial and target positions with randomness
        node.targetX = groupX + Math.cos(angle) * distance;
        node.targetY = groupY + Math.sin(angle) * distance;
        
        // Initial position with more randomness
        node.x = node.targetX + (Math.random() - 0.5) * 100;
        node.y = node.targetY + (Math.random() - 0.5) * 100;
        
        // Ensure nodes don't start below the info panel
        if (node.y > canvas.height - bottomInset) {
          node.y = canvas.height - bottomInset - Math.random() * 30;
        }
      });
    });
  }
  
  // Position nodes with much wider distribution
  function arrangeAllNodes() {
    const centerX = canvas.width / 2;
    const centerY = (canvas.height - skillDetailHeight) / 2; // Center above info panel
    
    // Use more of the canvas area
    const canvasArea = canvas.width * (canvas.height - skillDetailHeight);
    const nodesArea = nodes.length * Math.PI * 70 * 70; // Approximate area needed for nodes with spacing
    
    // Calculate a radius that gives each node enough space
    const radius = Math.sqrt(canvasArea / (Math.PI * 2)) * 0.7;
    
    // Bottom inset to avoid info panel
    const bottomInset = skillDetailHeight + 40;
    
    // Spread nodes with golden angle for optimal distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.4 radians
    
    // Position all nodes with golden angle spiral for optimal spacing
    nodes.forEach((node, index) => {
      // Golden angle creates an optimal distribution
      const angle = index * goldenAngle;
      
      // Radius increases with index for spiral effect
      // This creates a nice spread where no two nodes are too close
      const distance = radius * Math.sqrt(index / nodes.length);
      
      node.targetX = centerX + Math.cos(angle) * distance;
      node.targetY = centerY + Math.sin(angle) * distance;
      
      // Add randomness to initial positions
      node.x = node.targetX + (Math.random() - 0.5) * 120;
      node.y = node.targetY + (Math.random() - 0.5) * 100;
      
      // Ensure nodes don't start below the info panel
      if (node.y > canvas.height - bottomInset) {
        node.y = canvas.height - bottomInset - Math.random() * 30;
      }
      
      // Extra boundary checks to keep nodes in view
      const margin = node.radius + 20;
      
      if (node.x < margin) node.x = margin + Math.random() * 20;
      if (node.x > canvas.width - margin) node.x = canvas.width - margin - Math.random() * 20;
      if (node.y < margin) node.y = margin + Math.random() * 20;
    });
  }
  
  // Call arrangement function
  arrangeNodesByGroup();
  
  // Particle system for flowing between nodes
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.maxParticles = 120; // Slightly fewer particles
    }
    
    // Create a particle flowing between related nodes
    createParticle(sourceNode, targetNode, strength = 1) {
      if (!sourceNode.isVisible || !targetNode.isVisible) return;
      
      // Don't create too many particles
      if (this.particles.length >= this.maxParticles) return;
      
      // Create with higher probability for hovered nodes
      const probability = (sourceNode.isHovered || targetNode.isHovered) ? 0.4 : 0.05;
      if (Math.random() > probability * strength) return;
      
      // Get random position along the source node radius
      const angle = Math.random() * Math.PI * 2;
      const startX = sourceNode.x + Math.cos(angle) * sourceNode.radius * 0.8;
      const startY = sourceNode.y + Math.sin(angle) * sourceNode.radius * 0.8;
      
      // Create particle
      this.particles.push({
        x: startX,
        y: startY,
        size: 1 + Math.random() * 1.5, // Smaller particles
        speedFactor: 0.01 + Math.random() * 0.01, // Slower particles
        progress: 0,
        source: sourceNode,
        target: targetNode,
        color: sourceNode.particleColor,
        opacity: 0.3 + Math.random() * 0.4, // Less bright
        // Use a bezier curve for movement
        controlPoint: {
          x: (sourceNode.x + targetNode.x) / 2 + (Math.random() - 0.5) * 100,
          y: (sourceNode.y + targetNode.y) / 2 + (Math.random() - 0.5) * 100
        }
      });
    }
    
    update() {
      // Update existing particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        
        // Update progress
        p.progress += p.speedFactor * (p.source.isHovered || p.target.isHovered ? 1.5 : 1);
        
        // Remove completed particles
        if (p.progress >= 1) {
          this.particles.splice(i, 1);
          continue;
        }
        
        // Calculate position along bezier curve
        const t = p.progress;
        const mt = 1 - t;
        
        // Quadratic bezier formula: (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        p.x = mt * mt * p.source.x + 2 * mt * t * p.controlPoint.x + t * t * p.target.x;
        p.y = mt * mt * p.source.y + 2 * mt * t * p.controlPoint.y + t * t * p.target.y;
        
        // Fade out as it reaches the target
        if (p.progress > 0.8) {
          p.opacity *= 0.95;
        }
      }
      
      // Create new particles between related nodes
      relationships.forEach(rel => {
        const sourceNode = nodeMap[rel.source];
        const targetNode = nodeMap[rel.target];
        
        if (sourceNode && targetNode) {
          // Create particle in both directions for better flow
          this.createParticle(sourceNode, targetNode, rel.strength);
          this.createParticle(targetNode, sourceNode, rel.strength);
        }
      });
    }
    
    draw(ctx) {
      this.particles.forEach(p => {
        // Skip drawing if either node is nearly invisible
        if (p.source.opacity < 0.1 || p.target.opacity < 0.1) return;
        
        ctx.beginPath();
        ctx.globalAlpha = p.opacity * Math.min(p.source.opacity, p.target.opacity);
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }
  }
  
  // Create particle system
  const particleSystem = new ParticleSystem();
  
  // Draw connections between related nodes
  function drawConnections(ctx) {
    relationships.forEach(rel => {
      const sourceNode = nodeMap[rel.source];
      const targetNode = nodeMap[rel.target];
      
      if (sourceNode && targetNode) {
        // Skip if either node is nearly invisible
        if (sourceNode.opacity < 0.1 || targetNode.opacity < 0.1) return;
        
        // Create gradient for the connection line
        const gradient = ctx.createLinearGradient(
          sourceNode.x, sourceNode.y,
          targetNode.x, targetNode.y
        );
        
        // Get colors from the nodes
        gradient.addColorStop(0, sourceNode.color);
        gradient.addColorStop(1, targetNode.color);
        
        // Draw connection with opacity based on hover state
        const baseOpacity = 0.12; // Lower default opacity
        const hoverOpacity = 0.4; // Less intense highlight
        let opacity = baseOpacity;
        
        // Brighten the connection if either node is hovered
        if (sourceNode.isHovered || targetNode.isHovered) {
          opacity = hoverOpacity;
        }
        
        // Set line style
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2; // Thinner line
        ctx.globalAlpha = opacity * Math.min(sourceNode.opacity, targetNode.opacity);
        
        // Draw curved line for more organic feel
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        // Calculate control point
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Perpendicular offset for control point
        const offsetX = -dy / dist * 30; // Slightly stronger curve
        const offsetY = dx / dist * 30;
        
        // Draw the curve
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.quadraticCurveTo(
          midX + offsetX, midY + offsetY,
          targetNode.x, targetNode.y
        );
        ctx.stroke();
        
        // Reset global alpha
        ctx.globalAlpha = 1;
      }
    });
  }
  
  // Handle mouse interactions
  let mouseX = null;
  let mouseY = null;
  let selectedNode = null;
  let draggedNode = null;
  let isMouseDown = false;
  let isDragging = false;
  
  // Track mouse position
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Handle dragging
    if (isMouseDown && draggedNode) {
      isDragging = true;
    }
    
    // Update skill details panel on hover
    let hoveredNode = null;
    
    // Find the node under cursor if not dragging a different node
    if (!isDragging || draggedNode) {
      // Sort nodes by z-index to find the top one first
      const sortedNodes = [...nodes].sort((a, b) => b.zIndex - a.zIndex);
      
      for (const node of sortedNodes) {
        if (node.isVisible && node.containsPoint(mouseX, mouseY)) {
          hoveredNode = node;
          break;
        }
      }
    }
    
    // Update skill details if hovering over a node
    if (hoveredNode) {
      skillName.textContent = hoveredNode.skill.name;
      skillLevel.textContent = hoveredNode.skill.level;
      skillDescription.textContent = hoveredNode.skill.description;
    } else if (draggedNode) {
      // Show details for dragged node
      skillName.textContent = draggedNode.skill.name;
      skillLevel.textContent = draggedNode.skill.level;
      skillDescription.textContent = draggedNode.skill.description;
    } else {
      // Reset to default text when not hovering
      skillName.textContent = 'Hover or drag skills to explore';
      skillLevel.textContent = '-';
      skillDescription.textContent = 'This interactive visualization shows my skills. Skills are connected based on their relationships.';
    }
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
    
    // Reset to default when mouse leaves canvas
    skillName.textContent = 'Hover over skills to see details';
    skillLevel.textContent = '-';
    skillDescription.textContent = 'This interactive visualization shows my skills. Skills are connected based on their relationships.';
  });
  
  // Mouse down event for dragging
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    isMouseDown = true;
    
    // Sort nodes by z-index to handle overlaps correctly
    const sortedNodes = [...nodes].sort((a, b) => b.zIndex - a.zIndex);
    
    // Find node under cursor for potential drag
    for (const node of sortedNodes) {
      if (node.isVisible && node.containsPoint(clickX, clickY)) {
        draggedNode = node;
        node.isDragging = true;
        
        // Bump z-index for dragged node
        node.zIndex = 200;
        
        // Select this node
        if (selectedNode && selectedNode !== node) {
          selectedNode.isSelected = false;
          selectedNode.targetGlowIntensity = 0.2;
        }
        
        selectedNode = node;
        node.isSelected = true;
        node.targetGlowIntensity = 0.8;
        
        break;
      }
    }
  });
  
  // Mouse up event to end drag
  window.addEventListener('mouseup', () => {
    isMouseDown = false;
    
    if (draggedNode) {
      draggedNode.isDragging = false;
      // Keep z-index high for a moment after dragging
      setTimeout(() => {
        if (draggedNode && !draggedNode.isHovered) {
          draggedNode.zIndex = draggedNode.isSelected ? 100 : 0;
        }
      }, 500);
      
      draggedNode = null;
    }
    
    isDragging = false;
  });
  
  // Filter nodes based on category
  window.filterNodesByCategory = function(category) {
    // Set visibility based on category
    nodes.forEach(node => {
      if (category === 'all') {
        node.isVisible = true;
        node.targetOpacity = 1;
      } else {
        const matches = node.skill.group === category;
        node.isVisible = matches;
        node.targetOpacity = matches ? 1 : 0.2;
      }
    });
    
    // Reset selected node if it's now hidden
    if (selectedNode && !selectedNode.isVisible) {
      selectedNode.isSelected = false;
      selectedNode = null;
    }
    
    // Redistribute the position targets for visible nodes with more spacing
    if (category === 'all') {
      arrangeAllNodes();
    } else {
      // Arrange only the visible nodes more widely
      const visibleNodes = nodes.filter(node => node.isVisible);
      const centerX = canvas.width / 2;
      const centerY = (canvas.height - skillDetailHeight) / 2;
      
      // Much more space between nodes - use golden angle for optimal distribution
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      
      // Distribute in spiral pattern with good spacing
      const bottomInset = skillDetailHeight + 40;
      const radius = Math.min(canvas.width, canvas.height - bottomInset) * 0.3;
      
      visibleNodes.forEach((node, i) => {
        // Golden angle for optimal distribution
        const angle = i * goldenAngle;
        // Radius increases with index for spiral effect
        const distance = radius * Math.sqrt(i / visibleNodes.length);
        
        node.targetX = centerX + Math.cos(angle) * distance;
        node.targetY = centerY + Math.sin(angle) * distance;
        
        // Make sure nodes don't go below the info panel
        if (node.targetY > canvas.height - bottomInset) {
          node.targetY = canvas.height - bottomInset - Math.random() * 40;
        }
      });
    }
  };
  
  // Add global refresh function for external access
  window.refreshSkillGraph = async function() {
    console.log('🔄 Refreshing skill graph...');
    await loadSkillsFromAPI();
    console.log(isUsingDatabaseData ? '✅ Refresh successful' : '⚠️ Refresh failed, using fallback');
  };
  
  // Main animation loop
  let lastTime = 0;
  function animate(time) {
    // Calculate time delta
    const deltaTime = time - lastTime;
    lastTime = time;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sort nodes by z-index for proper layering
    const sortedNodes = [...nodes].sort((a, b) => a.zIndex - b.zIndex);
    
    // Update nodes
    for (const node of sortedNodes) {
      node.update(mouseX, mouseY, isDragging, isMouseDown, draggedNode, time, sortedNodes);
      node.pulse(time);
    }
    
    // Update particle system
    particleSystem.update();
    
    // Draw connections
    drawConnections(ctx);
    
    // Draw particles
    particleSystem.draw(ctx);
    
    // Draw nodes in order of z-index
    for (const node of sortedNodes) {
      node.draw(ctx, time);
    }
    
    // Continue animation loop
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate(0);
}