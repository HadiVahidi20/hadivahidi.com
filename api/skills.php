<?php
// /api/skills.php
// Production Skills API - Based on successful diagnostic

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

try {
    // Include Database class (we know this path works from diagnostic)
    require_once __DIR__ . '/../admin/includes/Database.php';
    
    // Get database instance
    $db = Database::getInstance();
    
    // Get skills with categories
    $skills = $db->fetchAll("
        SELECT 
            s.id,
            s.name,
            s.slug,
            s.category_id,
            s.skill_level,
            s.proficiency_level,
            s.description,
            s.icon,
            s.years_experience,
            s.is_featured,
            s.color,
            c.name as category_name,
            c.color as category_color,
            c.slug as category_slug
        FROM skills s
        LEFT JOIN skill_categories c ON s.category_id = c.id
        WHERE s.is_active = 1 AND c.is_active = 1
        ORDER BY c.sort_order ASC, s.sort_order ASC
    ");
    
    // Transform database data to frontend format
    $formattedSkills = [];
    foreach ($skills as $skill) {
        // Use skill_level or proficiency_level, whichever is higher/available
        $skillLevel = max(
            intval($skill['skill_level'] ?? 0),
            intval($skill['proficiency_level'] ?? 0)
        );
        
        // Ensure minimum skill level of 10%
        $skillLevel = max($skillLevel, 10);
        
        // Calculate size based on proficiency level (30-50 range for visual appeal)
        $size = 30 + ($skillLevel * 0.3);
        
        // Map database categories to frontend groups
        $categorySlug = strtolower($skill['category_slug'] ?? '');
        $group = 'tools'; // default
        
        if (strpos($categorySlug, 'frontend') !== false) {
            $group = 'frontend';
        } elseif (strpos($categorySlug, 'backend') !== false) {
            $group = 'backend';
        } elseif (strpos($categorySlug, 'tools') !== false) {
            $group = 'tools';
        }
        
        $formattedSkill = [
            'id' => intval($skill['id']),
            'name' => $skill['name'],
            'level' => $skillLevel . '%',
            'group' => $group,
            'description' => $skill['description'] ?: 'Professional experience with ' . $skill['name'],
            'size' => round($size, 1),
            'category' => $skill['category_name'] ?: 'General',
            'category_color' => $skill['category_color'] ?: '#6B7280',
            'category_slug' => $skill['category_slug'] ?: 'general',
            'icon' => $skill['icon'],
            'years_experience' => $skill['years_experience'] ? floatval($skill['years_experience']) : null,
            'is_featured' => boolval($skill['is_featured']),
            'color' => $skill['color'] ?: $skill['category_color'] ?: '#6B7280'
        ];
        
        $formattedSkills[] = $formattedSkill;
    }
    
    // Generate relationships between skills
    $relationships = [];
    
    // Create relationships within the same group
    $skillsByGroup = [];
    foreach ($formattedSkills as $skill) {
        $skillsByGroup[$skill['group']][] = $skill;
    }
    
    foreach ($skillsByGroup as $group => $groupSkills) {
        for ($i = 0; $i < count($groupSkills); $i++) {
            for ($j = $i + 1; $j < count($groupSkills); $j++) {
                $skill1 = $groupSkills[$i];
                $skill2 = $groupSkills[$j];
                
                // Base strength for same group
                $strength = 0.6;
                
                // Check for specific strong relationships
                $name1 = strtolower($skill1['name']);
                $name2 = strtolower($skill2['name']);
                
                // Define strong relationships
                if (($name1 === 'javascript' && $name2 === 'react') ||
                    ($name1 === 'react' && $name2 === 'javascript')) {
                    $strength = 0.8;
                } elseif ((strpos($name1, 'html') !== false && strpos($name2, 'css') !== false) ||
                          (strpos($name1, 'css') !== false && strpos($name2, 'html') !== false)) {
                    $strength = 0.9;
                } elseif ((strpos($name1, 'php') !== false && strpos($name2, 'mysql') !== false) ||
                          (strpos($name1, 'mysql') !== false && strpos($name2, 'php') !== false)) {
                    $strength = 0.8;
                } elseif ((strpos($name1, 'node') !== false && strpos($name2, 'express') !== false) ||
                          (strpos($name1, 'express') !== false && strpos($name2, 'node') !== false)) {
                    $strength = 0.9;
                }
                
                $relationships[] = [
                    'source' => $skill1['name'],
                    'target' => $skill2['name'],
                    'strength' => $strength
                ];
            }
        }
    }
    
    // Get categories for metadata
    $categories = $db->fetchAll("
        SELECT id, name, slug, color, description 
        FROM skill_categories 
        WHERE is_active = 1 
        ORDER BY sort_order ASC
    ");
    
    $formattedCategories = [];
    foreach ($categories as $cat) {
        $formattedCategories[] = [
            'id' => intval($cat['id']),
            'name' => $cat['name'],
            'slug' => $cat['slug'],
            'color' => $cat['color'],
            'description' => $cat['description']
        ];
    }
    
    // Prepare response
    $response = [
        'error' => false,
        'skills' => $formattedSkills,
        'relationships' => $relationships,
        'categories' => $formattedCategories,
        'meta' => [
            'total_skills' => count($formattedSkills),
            'featured_skills' => count(array_filter($formattedSkills, function($s) { return $s['is_featured']; })),
            'total_categories' => count($formattedCategories),
            'generated_at' => date('c'),
            'source' => 'database'
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to fetch skills data',
        'details' => $e->getMessage(),
        'skills' => [],
        'relationships' => [],
        'meta' => [
            'source' => 'error',
            'generated_at' => date('c')
        ]
    ], JSON_PRETTY_PRINT);
}
?>