// /js/utils/articlesAPI.js
// JavaScript client for Articles API

class ArticlesAPI {
    constructor(baseURL = '/api/articles.php') {
        this.baseURL = baseURL;
    }

    /**
     * Make API request
     * @private
     */
    async makeRequest(params = {}) {
        try {
            const url = new URL(this.baseURL, window.location.origin);
            
            // Add parameters to URL
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Articles API Error:', error);
            throw error;
        }
    }

    /**
     * Get articles list with optional filters
     * @param {Object} options - Filter options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.perPage - Items per page (default: 10)
     * @param {string} options.search - Search query
     * @param {string} options.category - Category ID
     * @param {boolean} options.featured - Filter featured articles
     * @returns {Promise<Object>} Articles data with pagination
     */
    async getArticles(options = {}) {
        const params = {
            action: 'list',
            page: options.page || 1,
            per_page: options.perPage || 10,
            search: options.search || '',
            category: options.category || '',
            featured: options.featured !== undefined ? options.featured.toString() : ''
        };

        return this.makeRequest(params);
    }

    /**
     * Get single article by slug
     * @param {string} slug - Article slug
     * @returns {Promise<Object>} Article data
     */
    async getArticle(slug) {
        if (!slug) {
            throw new Error('Article slug is required');
        }

        const params = {
            action: 'single',
            slug: slug
        };

        return this.makeRequest(params);
    }

    /**
     * Get featured articles
     * @param {number} limit - Number of articles to fetch (default: 3)
     * @returns {Promise<Object>} Featured articles data
     */
    async getFeaturedArticles(limit = 3) {
        const params = {
            action: 'featured',
            limit: limit
        };

        return this.makeRequest(params);
    }

    /**
     * Get recent articles
     * @param {number} limit - Number of articles to fetch (default: 5)
     * @returns {Promise<Object>} Recent articles data
     */
    async getRecentArticles(limit = 5) {
        const params = {
            action: 'recent',
            limit: limit
        };

        return this.makeRequest(params);
    }

    /**
     * Get all article categories
     * @returns {Promise<Object>} Categories data
     */
    async getCategories() {
        const params = {
            action: 'categories'
        };

        return this.makeRequest(params);
    }

    /**
     * Get all article tags
     * @returns {Promise<Object>} Tags data
     */
    async getTags() {
        const params = {
            action: 'tags'
        };

        return this.makeRequest(params);
    }

    /**
     * Get article statistics
     * @returns {Promise<Object>} Statistics data
     */
    async getStatistics() {
        const params = {
            action: 'stats'
        };

        return this.makeRequest(params);
    }

    /**
     * Search articles
     * @param {string} query - Search query
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Search results
     */
    async searchArticles(query, options = {}) {
        return this.getArticles({
            search: query,
            ...options
        });
    }

    /**
     * Get articles by category
     * @param {string|number} categoryId - Category ID
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Category articles
     */
    async getArticlesByCategory(categoryId, options = {}) {
        return this.getArticles({
            category: categoryId.toString(),
            ...options
        });
    }
}

// Utility functions for common operations
const ArticlesHelpers = {
    /**
     * Format article date
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format article date (short)
     * @param {string} dateString - Date string
     * @returns {string} Short formatted date
     */
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Create article excerpt
     * @param {string} content - Article content
     * @param {number} length - Excerpt length
     * @returns {string} Excerpt
     */
    createExcerpt(content, length = 150) {
        const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
        return text.length > length ? text.substring(0, length) + '...' : text;
    },

    /**
     * Generate article URL
     * @param {string} slug - Article slug
     * @returns {string} Article URL
     */
    getArticleURL(slug) {
        return `/articles.php?article=${encodeURIComponent(slug)}`;
    },

    /**
     * Generate category filter URL
     * @param {string|number} categoryId - Category ID
     * @returns {string} Category URL
     */
    getCategoryURL(categoryId) {
        return `/articles.php?category=${encodeURIComponent(categoryId)}`;
    },

    /**
     * Generate search URL
     * @param {string} query - Search query
     * @returns {string} Search URL
     */
    getSearchURL(query) {
        return `/articles.php?search=${encodeURIComponent(query)}`;
    },

    /**
     * Format view count
     * @param {number} count - View count
     * @returns {string} Formatted count
     */
    formatViewCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    },

    /**
     * Get reading time text
     * @param {number} minutes - Reading time in minutes
     * @returns {string} Reading time text
     */
    getReadingTimeText(minutes) {
        return `${minutes} min read`;
    },

    /**
     * Generate article card HTML
     * @param {Object} article - Article data
     * @returns {string} HTML string
     */
    generateArticleCardHTML(article) {
        const categoryHTML = article.category ? 
            `<span class="article-category" style="color: ${article.category.color}">
                ${article.category.name}
            </span>` : '';

        const imageHTML = article.featured_image ?
            `<img src="${article.featured_image}" alt="${article.title}" loading="lazy">` :
            `<div class="placeholder-image"><i class="fas fa-file-alt"></i></div>`;

        return `
            <article class="article-card">
                <a href="${this.getArticleURL(article.slug)}" class="card-link">
                    <div class="card-image">
                        ${imageHTML}
                    </div>
                    <div class="card-content">
                        ${categoryHTML}
                        <h3 class="card-title">${article.title}</h3>
                        <p class="card-excerpt">${article.excerpt || this.createExcerpt(article.content || '')}</p>
                        <div class="card-meta">
                            <span class="card-date">${this.formatDateShort(article.published_at)}</span>
                            <span class="reading-time">${this.getReadingTimeText(article.reading_time)}</span>
                            ${article.view_count > 0 ? 
                                `<span class="view-count">${this.formatViewCount(article.view_count)} views</span>` : 
                                ''}
                        </div>
                    </div>
                </a>
            </article>
        `;
    }
};

// Create global instance
const articlesAPI = new ArticlesAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ArticlesAPI, ArticlesHelpers };
}

// Example usage in comments:
/*
// Get featured articles for homepage
articlesAPI.getFeaturedArticles(3).then(response => {
    console.log('Featured articles:', response.data);
});

// Search articles
articlesAPI.searchArticles('javascript').then(response => {
    console.log('Search results:', response.data);
    console.log('Total pages:', response.pagination.total_pages);
});

// Get single article
articlesAPI.getArticle('my-article-slug').then(response => {
    console.log('Article:', response.data);
}).catch(error => {
    console.error('Article not found:', error);
});

// Get articles by category
articlesAPI.getArticlesByCategory(1, { page: 1, perPage: 5 }).then(response => {
    console.log('Category articles:', response.data);
});

// Get categories for navigation
articlesAPI.getCategories().then(response => {
    const categories = response.data;
    categories.forEach(cat => {
        console.log(`${cat.name}: ${cat.article_count} articles`);
    });
});

// Generate article card HTML
const article = {
    title: "Sample Article",
    slug: "sample-article",
    excerpt: "This is a sample excerpt...",
    featured_image: "/path/to/image.jpg",
    category: { name: "Tech", color: "#3B82F6" },
    published_at: "2025-01-15",
    reading_time: 5,
    view_count: 120
};

const cardHTML = ArticlesHelpers.generateArticleCardHTML(article);
document.getElementById('articles-container').innerHTML = cardHTML;
*/