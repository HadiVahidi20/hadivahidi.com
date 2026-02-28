<?php
// /templates/sections/articles.php
// Homepage articles section - displays recent articles with modal previews

require_once __DIR__ . '/../../admin/includes/Database.php';
require_once __DIR__ . '/../../admin/includes/ArticleManager.php';

// Check if articles are enabled
$db = Database::getInstance();
$articlesEnabled = $db->fetch("SELECT setting_value FROM settings WHERE setting_key = 'articles_enabled'")['setting_value'] ?? '0';

if ($articlesEnabled !== '1') {
    return; // Don't display section if disabled
}

$articleManager = new ArticleManager($db);

// Get recent articles for homepage
$recentArticles = $articleManager->getArticles([
    'status' => 'published',
    'per_page' => 6,
    'page' => 1
]);

// Get featured articles count setting
$featuredCount = $db->fetch("SELECT setting_value FROM settings WHERE setting_key = 'featured_articles_count'")['setting_value'] ?? '3';

if (empty($recentArticles)) {
    return; // Don't display section if no articles
}

// Helper function to create excerpt
function createArticleExcerpt($content, $length = 150) {
    $text = strip_tags($content);
    return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
}

// Helper function to format date
function formatDate($date) {
    return date('M j, Y', strtotime($date));
}
?>

<section class="articles-section" id="articles">
    <div id="articles-particles"></div>
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">Latest Articles</h2>
            <p class="section-subtitle">Insights, tutorials, and thoughts on web development</p>
        </div>

        <div class="articles-grid">
            <?php foreach ($recentArticles as $index => $article): ?>
            <article class="article-card" data-article-id="<?php echo $article['id']; ?>">
                <div class="article-image">
                    <?php if ($article['featured_image']): ?>
                    <img src="<?php echo htmlspecialchars($article['featured_image']); ?>" 
                         alt="<?php echo htmlspecialchars($article['title']); ?>" 
                         loading="lazy">
                    <?php else: ?>
                    <div class="article-placeholder">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <?php endif; ?>
                    <div class="article-overlay">
                        <span class="read-preview">Preview Article</span>
                    </div>
                </div>

                <div class="article-content">
                    <?php if ($article['category_name']): ?>
                    <span class="article-category" style="color: <?php echo $article['category_color']; ?>">
                        <?php echo htmlspecialchars($article['category_name']); ?>
                    </span>
                    <?php endif; ?>
                    
                    <h3 class="article-title"><?php echo htmlspecialchars($article['title']); ?></h3>
                    <p class="article-excerpt"><?php echo htmlspecialchars($article['excerpt'] ?: createArticleExcerpt($article['content'])); ?></p>
                    
                    <div class="article-meta">
                        <span class="article-date"><?php echo formatDate($article['published_at']); ?></span>
                        <span class="reading-time"><?php echo $article['reading_time']; ?> min read</span>
                        <?php if ($article['view_count'] > 0): ?>
                        <span class="view-count"><?php echo number_format($article['view_count']); ?> views</span>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Hidden data for modal -->
                <script type="application/json" class="article-data">
                {
                    "id": <?php echo $article['id']; ?>,
                    "title": <?php echo json_encode($article['title']); ?>,
                    "excerpt": <?php echo json_encode($article['excerpt'] ?: createArticleExcerpt($article['content'], 200)); ?>,
                    "featured_image": <?php echo json_encode($article['featured_image']); ?>,
                    "category_name": <?php echo json_encode($article['category_name']); ?>,
                    "category_color": <?php echo json_encode($article['category_color']); ?>,
                    "published_at": <?php echo json_encode($article['published_at']); ?>,
                    "reading_time": <?php echo $article['reading_time']; ?>,
                    "view_count": <?php echo $article['view_count']; ?>,
                    "slug": <?php echo json_encode($article['slug']); ?>,
                    "author_name": <?php echo json_encode(($article['first_name'] ?? 'Hadi') . ' ' . ($article['last_name'] ?? 'Vahidi')); ?>
                }
                </script>
            </article>
            <?php endforeach; ?>
        </div>

        <div class="section-actions">
            <a href="articles.php" class="button-primary view-all-articles">
                <i class="fas fa-newspaper"></i>
                View All Articles
            </a>
        </div>
    </div>
</section>

<!-- Article Preview Modal -->
<div id="article-modal" class="article-modal">
    <div class="modal-backdrop"></div>
    <div class="modal-container">
        <div class="modal-header">
            <button class="modal-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-content">
            <div class="modal-image">
                <img id="modal-image" src="" alt="">
                <div class="modal-image-placeholder" style="display: none;">
                    <i class="fas fa-newspaper"></i>
                </div>
            </div>
            
            <div class="modal-body">
                <div class="modal-category-wrapper">
                    <span id="modal-category" class="modal-category"></span>
                </div>
                
                <h2 id="modal-title" class="modal-title"></h2>
                <p id="modal-excerpt" class="modal-excerpt"></p>
                
                <div class="modal-meta">
                    <div class="modal-author">
                        <span id="modal-author-name"></span>
                    </div>
                    <div class="modal-stats">
                        <span id="modal-date"></span>
                        <span id="modal-reading-time"></span>
                        <span id="modal-view-count"></span>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <a id="modal-read-full" href="#" class="button-primary modal-read-button">
                        <i class="fas fa-arrow-right"></i>
                        Read Full Article
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
/* Articles Section */
.articles-section {
    padding: var(--section-padding) 0;
    position: relative;
    overflow: hidden;
}

.articles-section #articles-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.articles-section .container {
    position: relative;
    z-index: 2;
}

/* Articles Grid */
.articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

/* Article Cards */
.article-card {
    background: var(--card-background, rgba(255, 255, 255, 0.1));
    border-radius: var(--border-radius);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s ease;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(10px);
    position: relative;
}

.article-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
}

.article-card:hover .article-overlay {
    opacity: 1;
}

.article-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.article-card:hover .article-image img {
    transform: scale(1.05);
}

.article-placeholder {
    width: 100%;
    height: 100%;
    background: var(--background-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 2rem;
}

.article-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.read-preview {
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border: 1px solid white;
    border-radius: var(--border-radius);
    backdrop-filter: blur(10px);
}

.article-content {
    padding: 1.5rem;
}

.article-category {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    display: inline-block;
    opacity: 0.9;
}

.article-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.article-card:hover .article-title {
    color: var(--primary-color);
}

.article-excerpt {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
    font-size: 0.95rem;
}

.article-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: var(--text-secondary);
    opacity: 0.8;
}

.article-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

/* Article Modal */
.article-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.article-modal.active {
    display: flex;
    opacity: 1;
}

.modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
}

.modal-container {
    position: relative;
    margin: auto;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    background: var(--background-primary);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    animation: modalSlideIn 0.3s ease forwards;
}

@keyframes modalSlideIn {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
}

.modal-close {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
}

.modal-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.modal-image {
    height: 250px;
    position: relative;
    overflow: hidden;
}

.modal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.modal-image-placeholder {
    width: 100%;
    height: 100%;
    background: var(--background-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 3rem;
}

.modal-body {
    padding: 2rem;
    flex: 1;
    overflow-y: auto;
}

.modal-category-wrapper {
    margin-bottom: 1rem;
}

.modal-category {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.75rem;
    border-radius: var(--border-radius);
    background: color-mix(in srgb, currentColor 15%, transparent);
    display: inline-block;
}

.modal-title {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.modal-excerpt {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.modal-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 1rem;
}

.modal-author {
    font-weight: 500;
    color: var(--text-primary);
}

.modal-stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.modal-stats span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.modal-actions {
    text-align: center;
}

.modal-read-button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.modal-read-button:hover {
    background: var(--primary-color-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Section Actions */
.section-actions {
    text-align: center;
    margin-top: 2rem;
}

.view-all-articles {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.view-all-articles:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
    .articles-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .modal-container {
        width: 95%;
        max-height: 90vh;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-title {
        font-size: 1.5rem;
    }
    
    .modal-meta {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .modal-stats {
        gap: 1rem;
    }
}

@media (max-width: 480px) {
    .articles-section {
        padding: 3rem 0;
    }
    
    .modal-image {
        height: 200px;
    }
    
    .modal-excerpt {
        font-size: 1rem;
    }
}
</style>

<script>
// Article Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('article-modal');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalClose = modal.querySelector('.modal-close');
    const articleCards = document.querySelectorAll('.article-card');

    // Modal elements
    const modalImage = document.getElementById('modal-image');
    const modalImagePlaceholder = modal.querySelector('.modal-image-placeholder');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalExcerpt = document.getElementById('modal-excerpt');
    const modalAuthorName = document.getElementById('modal-author-name');
    const modalDate = document.getElementById('modal-date');
    const modalReadingTime = document.getElementById('modal-reading-time');
    const modalViewCount = document.getElementById('modal-view-count');
    const modalReadFull = document.getElementById('modal-read-full');

    // Open modal function
    function openModal(articleData) {
        // Update modal content
        if (articleData.featured_image) {
            modalImage.src = articleData.featured_image;
            modalImage.alt = articleData.title;
            modalImage.style.display = 'block';
            modalImagePlaceholder.style.display = 'none';
        } else {
            modalImage.style.display = 'none';
            modalImagePlaceholder.style.display = 'flex';
        }

        if (articleData.category_name) {
            modalCategory.textContent = articleData.category_name;
            modalCategory.style.color = articleData.category_color;
            modalCategory.parentElement.style.display = 'block';
        } else {
            modalCategory.parentElement.style.display = 'none';
        }

        modalTitle.textContent = articleData.title;
        modalExcerpt.textContent = articleData.excerpt;
        modalAuthorName.textContent = 'By ' + articleData.author_name;
        modalDate.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + formatDate(articleData.published_at);
        modalReadingTime.innerHTML = '<i class="fas fa-clock"></i> ' + articleData.reading_time + ' min read';
        
        if (articleData.view_count > 0) {
            modalViewCount.innerHTML = '<i class="fas fa-eye"></i> ' + formatNumber(articleData.view_count) + ' views';
            modalViewCount.style.display = 'flex';
        } else {
            modalViewCount.style.display = 'none';
        }

        modalReadFull.href = 'articles.php?article=' + articleData.slug;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event listeners for article cards
    articleCards.forEach(card => {
        card.addEventListener('click', function() {
            const articleDataScript = this.querySelector('.article-data');
            if (articleDataScript) {
                try {
                    const articleData = JSON.parse(articleDataScript.textContent);
                    openModal(articleData);
                } catch (e) {
                    console.error('Error parsing article data:', e);
                }
            }
        });
    });

    // Event listeners for modal close
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Helper functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Initialize particles for articles section
    if (typeof initParticles === 'function') {
        initParticles('articles-particles');
    }
});
</script>