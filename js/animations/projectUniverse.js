// /js/animations/projectUniverse.js

import { SimplexNoise } from '../utils/simplexNoise.js';
import { createProjectDetail, initProjectDetailInteractions } from '../components/projectDetail.js';

/**
 * Project Universe Visualization
 * Creates an interactive cosmic-like environment for showcasing projects
 * Now with improved node separation, dynamic movement, and smooth interactions
 */
export function initProjectUniverseVisualization() {
  const canvas = document.getElementById('project-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const projectContainer = document.querySelector('.project-universe');
  
  // Make canvas responsive
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Create noise for natural movement
  const noise = new SimplexNoise();
  
  // Particle class with improved behavior
  class Particle {
    constructor(x, y, size, speed, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = speed;
      this.color = color;
      this.opacity = 0.3 + Math.random() * 0.7;
      this.direction = Math.random() * Math.PI * 2; // Random direction
      this.moveDistance = Math.random() * 2 + 1; // Random movement distance

      // Position with perlin noise effect
      this.noiseSeedX = Math.random() * 1000;
      this.noiseSeedY = Math.random() * 1000;
      this.noiseSpeed = 0.0002 + Math.random() * 0.0001; // Slower noise for gentler movement
      this.noiseMagnitude = 0.15 + Math.random() * 0.1; // Reduced noise magnitude
    }
    
    update(mouseX, mouseY) {
      // Apply gentle perpetual motion using noise
      this.noiseSeedX += this.noiseSpeed;
      this.noiseSeedY += this.noiseSpeed;
      
      // Get noise values
      const noiseX = noise.noise2D(this.noiseSeedX, Date.now() * 0.0001) * this.noiseMagnitude;
      const noiseY = noise.noise2D(this.noiseSeedY, Date.now() * 0.0001) * this.noiseMagnitude;
      
      // Apply gentle force
      this.x += noiseX;
      this.y += noiseY;
      
      // Move particles using sin and cos for more natural movement
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
      
      // Add mouse interaction
      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repel particles when mouse is near
        if (distance < 80) {
          const angle = Math.atan2(dy, dx);
          const force = (80 - distance) / 80;
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }
      
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
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
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
  
  // Connect nearby particles with lines
  function connectParticles() {
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
  }
  
  // Connect particles to project nodes
  function connectToProjects() {
    const projectNodes = document.querySelectorAll('.project-node');
    
    if (!canvas.getBoundingClientRect) return;
    const canvasRect = canvas.getBoundingClientRect();
    
    projectNodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      if (!rect) return;
      
      const nodeX = rect.left + rect.width / 2 - canvasRect.left;
      const nodeY = rect.top + rect.height / 2 - canvasRect.top;
      
      // Skip if nodeX or nodeY is invalid
      if (isNaN(nodeX) || isNaN(nodeY)) return;
      
      const maxDistance = 150;
      
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].x - nodeX;
        const dy = particles[i].y - nodeY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          ctx.strokeStyle = `${accentColor}${Math.floor(opacity * 180).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(nodeX, nodeY);
          ctx.stroke();
        }
      }
    });
  }
  
  // ------- DATA-DRIVEN PROJECT RENDERING -------
  
  // Load projects from JSON
  async function loadProjects() {
    try {
      const response = await fetch('api/projects.php');
      if (!response.ok) {
        throw new Error('Failed to load projects data');
      }
      const data = await response.json();
      return data.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to empty array if JSON fails to load
      return [];
    }
  }
  
  // Create project node HTML - now using the thumbnail image
  function createProjectNode(project) {
    const node = document.createElement('div');
    node.className = `project-node size-${project.size}`;
    node.setAttribute('data-project', project.id);
    
    // Set position
    node.style.top = project.position.top;
    node.style.left = project.position.left;
    
    // Add data attributes for size to assist with collision detection
    const sizeMap = { 'sm': 50, 'md': 70, 'lg': 90 };
    node.setAttribute('data-radius', sizeMap[project.size] || 70);
    
    // Ensure unique IDs for SVG elements to prevent conflicts
    const textPathId = `text-path-${project.id}-${Date.now()}`;
    const gradientId = `text-gradient-${project.id}-${Date.now()}`;
    
    // Add inner content
    node.innerHTML = `
      <div class="project-circle">
        <div class="project-inner">
          <img src="${project.thumbnail || project.images[0]}" alt="${project.title}">
        </div>
        <svg class="text-ring" viewBox="0 0 100 100">
          <defs>
            <path id="${textPathId}" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"></path>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop class="text-highlight" offset="0%" stop-color="var(--color-accent)" stop-opacity="1"></stop>
              <stop class="text-normal" offset="25%" stop-color="var(--color-text-light)" stop-opacity="1"></stop>
            </linearGradient>
          </defs>
          <text>
            <textPath xlink:href="#${textPathId}" startOffset="0%" fill="url(#${gradientId})">
              ${project.title} • ${project.subtitle} •
            </textPath>
          </text>
        </svg>
      </div>
    `;
    
    // Store gradient ID on the node element for later reference
    node.setAttribute('data-gradient-id', gradientId);
    
    return node;
  }
  
  // IMPROVED: Better node positioning with collision detection
  function calculateProjectPositions(projects) {
    // First, preserve any manually positioned projects
    const positionedProjects = projects.filter(p => 
      p.position && p.position.top && p.position.left && 
      p.position.top.trim() !== '' && p.position.left.trim() !== ''
    );
    
    // Identify projects that need auto-positioning
    const unpositionedProjects = projects.filter(p => 
      !p.position || !p.position.top || !p.position.left || 
      p.position.top.trim() === '' || p.position.left.trim() === ''
    );
    
    // If no projects need positioning, return the original array
    if (unpositionedProjects.length === 0) {
      return projects;
    }
    
    // Get the container dimensions
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    
    // Define the usable area (margin from edges)
    const marginPercent = 15; // 15% margin from each edge
    const minLeft = marginPercent;
    const maxLeft = 100 - marginPercent;
    const minTop = marginPercent;
    const maxTop = 100 - marginPercent;
    
    // Size map for radius calculation (in percentage units)
    const sizeMap = { 'sm': 8, 'md': 12, 'lg': 16 };
    
    // Store positioned projects for collision detection
    const placedProjects = [...positionedProjects];
    
    // Position each unpositioned project
    unpositionedProjects.forEach((project, index) => {
      // Calculate position using golden angle for better distribution
      const i = index;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
      
      // Calculate base angle and radius for spiral pattern
      const angle = i * goldenAngle;
      const totalProjects = unpositionedProjects.length;
      
      // Calculate project's radius based on its size (for collision detection)
      const projectRadius = sizeMap[project.size] || 10;
      
      // Try different radii with increasing distance from center until no collision
      let found = false;
      let attempts = 0;
      let radius = 0.2; // Start closer to center
      const radiusIncrement = 0.05; // Smaller increments for more even distribution
      const maxRadius = 0.8; // Upper bound for radius
      
      // Try different positions until a non-colliding position is found
      while (!found && attempts < 100 && radius <= maxRadius) {
        // Add small random variation to angle for more organic distribution
        const angleVariation = (Math.random() - 0.5) * 0.4; // Reduced variation
        const currentAngle = angle + angleVariation;
        
        // Calculate normalized position (0-1)
        const normalizedX = 0.5 + Math.cos(currentAngle) * radius;
        const normalizedY = 0.5 + Math.sin(currentAngle) * radius;
        
        // Map to container space with margins
        const left = minLeft + normalizedX * (maxLeft - minLeft);
        const top = minTop + normalizedY * (maxTop - minTop);
        
        // Check for collisions with already placed projects
        let hasCollision = false;
        
        for (const placedProject of placedProjects) {
          // Get placed project's position
          let placedLeft = parseFloat(placedProject.position.left) || 0;
          let placedTop = parseFloat(placedProject.position.top) || 0;
          
          // Remove % sign if present
          if (placedProject.position.left && placedProject.position.left.includes('%')) {
            placedLeft = parseFloat(placedProject.position.left.replace('%', ''));
          }
          if (placedProject.position.top && placedProject.position.top.includes('%')) {
            placedTop = parseFloat(placedProject.position.top.replace('%', ''));
          }
          
          // Calculate placed project's radius based on its size
          const placedRadius = sizeMap[placedProject.size] || 10;
          
          // Calculate distance between centers (in percentage space)
          const dx = left - placedLeft;
          const dy = top - placedTop;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Minimum required distance between centers to avoid collision
          // Use larger gap for better spacing
          const minDistance = projectRadius + placedRadius + 8;
          
          if (distance < minDistance) {
            hasCollision = true;
            break;
          }
        }
        
        if (!hasCollision) {
          // No collision found, use this position
          project.position = {
            left: `${left}%`,
            top: `${top}%`
          };
          
          // Add to placed projects for collision detection
          placedProjects.push(project);
          
          found = true;
        } else {
          // Increase radius and try again
          radius += radiusIncrement;
          attempts++;
        }
      }
      
      // If no valid position found after all attempts, use a fallback
      if (!found) {
        console.warn(`Couldn't find non-colliding position for project ${project.id}. Using fallback position.`);
        
        // Use a random position with large margin from edges as fallback
        const fallbackLeft = 20 + Math.random() * 60; // 20% to 80%
        const fallbackTop = 20 + Math.random() * 60;  // 20% to 80%
        
        project.position = {
          left: `${fallbackLeft}%`,
          top: `${fallbackTop}%`
        };
        
        // Add to placed projects array anyway
        placedProjects.push(project);
      }
    });
    
    // Combine positioned and auto-positioned projects
    return [...positionedProjects, ...unpositionedProjects];
  }

  // NEW: Physics system for project nodes
  class NodePhysics {
    constructor() {
      this.nodes = [];
      this.dragging = null;
      this.hoveredNode = null;
      this.lastTime = 0;
      this.canvasRect = null;
      this.boundaryMargin = 40; // Margin from canvas edges
      this.friction = 0.98; // Friction coefficient to dampen velocity
      this.maxSpeed = 1.0; // Maximum speed in pixels per frame
      this.repulsionStrength = 0.15; // Strength of repulsion between nodes
      this.attractionStrength = 0.02; // Strength of attraction to original position
      this.cursorRepulsionStrength = 2.0; // Strength of cursor repulsion
      this.cursorAttractionStrength = 0.6; // Strength of cursor attraction
      this.cursorInfluenceRadius = 150; // Radius of cursor influence
      this.isRunning = false;
      this.collisionResponse = 0.4; // Bounce elasticity (1.0 = perfect bounce)
      
      // Noise for more organic movement
      this.noise = new SimplexNoise();
      this.noiseScale = 0.002; // Scale of noise (smaller = smoother)
      this.noiseStrength = 0.05; // Strength of noise forces
      
      // State for interaction
      this.mouseX = null;
      this.mouseY = null;
      this.isPointerDown = false;
      
      // Bind methods
      this.update = this.update.bind(this);
      this.reset = this.reset.bind(this);
      this.addNode = this.addNode.bind(this);
      this.removeNode = this.removeNode.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
    }
    
    initialize() {
      // Initialize canvas rect
      this.canvasRect = canvas.getBoundingClientRect();
      
      // Add event listeners
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerdown', this.handlePointerDown);
      document.addEventListener('pointerup', this.handlePointerUp);
      
      // Reset the system
      this.reset();
      
      // Start the simulation
      this.isRunning = true;
      requestAnimationFrame(this.update);
    }
    
    handlePointerMove(e) {
      if (!this.canvasRect) return;
      
      // Update mouse position relative to canvas
      this.mouseX = e.clientX - this.canvasRect.left;
      this.mouseY = e.clientY - this.canvasRect.top;
      
      // Check if we're hovering over any node
      this.hoveredNode = null;
      
      // Only check for hover if not dragging
      if (!this.dragging) {
        for (const node of this.nodes) {
          const dx = this.mouseX - node.x;
          const dy = this.mouseY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < node.radius * 1.5) {
            this.hoveredNode = node;
            break;
          }
        }
      }
      
      // If dragging, update the dragged node position
      if (this.dragging && this.isPointerDown) {
        this.dragging.x = this.mouseX;
        this.dragging.y = this.mouseY;
        this.dragging.vx = 0;
        this.dragging.vy = 0;
      }
    }
    
    handlePointerDown(e) {
      this.isPointerDown = true;
      
      // Check if we're clicking on a node
      if (this.hoveredNode) {
        this.dragging = this.hoveredNode;
        
        // Bring the node to front (for both DOM and physics)
        this.dragging.element.style.zIndex = '100';
      }
    }
    
    handlePointerUp() {
      this.isPointerDown = false;
      
      if (this.dragging) {
        // Reset z-index after drag
        setTimeout(() => {
          if (this.dragging && this.dragging.element) {
            this.dragging.element.style.zIndex = '';
          }
        }, 100);
        
        this.dragging = null;
      }
    }
    
    reset() {
      // Clear existing nodes
      this.nodes = [];
      this.dragging = null;
      this.hoveredNode = null;
    }
    
    addNode(element) {
      if (!element) return;
      
      // Get the element's size and position
      const rect = element.getBoundingClientRect();
      
      // Convert from percent to pixels for internal calculations
      let left = element.style.left;
      let top = element.style.top;
      
      // Strip percentage
      left = parseFloat(left.replace('%', ''));
      top = parseFloat(top.replace('%', ''));
      
      // Convert percentage to pixels
      const x = (left / 100) * this.canvasRect.width;
      const y = (top / 100) * this.canvasRect.height;
      
      // Calculate radius from element's data-radius or size
      const radiusAttr = element.getAttribute('data-radius');
      const radius = radiusAttr ? parseFloat(radiusAttr) : rect.width / 2;
      
      // Create a physics node
      const node = {
        element,
        originalX: x,
        originalY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        radius,
        mass: radius * 0.1, // Mass proportional to radius
        isHovered: false,
        isMoving: false,
        noiseSeedX: Math.random() * 1000,
        noiseSeedY: Math.random() * 1000
      };
      
      this.nodes.push(node);
    }
    
    removeNode(element) {
      this.nodes = this.nodes.filter(node => node.element !== element);
    }
    
    updateNodePositions() {
      this.nodes.forEach(node => {
        if (node.element) {
          // Convert coordinates back to percentages for CSS positioning
          const percentX = (node.x / this.canvasRect.width) * 100;
          const percentY = (node.y / this.canvasRect.height) * 100;
          
          // Update element position
          node.element.style.left = `${percentX}%`;
          node.element.style.top = `${percentY}%`;
          
          // Add moving class if the node is moving significantly
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          const isMoving = speed > 0.5;
          
          if (isMoving !== node.isMoving) {
            node.isMoving = isMoving;
            if (isMoving) {
              node.element.classList.add('moving');
            } else {
              node.element.classList.remove('moving');
            }
          }
        }
      });
    }
    
    applyNoiseForces(node, deltaTime) {
      // Update noise seeds
      node.noiseSeedX += this.noiseScale * deltaTime;
      node.noiseSeedY += this.noiseScale * deltaTime;
      
      // Calculate noise values
      const noiseX = this.noise.noise2D(node.noiseSeedX, 0) * this.noiseStrength;
      const noiseY = this.noise.noise2D(0, node.noiseSeedY) * this.noiseStrength;
      
      // Apply noise forces
      node.vx += noiseX;
      node.vy += noiseY;
    }
    
    applyBoundaryForces(node) {
      // Keep nodes inside canvas boundaries with soft forces
      const margin = this.boundaryMargin;
      const strength = 0.2;
      
      // Calculate distance to boundaries
      const distLeft = node.x - margin;
      const distRight = this.canvasRect.width - margin - node.x;
      const distTop = node.y - margin;
      const distBottom = this.canvasRect.height - margin - node.y;
      
      // Apply soft boundary forces
      if (distLeft < node.radius) {
        node.vx += strength * (node.radius - distLeft);
      }
      if (distRight < node.radius) {
        node.vx -= strength * (node.radius - distRight);
      }
      if (distTop < node.radius) {
        node.vy += strength * (node.radius - distTop);
      }
      if (distBottom < node.radius) {
        node.vy -= strength * (node.radius - distBottom);
      }
      
      // Hard boundary constraints (prevents escaping)
      const hardMargin = 10;
      if (node.x < hardMargin) {
        node.x = hardMargin;
        node.vx = Math.abs(node.vx) * this.collisionResponse;
      }
      if (node.x > this.canvasRect.width - hardMargin) {
        node.x = this.canvasRect.width - hardMargin;
        node.vx = -Math.abs(node.vx) * this.collisionResponse;
      }
      if (node.y < hardMargin) {
        node.y = hardMargin;
        node.vy = Math.abs(node.vy) * this.collisionResponse;
      }
      if (node.y > this.canvasRect.height - hardMargin) {
        node.y = this.canvasRect.height - hardMargin;
        node.vy = -Math.abs(node.vy) * this.collisionResponse;
      }
    }
    
    applyOriginalPositionAttraction(node) {
      // Apply attraction to original position
      const dx = node.originalX - node.x;
      const dy = node.originalY - node.y;
      const distanceSquared = dx * dx + dy * dy;
      
      // Don't apply too much force when close to original position
      if (distanceSquared > 100) {
        const distance = Math.sqrt(distanceSquared);
        const forceMagnitude = this.attractionStrength * (distance * 0.1); // Stronger force when further
        
        node.vx += dx / distance * forceMagnitude;
        node.vy += dy / distance * forceMagnitude;
      }
    }
    
    resolveNodeCollisions() {
      for (let i = 0; i < this.nodes.length; i++) {
        const nodeA = this.nodes[i];
        
        // Skip if this node is being dragged
        if (nodeA === this.dragging) continue;
        
        for (let j = i + 1; j < this.nodes.length; j++) {
          const nodeB = this.nodes[j];
          
          // Skip if nodeB is being dragged
          if (nodeB === this.dragging) continue;
          
          // Calculate distance
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distanceSquared = dx * dx + dy * dy;
          const minDistance = nodeA.radius + nodeB.radius;
          
          // Skip if nodes are far apart
          if (distanceSquared >= minDistance * minDistance) continue;
          
          // Calculate actual distance
          const distance = Math.sqrt(distanceSquared);
          
          // Calculate unit vector of collision
          const nx = dx / distance;
          const ny = dy / distance;
          
          // Calculate overlap
          const overlap = minDistance - distance;
          
          // Resolve position (move nodes apart proportionally to their masses)
          const totalMass = nodeA.mass + nodeB.mass;
          const ratioA = nodeB.mass / totalMass;
          const ratioB = nodeA.mass / totalMass;
          
          // Position resolution (with some extra separation for better spacing)
          nodeA.x -= nx * (overlap * 1.05) * ratioA;
          nodeA.y -= ny * (overlap * 1.05) * ratioA;
          nodeB.x += nx * (overlap * 1.05) * ratioB;
          nodeB.y += ny * (overlap * 1.05) * ratioB;
          
          // Calculate velocity components along collision normal
          const vax = nodeA.vx;
          const vay = nodeA.vy;
          const vbx = nodeB.vx;
          const vby = nodeB.vy;
          
          // Relative velocity along normal
          const vrx = vbx - vax;
          const vry = vby - vay;
          const vrDotN = vrx * nx + vry * ny;
          
          // Skip if nodes are already moving away from each other
          if (vrDotN > 0) continue;
          
          // Calculate impulse scalar
          const impulseScalar = -(1 + this.collisionResponse) * vrDotN / totalMass;
          
          // Apply impulse proportionally to mass
          nodeA.vx -= impulseScalar * nodeB.mass * nx;
          nodeA.vy -= impulseScalar * nodeB.mass * ny;
          nodeB.vx += impulseScalar * nodeA.mass * nx;
          nodeB.vy += impulseScalar * nodeA.mass * ny;
          
          // Apply additional repulsion for smoother separation
          const repulsionForce = this.repulsionStrength / Math.max(0.1, distance);
          nodeA.vx -= nx * repulsionForce;
          nodeA.vy -= ny * repulsionForce;
          nodeB.vx += nx * repulsionForce;
          nodeB.vy += ny * repulsionForce;
        }
      }
    }
    
    applyMouseInteraction() {
      if (this.mouseX === null || this.mouseY === null) return;
      
      for (const node of this.nodes) {
        // Skip if this node is being dragged
        if (node === this.dragging) continue;
        
        const dx = this.mouseX - node.x;
        const dy = this.mouseY - node.y;
        const distanceSquared = dx * dx + dy * dy;
        
        // Skip if node is far from mouse
        if (distanceSquared > this.cursorInfluenceRadius * this.cursorInfluenceRadius) continue;
        
        const distance = Math.sqrt(distanceSquared);
        
        // If node is close to cursor but not touching
        if (distance > node.radius * 1.5) {
          // Calculate normalized direction
          const nx = dx / distance;
          const ny = dy / distance;
          
          // Calculate force strength (stronger when closer)
          const force = this.cursorRepulsionStrength * (1 - distance / this.cursorInfluenceRadius);
          
          // Apply repulsion force (push away from cursor)
          node.vx -= nx * force;
          node.vy -= ny * force;
        }
        // If node is very close to cursor, add subtle attraction to avoid jittery repulsion
        else if (distance > node.radius * 0.8) {
          // Calculate normalized direction
          const nx = dx / distance;
          const ny = dy / distance;
          
          // Apply gentle attraction to counteract strong repulsion
          node.vx += nx * this.cursorAttractionStrength;
          node.vy += ny * this.cursorAttractionStrength;
        }
      }
    }
    
    update(timestamp) {
      if (!this.isRunning) return;
      
      // Calculate delta time for smoother physics
      const deltaTime = this.lastTime ? Math.min((timestamp - this.lastTime) / 16, 2.0) : 1.0;
      this.lastTime = timestamp;
      
      // Skip update if canvas is hidden or zero-sized
      if (!this.canvasRect || this.canvasRect.width === 0 || this.canvasRect.height === 0) {
        requestAnimationFrame(this.update);
        return;
      }
      
      // Update canvas rect in case of resize
      if (timestamp % 100 < 20) { // Only check every ~100ms
        this.canvasRect = canvas.getBoundingClientRect();
      }
      
      // Skip dragged node in physics update
      const nodesToUpdate = this.dragging 
        ? this.nodes.filter(node => node !== this.dragging) 
        : this.nodes;
      
      // Apply mouse interaction
      this.applyMouseInteraction();
      
      // Update each node
      for (const node of nodesToUpdate) {
        // Apply attraction to original position
        this.applyOriginalPositionAttraction(node);
        
        // Apply perlin noise forces for organic movement
        this.applyNoiseForces(node, deltaTime);
        
        // Apply velocity
        node.x += node.vx * deltaTime;
        node.y += node.vy * deltaTime;
        
        // Apply friction
        node.vx *= this.friction;
        node.vy *= this.friction;
        
        // Apply max speed limit
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > this.maxSpeed) {
          node.vx = (node.vx / speed) * this.maxSpeed;
          node.vy = (node.vy / speed) * this.maxSpeed;
        }
        
        // Apply boundary forces
        this.applyBoundaryForces(node);
      }
      
      // Resolve node collisions
      this.resolveNodeCollisions();
      
      // Update DOM node positions
      this.updateNodePositions();
      
      // Continue animation loop
      requestAnimationFrame(this.update);
    }
    
    cleanup() {
      this.isRunning = false;
      this.nodes = [];
      this.dragging = null;
      this.hoveredNode = null;
      
      // Remove event listeners
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerdown', this.handlePointerDown);
      document.removeEventListener('pointerup', this.handlePointerUp);
    }
  }
  
  // Create the physics system
  const nodePhysics = new NodePhysics();
  
  // IMPROVED: Magnetic hover effect with better physics
  function initMagneticEffect() {
    // Skip on mobile
    if (window.innerWidth <= 768) return;
    
    // Get all project nodes
    const projectNodes = document.querySelectorAll('.project-node');
    
    projectNodes.forEach((node) => {
      // Get the project ID and gradient ID
      const projectId = node.getAttribute('data-project');
      const gradientId = node.getAttribute('data-gradient-id');
      const gradient = document.getElementById(gradientId);
      
      if (!node || !gradient) {
        console.warn(`Could not find node or gradient for project ${projectId}`);
        return;
      }
      
      // Magnetic effect parameters
      const attractStrength = 0.2; // Adjust for stronger/weaker effect
      const nodeRadius = node.offsetWidth / 2;
      const magneticRadius = nodeRadius * 2.5; // Area of magnetic influence
      
      // Tracking variables
      let isMouseOver = false;
      
      // Handler function for mouse movement
      const handleMouseMove = (e) => {
        // Skip if node physics is dragging this node
        if (nodePhysics.dragging && nodePhysics.dragging.element === node) return;
        
        // Get node position
        const rect = node.getBoundingClientRect();
        const nodeX = rect.left + nodeRadius;
        const nodeY = rect.top + nodeRadius;
        
        // Calculate distance from mouse to center of node
        const distX = e.clientX - nodeX;
        const distY = e.clientY - nodeY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < magneticRadius) {
          isMouseOver = true;
          
          // Update gradient position to follow mouse
          if (gradient) {
            // Adjust gradient rotation to follow mouse
            const angle = Math.atan2(distY, distX) * (180 / Math.PI);
            gradient.setAttribute('gradientTransform', `rotate(${angle}, 50, 50)`);
          }
          
          // Add hover class for CSS effects
          node.classList.add('magnetic-hover');
        } else if (isMouseOver) {
          // Reset hover state when mouse leaves magnetic field
          node.classList.remove('magnetic-hover');
          isMouseOver = false;
          
          // Reset gradient
          if (gradient) {
            gradient.setAttribute('gradientTransform', 'rotate(0, 50, 50)');
          }
        }
      };
      
      // Add event listener to document
      document.addEventListener('mousemove', handleMouseMove);
      
      // Reset state when mouse leaves window
      window.addEventListener('mouseleave', () => {
        if (isMouseOver) {
          node.classList.remove('magnetic-hover');
          isMouseOver = false;
          
          // Reset gradient
          if (gradient) {
            gradient.setAttribute('gradientTransform', 'rotate(0, 50, 50)');
          }
        }
      });
    });
  }
  
  // Initialize text rings with random offsets
  function initTextRings() {
    document.querySelectorAll('.text-ring').forEach((ring) => {
      // Random start offset
      const randomOffset = Math.random() * 100;
      const textPath = ring.querySelector('textPath');
      if (textPath) {
        textPath.setAttribute('startOffset', `${randomOffset}%`);
      }
      
      // Random animation duration between 40s and 70s
      const duration = 40 + Math.random() * 30;
      ring.style.animationDuration = `${duration}s`;
      
      // Random direction (clockwise or counter-clockwise)
      if (Math.random() > 0.5) {
        ring.style.animationDirection = 'reverse';
      }
    });
  }
  
  // Render all projects to the DOM with better cleanup
  async function renderProjects() {
    // Clear existing project nodes and details
    const existingNodes = document.querySelectorAll('.project-node');
    const existingDetails = document.querySelectorAll('.project-detail');
    
    existingNodes.forEach(node => node.remove());
    existingDetails.forEach(detail => detail.remove());
    
    // Load projects
    let projects = await loadProjects();
    
    // Validate projects data
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.error('No projects data found or invalid data format');
      return;
    }
    
    console.log(`Loaded ${projects.length} projects`);
    
    // Calculate positions for projects that don't have them specified
    projects = calculateProjectPositions(projects);
    
    // Create and append project nodes and details
    projects.forEach((project, index) => {
      try {
        // Validate project has minimum required fields
        if (!project.id || !project.title) {
          console.warn(`Skipping project at index ${index} due to missing required fields`);
          return;
        }
        
        const node = createProjectNode(project);
        const detail = createProjectDetail(project);
        
        projectContainer.appendChild(node);
        projectContainer.appendChild(detail);
        
        console.log(`Added project ${project.id}: ${project.title}`);
      } catch (error) {
        console.error(`Error adding project ${project.id || index}:`, error);
      }
    });
    
    // Initialize physics system
    nodePhysics.reset();
    document.querySelectorAll('.project-node').forEach(node => {
      nodePhysics.addNode(node);
    });
    
    // Initialize project detail interactions
    initProjectDetailInteractions(projectContainer);
    
    // Initialize interactions with a slight delay to ensure DOM is ready
    setTimeout(() => {
      initTextRings();
      initMagneticEffect();
    }, 100);
  }
  
  // IMPROVED: Animate project canvas with better frame coordination
  function animate(timestamp) {
    // Only run this animation loop if canvas exists
    if (!canvas) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update(mouseX, mouseY);
      particle.draw();
    });
    
    // Connect particles with lines
    connectParticles();
    
    // Connect particles to project nodes
    connectToProjects();
    
    // Continue animation loop
    requestAnimationFrame(animate);
  }
  
  // Initialize everything
  async function initialize() {
    try {
      // First, render projects
      await renderProjects();
      console.log('Projects rendering completed');
      
      // Then start both animation systems
      // 1. Start the background particle animation
      animate();
      console.log('Background animation started');
      
      // 2. Initialize physics system for node movement
      nodePhysics.initialize();
      console.log('Physics system initialized');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  
  // Start initialization
  initialize().catch(error => {
    console.error('Error initializing project universe:', error);
  });
  
  // Handle window resize to ensure everything stays responsive
  window.addEventListener('resize', () => {
    resizeCanvas();
    
    // Re-initialize project interactions after resize
    setTimeout(() => {
      // Update the canvas rect in physics system
      nodePhysics.canvasRect = canvas.getBoundingClientRect();
      
      // Re-initialize any effects that depend on screen size
      initMagneticEffect();
    }, 300);
  });
  
  // Clean up when leaving the page/section
  window.addEventListener('beforeunload', () => {
    nodePhysics.cleanup();
  });
}