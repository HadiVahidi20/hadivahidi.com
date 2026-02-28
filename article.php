<?php
// /article.php
// Individual article page - displays single article with full content

require_once __DIR__ . '/admin/includes/Database.php';
require_once __DIR__ . '/admin/includes/ArticleManager.php';
require_once __DIR__ . '/admin/includes/ProfileManager.php';

$db = Database::getInstance();
$articleManager = new ArticleManager($db);
$profileManager = new ProfileManager($db);

// Get article slug from URL
$slug = $_GET['slug'] ?? '';

if (!$slug) {
    header('HTTP/1.0 404 Not Found');
    header('Location: articles.php');
    exit;
}

// Get article data
$article = $articleManager->getArticleBySlug($slug);

if (!$article) {
    header('HTTP/1.0 404 Not Found');
    include '404.php'; // You can create a 404 page later
    exit;
}

// Get profile data for author info
$profile = $profileManager->getProfile();

// Get related articles (same category, excluding current)
$relatedArticles = [];
if ($article['category_id']) {
    $relatedArticles = $articleManager->getArticles([
        'category_id' => $article['category_id'],
        'per_page' => 3
    ]);
    // Remove current article from related
    $relatedArticles = array_filter($relatedArticles, fn($a) => $a['id'] != $article['id']);
    $relatedArticles = array_slice($relatedArticles, 0, 3);
}

// SEO and Meta Data
$pageTitle = $article['meta_title'] ?: $article['title'];
$metaDescription = $article['meta_description'] ?: $article['excerpt'] ?: createExcerpt($article['content'], 160);
$canonicalUrl = "https://www.hadivahidi.com/article.php?slug=" . urlencode($slug);

// Helper functions
function formatArticleDate($date) {
    return date('F j, Y', strtotime($date));
}

function createExcerpt($content, $length = 160) {
    $text = strip_tags($content);
    return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
}

function estimateReadingTime($content) {
    $wordCount = str_word_count(strip_tags($content));
    $readingTime = ceil($wordCount / 200);
    return max(1, $readingTime);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> | <?php echo htmlspecialchars($profile['first_name'] ?? 'Hadi'); ?> <?php echo htmlspecialchars($profile['last_name'] ?? 'Vahidi'); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta name="keywords" content="<?php echo htmlspecialchars($profile['meta_keywords'] ?? ''); ?>">
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:title" content="<?php echo htmlspecialchars($pageTitle); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <?php if ($article['featured_image']): ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($article['featured_image']); ?>">
    <?php endif; ?>
    <meta property="article:published_time" content="<?php echo date('c', strtotime($article['published_at'])); ?>">
    <meta property="article:modified_time" content="<?php echo date('c', strtotime($article['updated_at'])); ?>">
    <meta property="article:author" content="<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>">
    <?php if ($article['category_name']): ?>
    <meta property="article:section" content="<?php echo htmlspecialchars($article['category_name']); ?>">
    <?php endif; ?>
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="twitter:title" content="<?php echo htmlspecialchars($pageTitle); ?>">
    <meta property="twitter:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <?php if ($article['featured_image']): ?>
    <meta property="twitter:image" content="<?php echo htmlspecialchars($article['featured_image']); ?>">
    <?php endif; ?>
    
    <!-- Favicon -->
    <link rel="icon" href="assets/images/favicon.png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/main.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "<?php echo htmlspecialchars($article['title']); ?>",
        "description": "<?php echo htmlspecialchars($metaDescription); ?>",
        "image": "<?php echo htmlspecialchars($article['featured_image'] ?: ''); ?>",
        "author": {
            "@type": "Person",
            "name": "<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>",
            "url": "https://www.hadivahidi.com"
        },
        "publisher": {
            "@type": "Person",
            "name": "<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>",
            "url": "https://www.hadivahidi.com"
        },
        "datePublished": "<?php echo date('c', strtotime($article['published_at'])); ?>",
        "dateModified": "<?php echo date('c', strtotime($article['updated_at'])); ?>",
        "url": "<?php echo $canonicalUrl; ?>",
        "wordCount": "<?php echo str_word_count(strip_tags($article['content'])); ?>",
        "timeRequired": "PT<?php echo $article['reading_time']; ?>M",
        "articleSection": "<?php echo htmlspecialchars($article['category_name'] ?? ''); ?>",
        "keywords": "<?php echo htmlspecialchars(implode(', ', array_column($article['tags'], 'name'))); ?>"
    }
    </script>
</head>
<body>
    <?php include('templates/components/cursor.html'); ?>
    <?php include('templates/components/theme-toggle.html'); ?>
    <?php include('templates/components/navigation.html'); ?>
    <?php include('templates/components/progress-bar.html'); ?>
    
    <main>
        <!-- Article Hero -->
        <article class="article-hero">
            <div id="particles"></div>
            <div class="container">
                <div class="article-header">
                    <nav class="article-breadcrumb">
                        <a href="/">Home</a>
                        <span class="breadcrumb-separator">/</span>
                        <a href="articles.php">Articles</a>
                        <?php if ($article['category_name']): ?>
                        <span class="breadcrumb-separator">/</span>
                        <a href="articles.php?category=<?php echo $article['category_id']; ?>"><?php echo htmlspecialchars($article['category_name']); ?></a>
                        <?php endif; ?>
                    </nav>
                    
                    <?php if ($article['category_name']): ?>
                    <div class="article-category" style="color: <?php echo $article['category_color']; ?>">
                        <?php echo htmlspecialchars($article['category_name']); ?>
                    </div>
                    <?php endif; ?>
                    
                    <h1 class="article-title"><?php echo htmlspecialchars($article['title']); ?></h1>
                    
                    <?php if ($article['excerpt']): ?>
                    <p class="article-excerpt"><?php echo htmlspecialchars($article['excerpt']); ?></p>
                    <?php endif; ?>
                    
                    <div class="article-meta">
                        <div class="meta-group">
                            <img src="<?php echo htmlspecialchars($profile['profile_image'] ?? 'assets/images/default-avatar.jpg'); ?>" 
                                 alt="<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>" 
                                 class="author-avatar">
                            <div class="author-info">
                                <span class="author-name"><?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?></span>
                                <span class="author-title"><?php echo htmlspecialchars($profile['professional_title'] ?? 'Front-End Developer'); ?></span>
                            </div>
                        </div>
                        
                        <div class="meta-divider"></div>
                        
                        <div class="meta-stats">
                            <span class="published-date">
                                <i class="fas fa-calendar-alt"></i>
                                <?php echo formatArticleDate($article['published_at']); ?>
                            </span>
                            <span class="reading-time">
                                <i class="fas fa-clock"></i>
                                <?php echo $article['reading_time']; ?> min read
                            </span>
                            <span class="view-count">
                                <i class="fas fa-eye"></i>
                                <?php echo number_format($article['view_count']); ?> views
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <!-- Featured Image -->
        <?php if ($article['featured_image']): ?>
        <section class="article-featured-image">
            <div class="container">
                <img src="<?php echo htmlspecialchars($article['featured_image']); ?>" 
                     alt="<?php echo htmlspecialchars($article['title']); ?>" 
                     class="featured-image">
            </div>
        </section>
        <?php endif; ?>

        <!-- Article Content -->
        <section class="article-content-section">
            <div class="container">
                <div class="article-layout">
                    <!-- Main Content -->
                    <div class="article-main">
                        <div class="article-content">
                            <?php echo $article['content']; ?>
                        </div>
                        
                        <!-- Tags -->
                        <?php if (!empty($article['tags'])): ?>
                        <div class="article-tags">
                            <h4>Tags:</h4>
                            <div class="tags-list">
                                <?php foreach ($article['tags'] as $tag): ?>
                                <a href="articles.php?search=<?php echo urlencode($tag['name']); ?>" 
                                   class="article-tag" style="color: <?php echo $tag['color']; ?>">
                                    #<?php echo htmlspecialchars($tag['name']); ?>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <!-- Share Buttons -->
                        <div class="article-share">
                            <h4>Share this article:</h4>
                            <div class="share-buttons">
                                <a href="https://twitter.com/intent/tweet?text=<?php echo urlencode($article['title']); ?>&url=<?php echo urlencode($canonicalUrl); ?>" 
                                   target="_blank" rel="noopener" class="share-button twitter">
                                    <i class="fab fa-twitter"></i>
                                    Twitter
                                </a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode($canonicalUrl); ?>" 
                                   target="_blank" rel="noopener" class="share-button linkedin">
                                    <i class="fab fa-linkedin-in"></i>
                                    LinkedIn
                                </a>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($canonicalUrl); ?>" 
                                   target="_blank" rel="noopener" class="share-button facebook">
                                    <i class="fab fa-facebook-f"></i>
                                    Facebook
                                </a>
                                <button onclick="copyToClipboard('<?php echo $canonicalUrl; ?>')" class="share-button copy">
                                    <i class="fas fa-link"></i>
                                    Copy Link
                                </button>
                            </div>
                        </div>
                        
                        <!-- Author Bio -->
                        <div class="author-bio">
                            <div class="author-avatar-large">
                                <img src="<?php echo htmlspecialchars($profile['profile_image'] ?? 'assets/images/default-avatar.jpg'); ?>" 
                                     alt="<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>">
                            </div>
                            <div class="author-info">
                                <h4><?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?></h4>
                                <p class="author-title"><?php echo htmlspecialchars($profile['professional_title'] ?? 'Front-End Developer'); ?></p>
                                <p class="author-bio-text"><?php echo htmlspecialchars($profile['bio'] ?? 'Passionate about creating exceptional digital experiences with clean code and intuitive user interfaces.'); ?></p>
                                <div class="author-links">
                                    <?php 
                                    $socialLinks = json_decode($profile['social_links'] ?? '{}', true);
                                    if ($socialLinks): 
                                    ?>
                                    <?php if (!empty($socialLinks['linkedin'])): ?>
                                    <a href="<?php echo htmlspecialchars($socialLinks['linkedin']); ?>" target="_blank" rel="noopener">
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                    <?php endif; ?>
                                    <?php if (!empty($socialLinks['github'])): ?>
                                    <a href="<?php echo htmlspecialchars($socialLinks['github']); ?>" target="_blank" rel="noopener">
                                        <i class="fab fa-github"></i>
                                    </a>
                                    <?php endif; ?>
                                    <?php if (!empty($socialLinks['twitter'])): ?>
                                    <a href="<?php echo htmlspecialchars($socialLinks['twitter']); ?>" target="_blank" rel="noopener">
                                        <i class="fab fa-twitter"></i>
                                    </a>
                                    <?php endif; ?>
                                    <?php endif; ?>
                                    <a href="/">View Portfolio</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="article-sidebar">
                        <!-- Table of Contents (if article is long) -->
                        <div class="sidebar-widget table-of-contents" style="display: none;">
                            <h4>Table of Contents</h4>
                            <nav id="toc-nav"></nav>
                        </div>
                        
                        <!-- Related Articles -->
                        <?php if (!empty($relatedArticles)): ?>
                        <div class="sidebar-widget related-articles">
                            <h4>Related Articles</h4>
                            <div class="related-list">
                                <?php foreach ($relatedArticles as $related): ?>
                                <article class="related-article">
                                    <a href="article.php?slug=<?php echo htmlspecialchars($related['slug']); ?>">
                                        <?php if ($related['featured_image']): ?>
                                        <img src="<?php echo htmlspecialchars($related['featured_image']); ?>" alt="<?php echo htmlspecialchars($related['title']); ?>">
                                        <?php else: ?>
                                        <div class="related-placeholder">
                                            <i class="fas fa-file-alt"></i>
                                        </div>
                                        <?php endif; ?>
                                        <div class="related-content">
                                            <h5><?php echo htmlspecialchars($related['title']); ?></h5>
                                            <span class="related-date"><?php echo formatArticleDate($related['published_at']); ?></span>
                                        </div>
                                    </a>
                                </article>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <!-- Newsletter Signup -->
                        <div class="sidebar-widget newsletter-signup">
                            <h4>Stay Updated</h4>
                            <p>Get notified about new articles and tutorials.</p>
                            <form class="newsletter-form" action="#" method="POST">
                                <input type="email" placeholder="Your email address" required>
                                <button type="submit">Subscribe</button>
                            </form>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <!-- Navigation -->
        <section class="article-navigation">
            <div class="container">
                <div class="nav-links">
                    <a href="articles.php" class="nav-link back-to-articles">
                        <i class="fas fa-arrow-left"></i>
                        Back to Articles
                    </a>
                    <a href="/" class="nav-link back-to-portfolio">
                        Back to Portfolio
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </section>
    </main>

    <?php include('templates/sections/footer.php'); ?>
    
    <!-- Scripts -->
    <script type="module" src="js/main.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
    
    <!-- Article-specific Scripts -->
    <script>
        // Copy to clipboard function
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                // Show toast notification
                const toast = document.createElement('div');
                toast.className = 'copy-toast';
                toast.textContent = 'Link copied to clipboard!';
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            });
        }
        
        // Generate Table of Contents
        function generateTOC() {
            const headings = document.querySelectorAll('.article-content h2, .article-content h3');
            const tocNav = document.getElementById('toc-nav');
            const tocWidget = document.querySelector('.table-of-contents');
            
            if (headings.length >= 3) {
                const tocList = document.createElement('ul');
                
                headings.forEach((heading, index) => {
                    const id = `heading-${index}`;
                    heading.id = id;
                    
                    const tocItem = document.createElement('li');
                    const tocLink = document.createElement('a');
                    tocLink.href = `#${id}`;
                    tocLink.textContent = heading.textContent;
                    tocLink.className = heading.tagName.toLowerCase();
                    
                    tocItem.appendChild(tocLink);
                    tocList.appendChild(tocItem);
                });
                
                tocNav.appendChild(tocList);
                tocWidget.style.display = 'block';
                
                // Smooth scroll for TOC links
                tocNav.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A') {
                        e.preventDefault();
                        const target = document.querySelector(e.target.getAttribute('href'));
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            generateTOC();
        });
    </script>
    
    <!-- Article-specific Styles -->
    <style>
        /* Article Hero */
        .article-hero {
            padding: 6rem 0 4rem;
            position: relative;
            overflow: hidden;
        }
        
        .article-breadcrumb {
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .article-breadcrumb a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .article-breadcrumb a:hover {
            color: var(--primary-color);
        }
        
        .breadcrumb-separator {
            color: var(--text-secondary);
            margin: 0 0.5rem;
        }
        
        .article-category {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }
        
        .article-title {
            font-size: 3rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        
        .article-excerpt {
            font-size: 1.2rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 2rem;
            max-width: 800px;
        }
        
        .article-meta {
            display: flex;
            align-items: center;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .meta-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .author-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .author-info {
            display: flex;
            flex-direction: column;
        }
        
        .author-name {
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .author-title {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .meta-divider {
            width: 1px;
            height: 40px;
            background: var(--border-color);
        }
        
        .meta-stats {
            display: flex;
            gap: 1.5rem;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .meta-stats span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Featured Image */
        .article-featured-image {
            padding: 2rem 0;
        }
        
        .featured-image {
            width: 100%;
            max-height: 500px;
            object-fit: cover;
            border-radius: var(--border-radius);
        }

        /* Article Content */
        .article-content-section {
            padding: 4rem 0;
        }
        
        .article-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 4rem;
        }
        
        .article-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--text-primary);
        }
        
        .article-content h2,
        .article-content h3,
        .article-content h4 {
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .article-content h2 {
            font-size: 2rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        
        .article-content h3 {
            font-size: 1.5rem;
        }
        
        .article-content p {
            margin-bottom: 1.5rem;
        }
        
        .article-content ul,
        .article-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        
        .article-content li {
            margin-bottom: 0.5rem;
        }
        
        .article-content blockquote {
            border-left: 4px solid var(--primary-color);
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: var(--text-secondary);
        }
        
        .article-content code {
            background: var(--background-secondary);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
            color: var(--primary-color);
        }
        
        .article-content pre {
            background: var(--background-secondary);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            overflow-x: auto;
            margin: 2rem 0;
        }
        
        .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: var(--border-radius);
            margin: 2rem 0;
        }

        /* Tags */
        .article-tags {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .article-tags h4 {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--text-primary);
        }
        
        .tags-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .article-tag {
            padding: 0.5rem 1rem;
            background: var(--background-secondary);
            border-radius: var(--border-radius);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .article-tag:hover {
            background: color-mix(in srgb, currentColor 10%, transparent);
        }

        /* Share Buttons */
        .article-share {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .article-share h4 {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--text-primary);
        }
        
        .share-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .share-button {
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .share-button.twitter {
            background: #1DA1F2;
            color: white;
        }
        
        .share-button.linkedin {
            background: #0077B5;
            color: white;
        }
        
        .share-button.facebook {
            background: #4267B2;
            color: white;
        }
        
        .share-button.copy {
            background: var(--background-secondary);
            color: var(--text-primary);
        }
        
        .share-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        /* Author Bio */
        .author-bio {
            margin-top: 4rem;
            padding: 2rem;
            background: var(--background-secondary);
            border-radius: var(--border-radius);
            display: flex;
            gap: 1.5rem;
            align-items: center;
        }
        
        .author-avatar-large img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .author-bio .author-info h4 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        .author-bio .author-title {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
        
        .author-bio-text {
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        
        .author-links {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .author-links a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .author-links a:hover {
            color: var(--primary-color);
        }

        /* Sidebar */
        .sidebar-widget {
            background: var(--background-secondary);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
        }
        
        .sidebar-widget h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        /* Table of Contents */
        .table-of-contents ul {
            list-style: none;
            padding: 0;
        }
        
        .table-of-contents li {
            margin-bottom: 0.5rem;
        }
        
        .table-of-contents a {
            color: var(--text-secondary);
            text-decoration: none;
            display: block;
            padding: 0.25rem 0;
            transition: color 0.3s ease;
        }
        
        .table-of-contents a:hover {
            color: var(--primary-color);
        }
        
        .table-of-contents a.h3 {
            padding-left: 1rem;
            font-size: 0.9rem;
        }

        /* Related Articles */
        .related-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .related-article a {
            display: flex;
            gap: 1rem;
            text-decoration: none;
            color: inherit;
            transition: transform 0.3s ease;
        }
        
        .related-article a:hover {
            transform: translateY(-2px);
        }
        
        .related-article img,
        .related-placeholder {
            width: 60px;
            height: 60px;
            border-radius: var(--border-radius);
            object-fit: cover;
            flex-shrink: 0;
        }
        
        .related-placeholder {
            background: var(--background-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
        }
        
        .related-content h5 {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
            line-height: 1.4;
        }
        
        .related-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        /* Newsletter Signup */
        .newsletter-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .newsletter-form input {
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background: var(--background-primary);
            color: var(--text-primary);
            font-size: 0.9rem;
        }
        
        .newsletter-form button {
            padding: 0.75rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .newsletter-form button:hover {
            background: var(--primary-color-dark);
        }

        /* Article Navigation */
        .article-navigation {
            padding: 3rem 0;
            border-top: 1px solid var(--border-color);
        }
        
        .nav-links {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .nav-link:hover {
            color: var(--primary-color);
        }

        /* Copy Toast */
        .copy-toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        }
        
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
            .article-layout {
                grid-template-columns: 1fr;
                gap: 3rem;
            }
            
            .author-bio {
                flex-direction: column;
                text-align: center;
            }
        }
        
        @media (max-width: 768px) {
            .article-title {
                font-size: 2rem;
            }
            
            .article-excerpt {
                font-size: 1.1rem;
            }
            
            .article-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .meta-divider {
                display: none;
            }
            
            .share-buttons {
                flex-direction: column;
            }
            
            .nav-links {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</body>
</html>