// /js/components/experienceTimeline.js
// Dynamic Experience Timeline - Simple CV Download Only
// Fetches from Database API with single resume download button

/**
 * Dynamic Experience Timeline Module
 * Fetches experience data from database API and renders timeline dynamically
 * Preserves all existing CSS animations and visual effects
 * Includes simple CV download button
 */

// Fallback static data (your migrated data) in case API fails
const fallbackExperience = [
  {
    id: 1,
    title: 'Senior Front-End Developer',
    company: 'Tech Innovations Ltd',
    location: 'London',
    position: 'Senior Front-End Developer',
    employment_type: 'full-time',
    start_date_formatted: 'Jan 2023',
    end_date_formatted: 'Present',
    period: 'Jan 2023 - Present',
    is_current: true,
    is_featured: true,
    achievements: [
      'Lead development of modern, responsive web applications',
      'Optimize application performance and user experience',
      'Mentor junior developers and conduct code reviews'
    ],
    technologies: ['JavaScript', 'React', 'Vue.js', 'TypeScript', 'CSS3', 'HTML5', 'Node.js'],
    company_website: 'https://techinnovations.co.uk'
  },
  {
    id: 2,
    title: 'Front-End Developer',
    company: 'WebSolutions UK',
    location: 'London',
    position: 'Front-End Developer',
    employment_type: 'full-time',
    start_date_formatted: 'Mar 2020',
    end_date_formatted: 'Dec 2022',
    period: 'Mar 2020 - Dec 2022',
    is_current: false,
    is_featured: true,
    achievements: [
      'Developed client websites using HTML, CSS, and JavaScript',
      'Implemented responsive designs and cross-browser compatibility',
      'Built interactive user interfaces with React'
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Sass', 'jQuery'],
    company_website: 'https://websolutions.uk'
  },
  {
    id: 3,
    title: 'Web Developer',
    company: 'Digital Agency',
    location: 'Tehran',
    position: 'Web Developer',
    employment_type: 'full-time',
    start_date_formatted: 'Jun 2018',
    end_date_formatted: 'Feb 2020',
    period: 'Jun 2018 - Feb 2020',
    is_current: false,
    is_featured: false,
    achievements: [
      'Built and maintained websites for various clients',
      'Implemented responsive designs using modern CSS techniques',
      'Developed interactive features using JavaScript'
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'WordPress'],
    company_website: null
  },
  {
    id: 4,
    title: 'BSc in Software Engineering',
    company: 'University of Tehran',
    location: 'Tehran',
    position: 'Student',
    employment_type: 'full-time',
    start_date_formatted: 'Sep 2014',
    end_date_formatted: 'Jun 2018',
    period: 'Sep 2014 - Jun 2018',
    is_current: false,
    is_featured: false,
    achievements: [
      'Graduated with First Class Honours',
      'Comprehensive study of software development principles',
      'Strong foundation in algorithms and data structures'
    ],
    technologies: ['Java', 'C++', 'Python', 'SQL', 'Data Structures', 'Algorithms'],
    company_website: 'https://ut.ac.ir'
  }
];

let experienceData = [];
let isInitialized = false;

/**
 * Fetch experience data from API
 * @returns {Promise<Array>} Experience data array
 */
async function fetchExperienceData() {
  try {
    console.log('Fetching experience data from API...');
    const response = await fetch('/api/experience.php');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.timeline) {
      console.log('Successfully fetched experience data from database');
      return result.data.timeline;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.warn('Failed to fetch experience data from API:', error);
    console.log('Using fallback experience data');
    return fallbackExperience;
  }
}

/**
 * Extract year from date string for timeline markers
 * @param {string} dateStr - Date string (e.g., "Jan 2023")
 * @returns {string} Year string
 */
function extractYear(dateStr) {
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : '';
}

/**
 * Create timeline item HTML
 * @param {Object} experience - Experience data object
 * @returns {string} HTML string for timeline item
 */
function createTimelineItemHTML(experience) {
  const year = extractYear(experience.start_date_formatted);
  const achievements = experience.achievements || [];
  const technologies = experience.technologies || [];
  
  // Create achievements list
  const achievementsHTML = achievements.length > 0 
    ? `<ul class="timeline-details">
         ${achievements.map(achievement => `<li>${achievement}</li>`).join('')}
       </ul>`
    : '';
  
  // Create technologies display
  const technologiesHTML = technologies.length > 0 
    ? `<div class="timeline-technologies">
         <div class="tech-tags">
           ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
         </div>
       </div>`
    : '';
  
  // Create company link if website exists
  const companyHTML = experience.company_website 
    ? `<a href="${experience.company_website}" target="_blank" rel="noopener noreferrer" class="company-link">
         ${experience.company}${experience.location ? `, ${experience.location}` : ''}
         <i class="fas fa-external-link-alt"></i>
       </a>`
    : `${experience.company}${experience.location ? `, ${experience.location}` : ''}`;
  
  // Add status badges
  const statusBadges = [];
  if (experience.is_current) {
    statusBadges.push('<span class="status-badge current">Current</span>');
  }
  if (experience.is_featured) {
    statusBadges.push('<span class="status-badge featured">Featured</span>');
  }
  
  const statusHTML = statusBadges.length > 0 
    ? `<div class="status-badges">${statusBadges.join('')}</div>`
    : '';
  
  return `
    <div class="timeline-item" data-year="${year}" data-experience-id="${experience.id}">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${experience.period}</div>
      <div class="timeline-content">
        <div class="timeline-header">
          <h3>${experience.position}</h3>
          ${statusHTML}
        </div>
        <h4 class="company-info">${companyHTML}</h4>
        ${achievementsHTML}
        ${technologiesHTML}
      </div>
    </div>
  `;
}

/**
 * Render the experience timeline
 * @param {Array} experiences - Array of experience objects
 */
function renderTimeline(experiences) {
  const timelineContainer = document.querySelector('#experience .timeline');
  
  if (!timelineContainer) {
    console.warn('Timeline container not found');
    return;
  }
  
  // Clear existing content except timeline line
  const timelineLine = timelineContainer.querySelector('.timeline-line');
  timelineContainer.innerHTML = '';
  
  // Add back timeline line
  if (timelineLine) {
    timelineContainer.appendChild(timelineLine);
  } else {
    // Create timeline line if it doesn't exist
    const line = document.createElement('div');
    line.className = 'timeline-line';
    timelineContainer.appendChild(line);
  }
  
  // Create and append timeline items
  experiences.forEach((experience, index) => {
    const itemHTML = createTimelineItemHTML(experience);
    const itemElement = document.createElement('div');
    itemElement.innerHTML = itemHTML;
    timelineContainer.appendChild(itemElement.firstElementChild);
    
    // Add entrance animation with delay
    setTimeout(() => {
      const item = timelineContainer.children[index + 1]; // +1 because of timeline-line
      if (item) {
        item.classList.add('visible');
      }
    }, index * 150); // Stagger animations
  });
  
  // Add simple resume download button after timeline items
  addResumeDownloadButton(timelineContainer.parentElement);
  
  console.log(`Rendered ${experiences.length} experience items`);
}

/**
 * Add simple resume download button to timeline
 * @param {HTMLElement} container - Timeline container parent
 */
function addResumeDownloadButton(container) {
  // Remove existing button if present
  const existingSection = container.querySelector('.resume-download');
  if (existingSection) {
    existingSection.remove();
  }
  
  // Create simple resume download section
  const resumeSection = document.createElement('div');
  resumeSection.className = 'resume-download';
  resumeSection.innerHTML = `
    <a href="assets/documents/hadi-vahidi-resume.pdf" class="btn btn-outline" download>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Download CV
    </a>
  `;
  
  // Add to the timeline container parent
  container.appendChild(resumeSection);
}

/**
 * Add dynamic styles for timeline and simple resume button
 */
function addDynamicStyles() {
  if (document.getElementById('dynamic-experience-styles')) {
    return; // Styles already added
  }
  
  const style = document.createElement('style');
  style.id = 'dynamic-experience-styles';
  style.textContent = `
    /* Enhanced timeline styles for dynamic content */
    .timeline-item {
      opacity: 0;
      transform: translateX(-30px);
      transition: all 0.6s ease;
    }
    
    .timeline-item.visible {
      opacity: 1;
      transform: translateX(0);
    }
    
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    
    .status-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .status-badge.current {
      background-color: rgba(34, 197, 94, 0.1);
      color: rgb(34, 197, 94);
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    
    .status-badge.featured {
      background-color: rgba(251, 191, 36, 0.1);
      color: rgb(251, 191, 36);
      border: 1px solid rgba(251, 191, 36, 0.2);
    }
    
    .company-link {
      color: var(--color-accent);
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .company-link:hover {
      color: var(--color-accent-hover);
      text-decoration: underline;
    }
    
    .company-link i {
      font-size: 0.8em;
      margin-left: 0.5rem;
      opacity: 0.7;
    }
    
    .timeline-technologies {
      margin-top: 1rem;
    }
    
    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tech-tag {
      padding: 0.25rem 0.75rem;
      background-color: rgba(var(--color-accent-rgb), 0.1);
      color: var(--color-accent);
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid rgba(var(--color-accent-rgb), 0.2);
      transition: all 0.3s ease;
    }
    
    .tech-tag:hover {
      background-color: rgba(var(--color-accent-rgb), 0.2);
      transform: translateY(-1px);
    }
    
    /* Simple resume download button styles */
    .resume-download {
      margin-top: 2rem;
      text-align: center;
      padding: 1.5rem 0;
    }
    
    .resume-download .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid var(--color-accent);
      background-color: transparent;
      color: var(--color-accent);
      min-width: 160px;
      justify-content: center;
    }
    
    .resume-download .btn:hover {
      background-color: var(--color-accent);
      color: var(--color-bg);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.3);
    }
    
    .resume-download svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    
    /* Dark mode adjustments */
    [data-theme="dark"] .status-badge.current {
      background-color: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.3);
    }
    
    [data-theme="dark"] .status-badge.featured {
      background-color: rgba(251, 191, 36, 0.2);
      border-color: rgba(251, 191, 36, 0.3);
    }
    
    [data-theme="dark"] .tech-tag {
      background-color: rgba(var(--color-accent-rgb), 0.15);
      border-color: rgba(var(--color-accent-rgb), 0.25);
    }
    
    [data-theme="dark"] .resume-download .btn {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
    
    [data-theme="dark"] .resume-download .btn:hover {
      background-color: var(--color-accent);
      color: var(--color-bg-dark, #1a1a1a);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .timeline-header {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .status-badges {
        justify-content: flex-start;
      }
      
      .tech-tags {
        gap: 0.25rem;
      }
      
      .tech-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
      }
      
      .resume-download .btn {
        width: 100%;
        max-width: 250px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Initialize experience timeline with loading state
 */
async function initExperienceTimeline() {
  if (isInitialized) {
    console.log('Experience timeline already initialized');
    return;
  }
  
  console.log('Initializing dynamic experience timeline...');
  
  // Check if experience section exists
  const experienceSection = document.querySelector('#experience');
  if (!experienceSection) {
    console.warn('Experience section not found');
    return;
  }
  
  // Add dynamic styles
  addDynamicStyles();
  
  // Show loading state
  const timelineContainer = experienceSection.querySelector('.timeline');
  if (timelineContainer) {
    timelineContainer.innerHTML = `
      <div class="timeline-line"></div>
      <div class="timeline-loading">
        <div class="loading-spinner"></div>
        <p>Loading experience...</p>
      </div>
    `;
  }
  
  try {
    // Fetch experience data
    experienceData = await fetchExperienceData();
    
    // Add small delay for smooth transition
    setTimeout(() => {
      renderTimeline(experienceData);
      isInitialized = true;
      console.log('Experience timeline initialized successfully');
    }, 300);
    
  } catch (error) {
    console.error('Failed to initialize experience timeline:', error);
    
    // Show error state but still render fallback data
    setTimeout(() => {
      renderTimeline(fallbackExperience);
      isInitialized = true;
    }, 300);
  }
}

/**
 * Refresh timeline data (for manual refresh)
 */
async function refreshExperienceTimeline() {
  isInitialized = false;
  await initExperienceTimeline();
}

/**
 * Get current experience data
 * @returns {Array} Current experience data
 */
function getExperienceData() {
  return experienceData;
}

// Export functions
export { 
  initExperienceTimeline, 
  refreshExperienceTimeline, 
  getExperienceData 
};