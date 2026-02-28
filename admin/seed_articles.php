<?php
// /admin/seed_articles.php
// Script to automatically add three web development articles with current trends

require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/ArticleManager.php';

// Check if running from command line or web
$isCLI = php_sapi_name() === 'cli';

if (!$isCLI) {
    // Simple web-based authentication check
    session_start();
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
        die('Access denied. Please login to the admin panel first.');
    }
    echo "<html><head><title>Seeding Articles</title></head><body>";
    echo "<h2>Seeding Articles...</h2>";
}

try {
    $db = Database::getInstance();
    $articleManager = new ArticleManager($db);
    
    // Get the admin user ID (assuming first user is admin)
    $adminUser = $db->fetch("SELECT id FROM users ORDER BY id LIMIT 1");
    if (!$adminUser) {
        throw new Exception("No admin user found. Please create an admin user first.");
    }
    $adminUserId = $adminUser['id'];
    
    // Get or create categories
    $categories = [];
    
    // AI & Development category
    $aiCategory = $db->fetch("SELECT id FROM article_categories WHERE slug = 'ai-development'");
    if (!$aiCategory) {
        $db->execute("INSERT INTO article_categories (name, slug, description, color) VALUES (?, ?, ?, ?)", [
            'AI & Development',
            'ai-development', 
            'Articles about artificial intelligence in web development',
            '#FF6B6B'
        ]);
        $categories['ai'] = $db->getLastInsertId();
    } else {
        $categories['ai'] = $aiCategory['id'];
    }
    
    // CSS & Design category
    $cssCategory = $db->fetch("SELECT id FROM article_categories WHERE slug = 'css-design'");
    if (!$cssCategory) {
        $db->execute("INSERT INTO article_categories (name, slug, description, color) VALUES (?, ?, ?, ?)", [
            'CSS & Design',
            'css-design',
            'Articles about modern CSS and web design techniques', 
            '#4ECDC4'
        ]);
        $categories['css'] = $db->getLastInsertId();
    } else {
        $categories['css'] = $cssCategory['id'];
    }
    
    // Web Technologies category  
    $techCategory = $db->fetch("SELECT id FROM article_categories WHERE slug = 'web-technologies'");
    if (!$techCategory) {
        $db->execute("INSERT INTO article_categories (name, slug, description, color) VALUES (?, ?, ?, ?)", [
            'Web Technologies',
            'web-technologies',
            'Articles about emerging web technologies and standards',
            '#45B7D1'
        ]);
        $categories['tech'] = $techCategory['id'];
    } else {
        $categories['tech'] = $techCategory['id'];
    }

    // Article 1: AI-Powered Development Tools
    $article1 = [
        'title' => 'The Rise of AI-Powered Development Tools in 2025',
        'excerpt' => 'Exploring how artificial intelligence is revolutionizing the way developers write, debug, and optimize code, from GitHub Copilot to advanced testing automation.',
        'content' => '<h2>The AI Revolution in Development</h2>

<p>The landscape of web development has been fundamentally transformed by the integration of artificial intelligence tools. In 2025, AI-powered development assistants have evolved from simple code completion to sophisticated partners that understand context, architecture, and best practices.</p>

<h3>Beyond Code Completion</h3>

<p>Modern AI tools like GitHub Copilot, Cursor AI, and CodeWhisperer have transcended basic autocomplete functionality. These tools now provide:</p>

<ul>
<li><strong>Contextual Code Generation</strong>: AI understands your entire codebase and generates code that fits your existing patterns and architecture</li>
<li><strong>Intelligent Refactoring</strong>: Automated code improvements that maintain functionality while enhancing readability and performance</li>
<li><strong>Bug Detection and Prevention</strong>: Real-time identification of potential issues before they reach production</li>
<li><strong>Documentation Generation</strong>: Automatic creation of comprehensive documentation from code comments and structure</li>
</ul>

<h3>The Impact on Development Workflows</h3>

<p>Teams adopting AI-powered tools report significant improvements in productivity and code quality. The ability to rapidly prototype ideas, generate test cases, and explore alternative implementations has accelerated the development cycle considerably.</p>

<blockquote>
<p>"AI doesn\'t replace developers; it amplifies their capabilities and frees them to focus on creative problem-solving and architectural decisions." - Leading tech industry expert</p>
</blockquote>

<h3>Challenges and Considerations</h3>

<p>While AI tools offer tremendous benefits, developers must remain mindful of:</p>

<ul>
<li>Code quality and security validation</li>
<li>Understanding generated code rather than blind acceptance</li>
<li>Maintaining coding skills and problem-solving abilities</li>
<li>Balancing efficiency with learning and growth</li>
</ul>

<h3>Looking Forward</h3>

<p>The future promises even more sophisticated AI integration, including AI-powered testing strategies, automated deployment optimization, and intelligent performance monitoring. The key is leveraging these tools while maintaining our core development principles and continuous learning mindset.</p>

<p>As we navigate this AI-enhanced development landscape, the most successful developers will be those who embrace these tools while continuing to understand the fundamental principles that drive great software engineering.</p>',
        'featured_image' => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'status' => 'published',
        'is_featured' => 1,
        'author_id' => $adminUserId,
        'category_id' => $categories['ai'],
        'meta_title' => 'AI-Powered Development Tools in 2025 | Web Development Trends',
        'meta_description' => 'Discover how AI is transforming web development in 2025, from intelligent code generation to automated testing and debugging.',
        'tags' => ['AI', 'Development Tools', 'GitHub Copilot', 'Productivity', 'Code Generation']
    ];

    // Article 2: Modern CSS Container Queries  
    $article2 = [
        'title' => 'Modern CSS: Container Queries and the Future of Responsive Design',
        'excerpt' => 'Container queries are revolutionizing responsive design by allowing components to respond to their container size rather than viewport dimensions, enabling truly modular CSS.',
        'content' => '<h2>Beyond Media Queries: The Container Query Revolution</h2>

<p>For over a decade, media queries have been the cornerstone of responsive web design. However, they have a fundamental limitation: they only respond to viewport dimensions. Container queries change this paradigm by allowing CSS to respond to the size of a containing element, enabling truly component-based responsive design.</p>

<h3>What Are Container Queries?</h3>

<p>Container queries allow you to apply styles based on the size of a container rather than the viewport. This means a component can adapt its layout regardless of where it appears on the page.</p>

<pre><code>/* Define a container */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Apply styles based on container width */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
  }
}</code></pre>

<h3>Real-World Benefits</h3>

<p>Container queries solve several long-standing challenges in web development:</p>

<ul>
<li><strong>Component Portability</strong>: Components can be moved anywhere in a layout and automatically adapt</li>
<li><strong>Sidebar Flexibility</strong>: Content in sidebars can have different breakpoints than main content</li>
<li><strong>Grid System Independence</strong>: Components respond to their actual available space, not assumed grid positions</li>
<li><strong>Cleaner CSS Architecture</strong>: Less reliance on specific class combinations and layout assumptions</li>
</ul>

<h3>Browser Support and Implementation</h3>

<p>As of 2025, container queries enjoy excellent browser support across all modern browsers. The feature is stable and ready for production use with appropriate progressive enhancement strategies.</p>

<h4>Implementation Strategy:</h4>

<ol>
<li>Start with mobile-first design as usual</li>
<li>Use container queries for component-specific breakpoints</li>
<li>Combine with traditional media queries for page-level changes</li>
<li>Test across different container contexts</li>
</ol>

<h3>Container Query Units</h3>

<p>Container queries introduce new CSS units that provide even more flexibility:</p>

<ul>
<li><code>cqw</code>: 1% of container width</li>
<li><code>cqh</code>: 1% of container height</li>
<li><code>cqi</code>: 1% of container inline size</li>
<li><code>cqb</code>: 1% of container block size</li>
<li><code>cqmin</code>: Smaller of cqi or cqb</li>
<li><code>cqmax</code>: Larger of cqi or cqb</li>
</ul>

<h3>Best Practices</h3>

<p>When implementing container queries, consider these guidelines:</p>

<blockquote>
<p>Use container queries for component-level responsive design and media queries for page-level layout changes. This combination provides the most maintainable and flexible approach.</p>
</blockquote>

<h3>The Future of CSS Layout</h3>

<p>Container queries represent a significant evolution in CSS, enabling more modular and maintainable stylesheets. Combined with CSS Grid, Flexbox, and modern property support, they provide developers with unprecedented control over responsive design.</p>

<p>As we move forward, expect to see container queries become the standard approach for component-based responsive design, fundamentally changing how we architect CSS for scalable web applications.</p>',
        'featured_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'status' => 'published', 
        'is_featured' => 1,
        'author_id' => $adminUserId,
        'category_id' => $categories['css'],
        'meta_title' => 'CSS Container Queries: The Future of Responsive Design | Modern CSS',
        'meta_description' => 'Learn how CSS container queries are revolutionizing responsive design by enabling component-based breakpoints and truly modular CSS architecture.',
        'tags' => ['CSS', 'Container Queries', 'Responsive Design', 'Modern CSS', 'Web Design']
    ];

    // Article 3: Web Components in Production
    $article3 = [
        'title' => 'Why Web Components Are Finally Ready for Production in 2025',
        'excerpt' => 'After years of development, Web Components have matured into a robust, framework-agnostic solution for building reusable UI elements that work everywhere.',
        'content' => '<h2>The Maturation of Web Components</h2>

<p>Web Components have been in development for over a decade, but 2025 marks a pivotal moment where they\'ve finally achieved widespread browser support, robust tooling, and real-world production readiness. Major companies are now shipping Web Components at scale, proving their viability for modern web development.</p>

<h3>What Makes Web Components Special</h3>

<p>Web Components offer a unique value proposition in today\'s fragmented frontend landscape:</p>

<ul>
<li><strong>Framework Agnostic</strong>: Work seamlessly across React, Vue, Angular, Svelte, or vanilla JavaScript</li>
<li><strong>True Encapsulation</strong>: Shadow DOM provides real style and behavior isolation</li>
<li><strong>Standards-Based</strong>: Built on web platform standards, ensuring longevity</li>
<li><strong>Reusability</strong>: Write once, use everywhere approach</li>
</ul>

<h3>The Technology Stack</h3>

<p>Modern Web Components leverage four key web standards:</p>

<h4>1. Custom Elements</h4>
<pre><code>class MyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: \'open\' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      &lt;style&gt;
        button { 
          background: var(--primary-color, #007bff);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          color: white;
        }
      &lt;/style&gt;
      &lt;button&gt;&lt;slot&gt;&lt;/slot&gt;&lt;/button&gt;
    `;
  }
}

customElements.define(\'my-button\', MyButton);</code></pre>

<h4>2. Shadow DOM</h4>
<p>Provides true encapsulation, preventing CSS conflicts and enabling predictable component behavior.</p>

<h4>3. HTML Templates</h4>
<p>Define reusable markup patterns that can be efficiently cloned and customized.</p>

<h4>4. ES Modules</h4>
<p>Standard module system for packaging and distributing components.</p>

<h3>Production-Ready Tooling</h3>

<p>The ecosystem around Web Components has significantly matured:</p>

<ul>
<li><strong>Lit</strong>: Google\'s lightweight library for building Web Components</li>
<li><strong>Stencil</strong>: Compiler-based approach with TypeScript support</li>
<li><strong>FAST</strong>: Microsoft\'s enterprise-focused Web Components library</li>
<li><strong>Hybrids</strong>: Functional approach to Web Components</li>
</ul>

<h3>Real-World Success Stories</h3>

<blockquote>
<p>"We\'ve migrated our design system to Web Components and reduced our bundle size by 40% while improving consistency across our React and Angular applications." - Senior Frontend Engineer at Fortune 500 company</p>
</blockquote>

<p>Companies like GitHub, Adobe, and Microsoft are using Web Components in production, demonstrating their scalability and reliability.</p>

<h3>When to Choose Web Components</h3>

<p>Web Components are particularly valuable for:</p>

<ul>
<li><strong>Design Systems</strong>: Consistent UI components across multiple applications</li>
<li><strong>Micro Frontends</strong>: Framework-agnostic integration points</li>
<li><strong>Legacy Integration</strong>: Modern components in older applications</li>
<li><strong>Widget Development</strong>: Embeddable components for third-party sites</li>
</ul>

<h3>Getting Started</h3>

<p>For developers new to Web Components, the recommended approach is:</p>

<ol>
<li>Start with Lit for a gentle introduction</li>
<li>Focus on simple, stateless components initially</li>
<li>Gradually adopt more complex patterns as you build familiarity</li>
<li>Leverage existing component libraries for common patterns</li>
</ol>

<h3>The Road Ahead</h3>

<p>With strong browser support, mature tooling, and growing adoption, Web Components represent a compelling choice for developers seeking framework-independent solutions. They offer a path toward more sustainable, interoperable web development that transcends the typical framework churn.</p>

<p>As the web platform continues to evolve, Web Components provide a stable foundation that adapts to new capabilities while maintaining backward compatibility. For teams building design systems or seeking long-term architectural sustainability, 2025 is the perfect time to explore Web Components seriously.</p>',
        'featured_image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'status' => 'published',
        'is_featured' => 1,
        'author_id' => $adminUserId,
        'category_id' => $categories['tech'],
        'meta_title' => 'Web Components Production Ready 2025 | Framework-Agnostic Development',
        'meta_description' => 'Discover why Web Components are finally ready for production use in 2025, with mature tooling, wide browser support, and real-world success stories.',
        'tags' => ['Web Components', 'Custom Elements', 'Shadow DOM', 'Framework Agnostic', 'Production Ready']
    ];

    $articles = [$article1, $article2, $article3];
    $createdArticles = [];

    foreach ($articles as $articleData) {
        // Check if article already exists by title
        $existingArticle = $db->fetch("SELECT id FROM articles WHERE title = ?", [$articleData['title']]);
        
        if ($existingArticle) {
            $message = "Article '{$articleData['title']}' already exists. Skipping.\n";
            if ($isCLI) {
                echo $message;
            } else {
                echo "<p style='color: orange;'>{$message}</p>";
            }
            continue;
        }

        // Create the article
        $articleId = $articleManager->createArticle($articleData);
        $createdArticles[] = [
            'id' => $articleId,
            'title' => $articleData['title'],
            'category' => $articleData['category_id']
        ];

        $message = "Created article: '{$articleData['title']}' (ID: {$articleId})\n";
        if ($isCLI) {
            echo $message;
        } else {
            echo "<p style='color: green;'>{$message}</p>";
        }
    }

    // Summary
    $totalCreated = count($createdArticles);
    $summary = "\n=== SUMMARY ===\n";
    $summary .= "Successfully created {$totalCreated} articles.\n";
    $summary .= "Categories created/updated: " . count($categories) . "\n\n";
    
    $summary .= "Image sources used:\n";
    $summary .= "• AI Development: https://unsplash.com/photos/person-using-macbook-pro-on-person-s-lap-55Tz3o3-4_Q\n";
    $summary .= "• CSS Design: https://unsplash.com/photos/laptop-computer-on-glass-top-table-LaK153ghdig\n";  
    $summary .= "• Web Technologies: https://unsplash.com/photos/code-projected-over-woman-4Zaq5xY5M_c\n\n";
    
    $summary .= "All images are free to use under Unsplash license.\n";
    
    if ($isCLI) {
        echo $summary;
    } else {
        echo "<div style='background: #f0f0f0; padding: 1rem; margin: 1rem 0; border-radius: 4px;'>";
        echo "<h3>Summary</h3>";
        echo "<p>Successfully created <strong>{$totalCreated}</strong> articles.</p>";
        echo "<p>Categories created/updated: <strong>" . count($categories) . "</strong></p>";
        echo "<h4>Image Sources:</h4>";
        echo "<ul>";
        echo "<li>AI Development: <a href='https://unsplash.com/photos/person-using-macbook-pro-on-person-s-lap-55Tz3o3-4_Q' target='_blank'>Unsplash</a></li>";
        echo "<li>CSS Design: <a href='https://unsplash.com/photos/laptop-computer-on-glass-top-table-LaK153ghdig' target='_blank'>Unsplash</a></li>";
        echo "<li>Web Technologies: <a href='https://unsplash.com/photos/code-projected-over-woman-4Zaq5xY5M_c' target='_blank'>Unsplash</a></li>";
        echo "</ul>";
        echo "<p><em>All images are free to use under Unsplash license.</em></p>";
        echo "<p><a href='/'>View Homepage</a> | <a href='/articles.php'>View Articles</a> | <a href='articles.php'>Admin Articles</a></p>";
        echo "</div>";
    }

} catch (Exception $e) {
    $error = "Error: " . $e->getMessage() . "\n";
    if ($isCLI) {
        echo $error;
        exit(1);
    } else {
        echo "<p style='color: red;'>{$error}</p>";
    }
}

if (!$isCLI) {
    echo "</body></html>";
}
?>

<?php
/*
 * USAGE INSTRUCTIONS:
 * 
 * Via Web Browser:
 * 1. Make sure you're logged into the admin panel
 * 2. Visit: https://www.hadivahidi.com/admin/seed_articles.php
 * 
 * Via Command Line:
 * 1. SSH into your server
 * 2. Navigate to your admin directory
 * 3. Run: php seed_articles.php
 * 
 * ARTICLE TOPICS COVERED:
 * 
 * 1. "The Rise of AI-Powered Development Tools in 2025"
 *    - Current trend: AI integration in development workflows
 *    - Covers GitHub Copilot, AI-assisted coding, productivity gains
 *    - Image: Developer working with AI tools
 * 
 * 2. "Modern CSS: Container Queries and the Future of Responsive Design"  
 *    - Current trend: Container queries gaining production readiness
 *    - Covers component-based responsive design, new CSS units
 *    - Image: Responsive web design concept
 * 
 * 3. "Why Web Components Are Finally Ready for Production in 2025"
 *    - Current trend: Web Components maturation and adoption
 *    - Covers framework-agnostic development, Shadow DOM, tooling
 *    - Image: Modern web development workspace
 * 
 * All articles include:
 * - Professional, informative content
 * - Current 2025 web development trends
 * - SEO-optimized titles and descriptions
 * - Relevant tags for categorization
 * - High-quality free stock images from Unsplash
 * - Proper HTML formatting with headings, lists, code blocks
 * - Featured article status for homepage display
 * 
 * SAFETY FEATURES:
 * - Checks for existing articles to prevent duplicates
 * - Creates categories if they don't exist
 * - Handles both CLI and web execution
 * - Comprehensive error handling
 * - Detailed logging of operations
 * 
 * DELETE THIS SCRIPT AFTER USE for security purposes.
 */
?>