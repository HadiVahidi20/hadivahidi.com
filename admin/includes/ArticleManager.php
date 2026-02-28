<?php
// /admin/includes/ArticleManager.php
// Business logic class for managing articles (blog posts)

class ArticleManager {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Get all articles with pagination and filtering
     */
    public function getArticles($options = []) {
        $page = $options['page'] ?? 1;
        $perPage = $options['per_page'] ?? 10;
        $search = $options['search'] ?? '';
        $categoryId = $options['category_id'] ?? null;
        $status = $options['status'] ?? null;
        $featured = $options['featured'] ?? null;
        $offset = ($page - 1) * $perPage;
        
        $whereConditions = [];
        $params = [];
        
        if (!empty($search)) {
            $whereConditions[] = "(a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        
        if ($categoryId) {
            $whereConditions[] = "a.category_id = ?";
            $params[] = $categoryId;
        }
        
        if ($status) {
            $whereConditions[] = "a.status = ?";
            $params[] = $status;
        }
        
        if ($featured !== null) {
            $whereConditions[] = "a.is_featured = ?";
            $params[] = $featured ? 1 : 0;
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        $sql = "
            SELECT a.*, 
                   ac.name as category_name, 
                   ac.color as category_color,
                   u.first_name, u.last_name,
                   COUNT(DISTINCT atr.tag_id) as tag_count
            FROM articles a
            LEFT JOIN article_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tag_relationships atr ON a.id = atr.article_id
            {$whereClause}
            GROUP BY a.id
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $perPage;
        $params[] = $offset;
        
        return $this->db->fetchAll($sql, $params);
    }
    
    /**
     * Get total count of articles (for pagination)
     */
    public function getArticlesCount($options = []) {
        $search = $options['search'] ?? '';
        $categoryId = $options['category_id'] ?? null;
        $status = $options['status'] ?? null;
        $featured = $options['featured'] ?? null;
        
        $whereConditions = [];
        $params = [];
        
        if (!empty($search)) {
            $whereConditions[] = "(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        
        if ($categoryId) {
            $whereConditions[] = "category_id = ?";
            $params[] = $categoryId;
        }
        
        if ($status) {
            $whereConditions[] = "status = ?";
            $params[] = $status;
        }
        
        if ($featured !== null) {
            $whereConditions[] = "is_featured = ?";
            $params[] = $featured ? 1 : 0;
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        $result = $this->db->fetch("SELECT COUNT(*) as count FROM articles {$whereClause}", $params);
        return $result['count'];
    }
    
    /**
     * Get single article by ID
     */
    public function getArticleById($id) {
        $sql = "
            SELECT a.*, 
                   ac.name as category_name,
                   u.first_name, u.last_name
            FROM articles a
            LEFT JOIN article_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = ?
        ";
        
        $article = $this->db->fetch($sql, [$id]);
        if ($article) {
            $article['tags'] = $this->getArticleTags($id);
        }
        
        return $article;
    }
    
    /**
     * Get article by slug
     */
    public function getArticleBySlug($slug) {
        $sql = "
            SELECT a.*, 
                   ac.name as category_name, ac.color as category_color,
                   u.first_name, u.last_name
            FROM articles a
            LEFT JOIN article_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.slug = ? AND a.status = 'published'
        ";
        
        $article = $this->db->fetch($sql, [$slug]);
        if ($article) {
            $article['tags'] = $this->getArticleTags($article['id']);
            // Increment view count
            $this->incrementViewCount($article['id']);
        }
        
        return $article;
    }
    
    /**
     * Create new article
     */
    public function createArticle($data) {
        try {
            return $this->db->transaction(function($db) use ($data) {
                $sql = "
                    INSERT INTO articles (
                        title, slug, excerpt, content, featured_image, status,
                        is_featured, author_id, category_id, meta_title, 
                        meta_description, reading_time, published_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ";
                
                $publishedAt = null;
                if ($data['status'] === 'published') {
                    $publishedAt = date('Y-m-d H:i:s');
                } elseif ($data['status'] === 'scheduled' && !empty($data['published_at'])) {
                    $publishedAt = $data['published_at'];
                }
                
                $params = [
                    $data['title'],
                    $this->generateSlug($data['title']),
                    $data['excerpt'] ?? null,
                    $data['content'] ?? null,
                    $data['featured_image'] ?? null,
                    $data['status'] ?? 'draft',
                    $data['is_featured'] ?? 0,
                    $data['author_id'],
                    $data['category_id'] ?? null,
                    $data['meta_title'] ?? null,
                    $data['meta_description'] ?? null,
                    $this->calculateReadingTime($data['content'] ?? ''),
                    $publishedAt
                ];
                
                $db->execute($sql, $params);
                $articleId = $db->getLastInsertId();
                
                // Handle tags
                if (!empty($data['tags'])) {
                    $this->updateArticleTags($articleId, $data['tags']);
                }
                
                return $articleId;
            });
        } catch (Exception $e) {
            throw new Exception("Failed to create article: " . $e->getMessage());
        }
    }
    
    /**
     * Update existing article
     */
    public function updateArticle($id, $data) {
        try {
            return $this->db->transaction(function($db) use ($id, $data) {
                $sql = "
                    UPDATE articles SET
                        title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
                        status = ?, is_featured = ?, category_id = ?, meta_title = ?,
                        meta_description = ?, reading_time = ?, published_at = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ";
                
                $publishedAt = null;
                $currentArticle = $this->getArticleById($id);
                
                if ($data['status'] === 'published' && $currentArticle['status'] !== 'published') {
                    $publishedAt = date('Y-m-d H:i:s');
                } elseif ($data['status'] === 'scheduled' && !empty($data['published_at'])) {
                    $publishedAt = $data['published_at'];
                } elseif ($data['status'] === 'published') {
                    $publishedAt = $currentArticle['published_at'];
                }
                
                $params = [
                    $data['title'],
                    $this->generateSlug($data['title'], $id),
                    $data['excerpt'] ?? null,
                    $data['content'] ?? null,
                    $data['featured_image'] ?? null,
                    $data['status'] ?? 'draft',
                    $data['is_featured'] ?? 0,
                    $data['category_id'] ?? null,
                    $data['meta_title'] ?? null,
                    $data['meta_description'] ?? null,
                    $this->calculateReadingTime($data['content'] ?? ''),
                    $publishedAt,
                    $id
                ];
                
                $db->execute($sql, $params);
                
                // Handle tags
                if (isset($data['tags'])) {
                    $this->updateArticleTags($id, $data['tags']);
                }
                
                return true;
            });
        } catch (Exception $e) {
            throw new Exception("Failed to update article: " . $e->getMessage());
        }
    }
    
    /**
     * Delete article
     */
    public function deleteArticle($id) {
        try {
            return $this->db->transaction(function($db) use ($id) {
                // Delete tag relationships
                $db->execute("DELETE FROM article_tag_relationships WHERE article_id = ?", [$id]);
                
                // Delete article
                $db->execute("DELETE FROM articles WHERE id = ?", [$id]);
                
                return true;
            });
        } catch (Exception $e) {
            throw new Exception("Failed to delete article: " . $e->getMessage());
        }
    }
    
    /**
     * Get all categories
     */
    public function getCategories($activeOnly = true) {
        $whereClause = $activeOnly ? "WHERE is_active = 1" : "";
        return $this->db->fetchAll("
            SELECT * FROM article_categories 
            {$whereClause} 
            ORDER BY sort_order, name
        ");
    }
    
    /**
     * Get all tags
     */
    public function getTags() {
        return $this->db->fetchAll("
            SELECT * FROM article_tags 
            ORDER BY usage_count DESC, name
        ");
    }
    
    /**
     * Get tags for specific article
     */
    public function getArticleTags($articleId) {
        return $this->db->fetchAll("
            SELECT at.* FROM article_tags at
            JOIN article_tag_relationships atr ON at.id = atr.tag_id
            WHERE atr.article_id = ?
            ORDER BY at.name
        ", [$articleId]);
    }
    
    /**
     * Update article tags
     */
    private function updateArticleTags($articleId, $tagNames) {
        // Remove existing relationships
        $this->db->execute("DELETE FROM article_tag_relationships WHERE article_id = ?", [$articleId]);
        
        if (empty($tagNames)) {
            return;
        }
        
        foreach ($tagNames as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) continue;
            
            // Get or create tag
            $tag = $this->db->fetch("SELECT id FROM article_tags WHERE name = ?", [$tagName]);
            
            if (!$tag) {
                // Create new tag
                $slug = $this->generateSlug($tagName);
                $this->db->execute("
                    INSERT INTO article_tags (name, slug, usage_count) 
                    VALUES (?, ?, 1)
                ", [$tagName, $slug]);
                $tagId = $this->db->getLastInsertId();
            } else {
                $tagId = $tag['id'];
                // Increment usage count
                $this->db->execute("
                    UPDATE article_tags 
                    SET usage_count = usage_count + 1 
                    WHERE id = ?
                ", [$tagId]);
            }
            
            // Create relationship
            $this->db->execute("
                INSERT INTO article_tag_relationships (article_id, tag_id) 
                VALUES (?, ?)
            ", [$articleId, $tagId]);
        }
    }
    
    /**
     * Generate unique slug
     */
    private function generateSlug($title, $excludeId = null) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $originalSlug = $slug;
        $counter = 1;
        
        while (true) {
            $params = [$slug];
            $sql = "SELECT id FROM articles WHERE slug = ?";
            
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            
            $existing = $this->db->fetch($sql, $params);
            
            if (!$existing) {
                return $slug;
            }
            
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
    }
    
    /**
     * Calculate reading time in minutes
     */
    private function calculateReadingTime($content) {
        $wordCount = str_word_count(strip_tags($content));
        $readingTime = ceil($wordCount / 200); // Average 200 words per minute
        return max(1, $readingTime);
    }
    
    /**
     * Increment view count
     */
    private function incrementViewCount($articleId) {
        $this->db->execute("UPDATE articles SET view_count = view_count + 1 WHERE id = ?", [$articleId]);
    }
    
    /**
     * Get articles statistics
     */
    public function getStatistics() {
        return [
            'total' => $this->db->fetch("SELECT COUNT(*) as count FROM articles")['count'],
            'published' => $this->db->fetch("SELECT COUNT(*) as count FROM articles WHERE status = 'published'")['count'],
            'draft' => $this->db->fetch("SELECT COUNT(*) as count FROM articles WHERE status = 'draft'")['count'],
            'scheduled' => $this->db->fetch("SELECT COUNT(*) as count FROM articles WHERE status = 'scheduled'")['count'],
            'featured' => $this->db->fetch("SELECT COUNT(*) as count FROM articles WHERE is_featured = 1")['count'],
            'total_views' => $this->db->fetch("SELECT SUM(view_count) as total FROM articles")['total'] ?? 0
        ];
    }
    
    /**
     * Get featured articles for homepage
     */
    public function getFeaturedArticles($limit = 3) {
        return $this->db->fetchAll("
            SELECT a.*, ac.name as category_name, ac.color as category_color
            FROM articles a
            LEFT JOIN article_categories ac ON a.category_id = ac.id
            WHERE a.is_featured = 1 AND a.status = 'published'
            ORDER BY a.published_at DESC
            LIMIT ?
        ", [$limit]);
    }
    
    /**
     * Get recent articles
     */
    public function getRecentArticles($limit = 5) {
        return $this->db->fetchAll("
            SELECT id, title, slug, excerpt, published_at, view_count, status
            FROM articles
            ORDER BY created_at DESC
            LIMIT ?
        ", [$limit]);
    }
}