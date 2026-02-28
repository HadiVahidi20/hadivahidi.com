<?php
// /articles.php - Updated to handle both listing and individual articles
// Shows article listing by default, individual article when ?article=slug is provided

require_once __DIR__ . '/admin/includes/Database.php';
require_once __DIR__ . '/admin/includes/ArticleManager.php';
require_once __DIR__ . '/admin/includes/ProfileManager.php';

$db = Database::getInstance();
$articleManager = new ArticleManager($db);
$profileManager = new ProfileManager($db);

// Get profile data for SEO and branding
$profile = $profileManager->getProfile();

// Check if we're viewing a specific article
$articleSlug = $_GET['article'] ?? '';
$viewingArticle = !empty($articleSlug);

if ($viewingArticle) {
    // Individual Article Display
    $article = $articleManager->getArticleBySlug($articleSlug);
    
    if (!$article) {
        header('HTTP/1.0 404 Not Found');
        $viewingArticle = false;
        $articleSlug = '';
    } else {
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
        
        // SEO for individual article
        $pageTitle = $article['meta_title'] ?: $article['title'];
        $metaDescription = $article['meta_description'] ?: $article['excerpt'] ?: createExcerpt($article['content'], 160);
        $canonicalUrl = "https://www.hadivahidi.com/articles.php?article=" . urlencode($articleSlug);
    }
} else {
    // Article Listing Display
    $page = max(1, intval($_GET['page'] ?? 1));
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    $perPage = 9;
    
    // Get articles with filters
    $filterOptions = [
        'page' => $page,
        'per_page' => $perPage,
        'search' => $search,
        'category_id' => $category ?: null,
        'status' => 'published'
    ];
    
    $articles = $articleManager->getArticles($filterOptions);
    $totalArticles = $articleManager->getArticlesCount($filterOptions);
    $totalPages = ceil($totalArticles / $perPage);
    
    // Get categories for filter
    $categories = $articleManager->getCategories();
    
    // SEO for listing
    $pageTitle = 'Articles & Insights';
    $metaDescription = 'Explore articles about web development, design, and technology insights by ' . ($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi') . '.';
    $canonicalUrl = "https://www.hadivahidi.com/articles.php";
    
    if ($search) {
        $pageTitle = "Search results for '{$search}' - Articles";
        $metaDescription = "Articles matching '{$search}' - web development insights and tutorials.";
    }
    
    if ($category) {
        $categoryData = array_filter($categories, fn($cat) => $cat['id'] == $category);
        if ($categoryData) {
            $categoryName = reset($categoryData)['name'];
            $pageTitle = "{$categoryName} Articles";
            $metaDescription = "Articles about {$categoryName} - insights and tutorials from " . ($profile['first_name'] ?? 'Hadi') . ".";
        }
    }
}

// Helper functions
function formatArticleDate($date) {
    return date('M j, Y', strtotime($date));
}

function formatFullDate($date) {
    return date('F j, Y', strtotime($date));
}

function createExcerpt($content, $length = 150) {
    $text = strip_tags($content);
    return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> | <?php echo htmlspecialchars($profile['first_name'] ?? 'Hadi'); ?> <?php echo htmlspecialchars($profile['last_name'] ?? 'Vahidi'); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta name="keywords" content="web development, articles, blog, tutorials, <?php echo htmlspecialchars($profile['meta_keywords'] ?? ''); ?>">
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="<?php echo $viewingArticle ? 'article' : 'website'; ?>">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:title" content="<?php echo htmlspecialchars($pageTitle); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    
    <?php if ($viewingArticle && $article['featured_image']): ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($article['featured_image']); ?>">
    <meta property="article:published_time" content="<?php echo date('c', strtotime($article['published_at'])); ?>">
    <meta property="article:modified_time" content="<?php echo date('c', strtotime($article['updated_at'])); ?>">
    <meta property="article:author" content="<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>">
    <?php if ($article['category_name']): ?>
    <meta property="article:section" content="<?php echo htmlspecialchars($article['category_name']); ?>">
    <?php endif; ?>
    <?php endif; ?>
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="twitter:title" content="<?php echo htmlspecialchars($pageTitle); ?>">
    <meta property="twitter:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    
    <!-- Favicon -->
    <link rel="icon" href="assets/images/favicon.png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/main.css">
    
    <?php if ($viewingArticle): ?>
    <!-- Structured Data for Individual Article -->
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
    <?php else: ?>
    <!-- Structured Data for Blog Listing -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "<?php echo htmlspecialchars($pageTitle); ?>",
        "description": "<?php echo htmlspecialchars($metaDescription); ?>",
        "url": "https://www.hadivahidi.com/articles.php",
        "author": {
            "@type": "Person",
            "name": "<?php echo htmlspecialchars(($profile['first_name'] ?? 'Hadi') . ' ' . ($profile['last_name'] ?? 'Vahidi')); ?>",
            "url": "https://www.hadivahidi.com"
        }
    }
    </script>
    <?php endif; ?>
</head>
<body>
    <?php include('templates/components/cursor.html'); ?>
    <?php include('templates/components/theme-toggle.html'); ?>
    <?php include('templates/components/navigation.html'); ?>
    <?php include('templates/components/progress-bar.html'); ?>
    
    <main>
        <?php if ($viewingArticle): ?>
        
        <!-- INDIVIDUAL ARTICLE DISPLAY -->
        
        <!-- Article Hero -->
        <section class="article-hero">
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
                                <?php echo formatFullDate($article['published_at']); ?>
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
        </section>

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
                        <!-- Related Articles -->
                        <?php if (!empty($relatedArticles)): ?>
                        <div class="sidebar-widget related-articles">
                            <h4>Related Articles</h4>
                            <div class="related-list">
                                <?php foreach ($relatedArticles as $related): ?>
                                <article class="related-article">
                                    <a href="articles.php?article=<?php echo htmlspecialchars($related['slug']); ?>">
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

        <?php else: ?>
        
        <!-- ARTICLE LISTING DISPLAY -->
        
        <!-- Hero Section -->
        <section class="articles-hero">
            <div id="particles"></div>
            <div class="container">
                <h1 class="main-heading"><?php echo htmlspecialchars($pageTitle); ?></h1>
                <p class="subtitle">Insights, tutorials, and thoughts on web development</p>
                <?php if ($search || $category): ?>
                <a href="articles.php" class="back-link">← Back to all articles</a>
                <?php endif; ?>
            </div>
        </section>

        <!-- Filters and Search -->
        <section class="articles-filters">
            <div class="container">
                <div class="filters-wrapper">
                    <!-- Search Form -->
                    <form method="GET" class="search-form">
                        <input type="hidden" name="category" value="<?php echo htmlspecialchars($category); ?>">
                        <div class="search-input-group">
                            <input type="text" name="search" placeholder="Search articles..." 
                                   value="<?php echo htmlspecialchars($search); ?>" class="search-input">
                            <button type="submit" class="search-button">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </form>

                    <!-- Category Filter -->
                    <div class="category-filters">
                        <a href="articles.php" class="category-filter <?php echo !$category ? 'active' : ''; ?>">
                            All Articles
                        </a>
                        <?php foreach ($categories as $cat): ?>
                        <a href="?category=<?php echo $cat['id']; ?>" 
                           class="category-filter <?php echo $category == $cat['id'] ? 'active' : ''; ?>"
                           style="--category-color: <?php echo $cat['color']; ?>">
                            <?php echo htmlspecialchars($cat['name']); ?>
                        </a>
                        <?php endforeach; ?>
                    </div>

                    <!-- Results Info -->
                    <div class="results-info">
                        <span><?php echo number_format($totalArticles); ?> article<?php echo $totalArticles !== 1 ? 's' : ''; ?> found</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Articles Grid -->
        <section class="articles-grid-section">
            <div class="container">
                <?php if (!empty($articles)): ?>
                <div class="articles-grid">
                    <?php foreach ($articles as $article): ?>
                    <article class="article-card">
                        <a href="articles.php?article=<?php echo htmlspecialchars($article['slug']); ?>" class="card-link">
                            <div class="card-image">
                                <?php if ($article['featured_image']): ?>
                                <img src="<?php echo htmlspecialchars($article['featured_image']); ?>" alt="<?php echo htmlspecialchars($article['title']); ?>" loading="lazy">
                                <?php else: ?>
                                <div class="placeholder-image">
                                    <i class="fas fa-file-alt"></i>
                                </div>
                                <?php endif; ?>
                            </div>
                            <div class="card-content">
                                <?php if ($article['category_name']): ?>
                                <span class="card-category" style="color: <?php echo $article['category_color']; ?>">
                                    <?php echo htmlspecialchars($article['category_name']); ?>
                                </span>
                                <?php endif; ?>
                                <h3 class="card-title"><?php echo htmlspecialchars($article['title']); ?></h3>
                                <p class="card-excerpt"><?php echo htmlspecialchars($article['excerpt'] ?: createExcerpt($article['content'])); ?></p>
                                <div class="card-meta">
                                    <span class="card-date"><?php echo formatArticleDate($article['published_at']); ?></span>
                                    <span class="reading-time"><?php echo $article['reading_time']; ?> min read</span>
                                    <?php if ($article['view_count'] > 0): ?>
                                    <span class="view-count"><?php echo number_format($article['view_count']); ?> views</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </a>
                    </article>
                    <?php endforeach; ?>
                </div>

                <!-- Pagination -->
                <?php if ($totalPages > 1): ?>
                <nav class="pagination">
                    <div class="pagination-info">
                        Page <?php echo $page; ?> of <?php echo $totalPages; ?>
                    </div>
                    <div class="pagination-links">
                        <?php if ($page > 1): ?>
                        <a href="?page=<?php echo $page - 1; ?><?php echo $search ? '&search=' . urlencode($search) : ''; ?><?php echo $category ? '&category=' . urlencode($category) : ''; ?>" 
                           class="pagination-link pagination-prev">
                            <i class="fas fa-chevron-left"></i>
                            Previous
                        </a>
                        <?php endif; ?>

                        <?php 
                        $startPage = max(1, $page - 2);
                        $endPage = min($totalPages, $page + 2);
                        
                        for ($i = $startPage; $i <= $endPage; $i++): ?>
                        <a href="?page=<?php echo $i; ?><?php echo $search ? '&search=' . urlencode($search) : ''; ?><?php echo $category ? '&category=' . urlencode($category) : ''; ?>" 
                           class="pagination-link <?php echo $i === $page ? 'active' : ''; ?>">
                            <?php echo $i; ?>
                        </a>
                        <?php endfor; ?>

                        <?php if ($page < $totalPages): ?>
                        <a href="?page=<?php echo $page + 1; ?><?php echo $search ? '&search=' . urlencode($search) : ''; ?><?php echo $category ? '&category=' . urlencode($category) : ''; ?>" 
                           class="pagination-link pagination-next">
                            Next
                            <i class="fas fa-chevron-right"></i>
                        </a>
                        <?php endif; ?>
                    </div>
                </nav>
                <?php endif; ?>

                <?php else: ?>
                <!-- No Articles Found -->
                <div class="no-articles">
                    <div class="no-articles-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No articles found</h3>
                    <p>
                        <?php if ($search): ?>
                        Try adjusting your search terms or browse all articles.
                        <?php elseif ($category): ?>
                        No articles in this category yet. Check back soon!
                        <?php else: ?>
                        No articles have been published yet. Check back soon!
                        <?php endif; ?>
                    </p>
                    <a href="articles.php" class="button-primary">Browse All Articles</a>
                </div>
                <?php endif; ?>
            </div>
        </section>

        <!-- Back to Portfolio -->
        <section class="back-to-portfolio">
            <div class="container">
                <a href="/" class="portfolio-link">
                    <i class="fas fa-arrow-left"></i>
                    Back to Portfolio
                </a>
            </div>
        </section>

        <?php endif; ?>
    </main>

    <?php include('templates/sections/footer.php'); ?>
    
    <!-- Scripts -->
    <script type="module" src="js/main.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
    
    <script>
        // Copy to clipboard function for individual articles
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                const toast = document.createElement('div');
                toast.className = 'copy-toast';
                toast.textContent = 'Link copied to clipboard!';
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            });
        }
    </script>
    
    <!-- Page-specific styles -->
    <link rel="stylesheet" href="css/components/articles.css">
</body>
</html>