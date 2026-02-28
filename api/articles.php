<?php
// /api/articles.php
// REST API endpoint for articles data

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../admin/includes/Database.php';
require_once __DIR__ . '/../admin/includes/ArticleManager.php';

try {
    // Check if articles are enabled
    $db = Database::getInstance();
    $articlesEnabled = $db->fetch("SELECT setting_value FROM settings WHERE setting_key = 'articles_enabled'")['setting_value'] ?? '0';
    
    if ($articlesEnabled !== '1') {
        http_response_code(404);
        echo json_encode([
            'error' => 'Articles section is disabled',
            'data' => []
        ]);
        exit;
    }

    $articleManager = new ArticleManager($db);
    
    // Get request parameters
    $action = $_GET['action'] ?? 'list';
    $page = max(1, intval($_GET['page'] ?? 1));
    $perPage = min(50, max(1, intval($_GET['per_page'] ?? 10))); // Limit max to 50
    $search = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $featured = $_GET['featured'] ?? '';
    $slug = $_GET['slug'] ?? '';

    switch ($action) {
        case 'list':
            // Get articles with filters
            $filterOptions = [
                'page' => $page,
                'per_page' => $perPage,
                'search' => $search,
                'category_id' => $category ?: null,
                'status' => 'published',
                'featured' => $featured === 'true' ? true : ($featured === 'false' ? false : null)
            ];
            
            $articles = $articleManager->getArticles($filterOptions);
            $totalArticles = $articleManager->getArticlesCount($filterOptions);
            $totalPages = ceil($totalArticles / $perPage);
            
            // Format articles for API response
            $formattedArticles = array_map(function($article) {
                return [
                    'id' => (int)$article['id'],
                    'title' => $article['title'],
                    'slug' => $article['slug'],
                    'excerpt' => $article['excerpt'],
                    'featured_image' => $article['featured_image'],
                    'category' => $article['category_name'] ? [
                        'id' => (int)$article['category_id'],
                        'name' => $article['category_name'],
                        'color' => $article['category_color']
                    ] : null,
                    'author' => [
                        'name' => trim(($article['first_name'] ?? '') . ' ' . ($article['last_name'] ?? '')),
                        'first_name' => $article['first_name'] ?? '',
                        'last_name' => $article['last_name'] ?? ''
                    ],
                    'published_at' => $article['published_at'],
                    'reading_time' => (int)$article['reading_time'],
                    'view_count' => (int)$article['view_count'],
                    'is_featured' => (bool)$article['is_featured'],
                    'tag_count' => (int)($article['tag_count'] ?? 0),
                    'created_at' => $article['created_at'],
                    'updated_at' => $article['updated_at']
                ];
            }, $articles);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedArticles,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total_items' => $totalArticles,
                    'total_pages' => $totalPages,
                    'has_next' => $page < $totalPages,
                    'has_prev' => $page > 1
                ],
                'filters' => [
                    'search' => $search,
                    'category' => $category,
                    'featured' => $featured
                ]
            ]);
            break;

        case 'single':
            if (empty($slug)) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Article slug is required',
                    'data' => null
                ]);
                break;
            }
            
            $article = $articleManager->getArticleBySlug($slug);
            
            if (!$article) {
                http_response_code(404);
                echo json_encode([
                    'error' => 'Article not found',
                    'data' => null
                ]);
                break;
            }
            
            // Format single article for API response
            $formattedArticle = [
                'id' => (int)$article['id'],
                'title' => $article['title'],
                'slug' => $article['slug'],
                'excerpt' => $article['excerpt'],
                'content' => $article['content'],
                'featured_image' => $article['featured_image'],
                'category' => $article['category_name'] ? [
                    'id' => (int)$article['category_id'],
                    'name' => $article['category_name'],
                    'color' => $article['category_color']
                ] : null,
                'author' => [
                    'name' => trim(($article['first_name'] ?? '') . ' ' . ($article['last_name'] ?? '')),
                    'first_name' => $article['first_name'] ?? '',
                    'last_name' => $article['last_name'] ?? ''
                ],
                'tags' => array_map(function($tag) {
                    return [
                        'id' => (int)$tag['id'],
                        'name' => $tag['name'],
                        'slug' => $tag['slug'],
                        'color' => $tag['color']
                    ];
                }, $article['tags'] ?? []),
                'published_at' => $article['published_at'],
                'reading_time' => (int)$article['reading_time'],
                'view_count' => (int)$article['view_count'],
                'is_featured' => (bool)$article['is_featured'],
                'meta_title' => $article['meta_title'],
                'meta_description' => $article['meta_description'],
                'created_at' => $article['created_at'],
                'updated_at' => $article['updated_at']
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $formattedArticle
            ]);
            break;

        case 'categories':
            $categories = $articleManager->getCategories();
            
            $formattedCategories = array_map(function($category) use ($articleManager) {
                $count = $articleManager->getArticlesCount(['category_id' => $category['id'], 'status' => 'published']);
                return [
                    'id' => (int)$category['id'],
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'color' => $category['color'],
                    'article_count' => $count,
                    'sort_order' => (int)$category['sort_order'],
                    'is_active' => (bool)$category['is_active']
                ];
            }, $categories);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedCategories
            ]);
            break;

        case 'tags':
            $tags = $articleManager->getTags();
            
            $formattedTags = array_map(function($tag) {
                return [
                    'id' => (int)$tag['id'],
                    'name' => $tag['name'],
                    'slug' => $tag['slug'],
                    'color' => $tag['color'],
                    'usage_count' => (int)$tag['usage_count']
                ];
            }, $tags);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedTags
            ]);
            break;

        case 'stats':
            $stats = $articleManager->getStatistics();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'total' => (int)$stats['total'],
                    'published' => (int)$stats['published'],
                    'draft' => (int)$stats['draft'],
                    'scheduled' => (int)$stats['scheduled'],
                    'featured' => (int)$stats['featured'],
                    'total_views' => (int)$stats['total_views']
                ]
            ]);
            break;

        case 'featured':
            $limit = min(10, max(1, intval($_GET['limit'] ?? 3)));
            $featuredArticles = $articleManager->getFeaturedArticles($limit);
            
            $formattedFeatured = array_map(function($article) {
                return [
                    'id' => (int)$article['id'],
                    'title' => $article['title'],
                    'slug' => $article['slug'],
                    'excerpt' => $article['excerpt'],
                    'featured_image' => $article['featured_image'],
                    'category' => $article['category_name'] ? [
                        'id' => (int)$article['category_id'],
                        'name' => $article['category_name'],
                        'color' => $article['category_color']
                    ] : null,
                    'published_at' => $article['published_at'],
                    'reading_time' => (int)$article['reading_time'],
                    'view_count' => (int)$article['view_count']
                ];
            }, $featuredArticles);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedFeatured
            ]);
            break;

        case 'recent':
            $limit = min(20, max(1, intval($_GET['limit'] ?? 5)));
            $recentArticles = $articleManager->getRecentArticles($limit);
            
            $formattedRecent = array_map(function($article) {
                return [
                    'id' => (int)$article['id'],
                    'title' => $article['title'],
                    'slug' => $article['slug'],
                    'excerpt' => $article['excerpt'],
                    'published_at' => $article['published_at'],
                    'view_count' => (int)$article['view_count'],
                    'status' => $article['status']
                ];
            }, $recentArticles);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedRecent
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'error' => 'Invalid action',
                'available_actions' => ['list', 'single', 'categories', 'tags', 'stats', 'featured', 'recent'],
                'data' => null
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'data' => null
    ]);
}

/* 
 * API USAGE EXAMPLES:
 * 
 * Get articles list:
 * /api/articles.php?action=list&page=1&per_page=10
 * 
 * Search articles:
 * /api/articles.php?action=list&search=javascript&per_page=5
 * 
 * Get articles by category:
 * /api/articles.php?action=list&category=1
 * 
 * Get featured articles only:
 * /api/articles.php?action=list&featured=true
 * 
 * Get single article:
 * /api/articles.php?action=single&slug=article-slug
 * 
 * Get categories:
 * /api/articles.php?action=categories
 * 
 * Get tags:
 * /api/articles.php?action=tags
 * 
 * Get statistics:
 * /api/articles.php?action=stats
 * 
 * Get featured articles (for homepage):
 * /api/articles.php?action=featured&limit=3
 * 
 * Get recent articles:
 * /api/articles.php?action=recent&limit=5
 * 
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": { ... }, // Only for list action
 *   "filters": { ... }     // Only for list action
 * }
 * 
 * ERROR FORMAT:
 * {
 *   "error": "Error message",
 *   "data": null
 * }
 */
?>