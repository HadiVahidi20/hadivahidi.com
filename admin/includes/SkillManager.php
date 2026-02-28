<?php
// /admin/includes/SkillManager.php
// Minimal business logic class for skill operations - keeps main skills.php clean

class SkillManager {
    private $db;
    
    public function __construct(Database $database) {
        $this->db = $database;
    }
    
    /**
     * Generate unique slug from skill name
     */
    public function generateUniqueSlug($name, $excludeId = null) {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Check uniqueness
        $counter = 1;
        $originalSlug = $slug;
        while (true) {
            $existing = $this->db->fetch(
                "SELECT id FROM skills WHERE slug = ? AND id != ?", 
                [$slug, $excludeId ?: 0]
            );
            if (!$existing) break;
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
    
    /**
     * Get skills with categories for frontend
     */
    public function getSkillsForFrontend($activeOnly = true) {
        $whereClause = $activeOnly ? 'WHERE s.is_active = 1 AND c.is_active = 1' : '';
        
        return $this->db->fetchAll("
            SELECT s.*, c.name as category_name, c.color as category_color, c.slug as category_slug
            FROM skills s
            LEFT JOIN skill_categories c ON s.category_id = c.id
            {$whereClause}
            ORDER BY c.sort_order, s.sort_order, s.created_at DESC
        ");
    }
    
    /**
     * Get skill statistics
     */
    public function getStatistics() {
        return [
            'total' => $this->db->fetch("SELECT COUNT(*) as count FROM skills")['count'],
            'active' => $this->db->fetch("SELECT COUNT(*) as count FROM skills WHERE is_active = 1")['count'],
            'featured' => $this->db->fetch("SELECT COUNT(*) as count FROM skills WHERE is_featured = 1")['count'],
            'categories' => $this->db->fetch("SELECT COUNT(*) as count FROM skill_categories WHERE is_active = 1")['count']
        ];
    }
    
    /**
     * Update skill sort order
     */
    public function updateSortOrder($skillId, $newOrder) {
        return $this->db->execute("UPDATE skills SET sort_order = ? WHERE id = ?", [$newOrder, $skillId]);
    }
    
    /**
     * Bulk update skills
     */
    public function bulkUpdate($skillIds, $field, $value) {
        if (empty($skillIds) || !in_array($field, ['is_active', 'is_featured', 'category_id'])) {
            return false;
        }
        
        $placeholders = str_repeat('?,', count($skillIds) - 1) . '?';
        $params = array_merge([$value], $skillIds);
        
        return $this->db->execute(
            "UPDATE skills SET {$field} = ? WHERE id IN ({$placeholders})", 
            $params
        );
    }
    
    /**
     * Get skills grouped by category for display
     */
    public function getSkillsByCategory($activeOnly = true) {
        $whereClause = $activeOnly ? 'WHERE s.is_active = 1 AND c.is_active = 1' : '';
        
        $skills = $this->db->fetchAll("
            SELECT s.*, c.name as category_name, c.color as category_color, c.slug as category_slug
            FROM skills s
            LEFT JOIN skill_categories c ON s.category_id = c.id
            {$whereClause}
            ORDER BY c.sort_order, s.sort_order
        ");
        
        $grouped = [];
        foreach ($skills as $skill) {
            $categorySlug = $skill['category_slug'] ?: 'uncategorized';
            if (!isset($grouped[$categorySlug])) {
                $grouped[$categorySlug] = [
                    'category' => [
                        'name' => $skill['category_name'] ?: 'Uncategorized',
                        'color' => $skill['category_color'] ?: '#6B7280',
                        'slug' => $categorySlug
                    ],
                    'skills' => []
                ];
            }
            $grouped[$categorySlug]['skills'][] = $skill;
        }
        
        return $grouped;
    }
    
    /**
     * Validate skill data
     */
    public function validateSkillData($data) {
        $errors = [];
        
        if (empty($data['name'])) {
            $errors[] = 'Skill name is required';
        }
        
        if (empty($data['category_id'])) {
            $errors[] = 'Category is required';
        }
        
        if (isset($data['skill_level']) && ($data['skill_level'] < 0 || $data['skill_level'] > 100)) {
            $errors[] = 'Skill level must be between 0 and 100';
        }
        
        if (isset($data['years_experience']) && $data['years_experience'] < 0) {
            $errors[] = 'Years of experience cannot be negative';
        }
        
        return $errors;
    }
    
    /**
     * Create new skill
     */
    public function createSkill($data) {
        $errors = $this->validateSkillData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }
        
        $slug = $this->generateUniqueSlug($data['name']);
        $maxOrder = $this->db->fetch(
            "SELECT MAX(sort_order) as max_order FROM skills WHERE category_id = ?", 
            [$data['category_id']]
        )['max_order'] ?? 0;
        
        try {
            $skillId = $this->db->execute(
                "INSERT INTO skills (name, slug, category_id, skill_level, proficiency_level, description, icon, years_experience, color, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['name'],
                    $slug,
                    $data['category_id'],
                    $data['skill_level'] ?? 50,
                    $data['skill_level'] ?? 50,
                    $data['description'] ?? null,
                    $data['icon'] ?? null,
                    $data['years_experience'] ?? null,
                    $data['color'] ?? null,
                    $data['is_featured'] ?? 0,
                    $maxOrder + 1
                ]
            );
            
            return ['success' => true, 'skill_id' => $skillId];
        } catch (Exception $e) {
            return ['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]];
        }
    }
    
    /**
     * Update existing skill
     */
    public function updateSkill($skillId, $data) {
        $errors = $this->validateSkillData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }
        
        $slug = $this->generateUniqueSlug($data['name'], $skillId);
        
        try {
            $this->db->execute(
                "UPDATE skills SET name = ?, slug = ?, category_id = ?, skill_level = ?, proficiency_level = ?, description = ?, icon = ?, years_experience = ?, color = ?, is_featured = ? WHERE id = ?",
                [
                    $data['name'],
                    $slug,
                    $data['category_id'],
                    $data['skill_level'] ?? 50,
                    $data['skill_level'] ?? 50,
                    $data['description'] ?? null,
                    $data['icon'] ?? null,
                    $data['years_experience'] ?? null,
                    $data['color'] ?? null,
                    $data['is_featured'] ?? 0,
                    $skillId
                ]
            );
            
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]];
        }
    }
    
    /**
     * Delete skill
     */
    public function deleteSkill($skillId) {
        try {
            $this->db->execute("DELETE FROM skills WHERE id = ?", [$skillId]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]];
        }
    }
}