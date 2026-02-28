<?php
// /api/projects.php - Fixed version
// API endpoint to serve projects from database in JSON format compatible with existing frontend

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

require_once __DIR__ . '/../admin/includes/Database.php';

try {
    $db = Database::getInstance();
    
    // Get all active projects with their related data - FIXED QUERY
    $projects = $db->fetchAll("
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.sort_order SEPARATOR ',') as project_images,
               GROUP_CONCAT(DISTINCT CONCAT(pl.link_type, ':', pl.url) ORDER BY pl.sort_order SEPARATOR ',') as project_links,
               GROUP_CONCAT(DISTINCT ph.highlight_text ORDER BY ph.sort_order SEPARATOR ',') as project_highlights
        FROM projects p
        LEFT JOIN project_images pi ON p.id = pi.project_id AND pi.is_active = 1
        LEFT JOIN project_links pl ON p.id = pl.project_id AND pl.is_active = 1  
        LEFT JOIN project_highlights ph ON p.id = ph.project_id AND ph.is_active = 1
        WHERE p.is_active = 1
        GROUP BY p.id
        ORDER BY p.sort_order ASC, p.created_at DESC
    ");
    
    // Transform database data to match the expected JSON structure
    $formattedProjects = [];
    
    foreach ($projects as $project) {
        // Process project images
        $images = [];
        if (!empty($project['project_images'])) {
            $images = array_filter(explode(',', $project['project_images']));
        }
        
        // Process project links
        $links = [];
        if (!empty($project['project_links'])) {
            $linkPairs = explode(',', $project['project_links']);
            foreach ($linkPairs as $linkPair) {
                if (strpos($linkPair, ':') !== false) {
                    list($type, $url) = explode(':', $linkPair, 2);
                    $links[] = [
                        'type' => trim($type),
                        'url' => trim($url)
                    ];
                }
            }
        }
        
        // Process project highlights
        $highlights = [];
        if (!empty($project['project_highlights'])) {
            $highlights = array_filter(array_map('trim', explode(',', $project['project_highlights'])));
        }
        
        // Process technologies
        $technologies = [];
        if (!empty($project['technologies'])) {
            $technologies = array_filter(array_map('trim', explode(',', $project['technologies'])));
        }
        
        // Build the project object in the expected format
        $formattedProject = [
            'id' => (string)$project['id'], // Convert to string to match original format
            'title' => $project['title'] ?: 'Untitled Project',
            'subtitle' => $project['subtitle'] ?: '',
            'description' => $project['description'] ?: '',
            'technologies' => $technologies,
            'size' => $project['size'] ?: 'md', // Default to medium size
            'position' => [
                'top' => $project['position_top'] ?: '',
                'left' => $project['position_left'] ?: ''
            ],
            'thumbnail' => $project['thumbnail'] ?: '',
            'images' => $images,
            'links' => $links,
            'highlights' => $highlights,
            'status' => $project['status'] ?: 'completed',
            'featured' => (bool)$project['is_featured'],
            'view_count' => (int)$project['view_count'],
            'created_at' => $project['created_at'],
            'updated_at' => $project['updated_at']
        ];
        
        $formattedProjects[] = $formattedProject;
    }
    
    // Return in the same format as the original projects.json
    $response = [
        'projects' => $formattedProjects,
        'meta' => [
            'total' => count($formattedProjects),
            'last_updated' => date('Y-m-d H:i:s'),
            'source' => 'database',
            'debug_info' => [
                'raw_projects_count' => count($projects),
                'formatted_projects_count' => count($formattedProjects)
            ]
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Return error in JSON format
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to load projects',
        'details' => $e->getMessage(),
        'file' => __FILE__,
        'line' => __LINE__
    ], JSON_PRETTY_PRINT);
}
?>