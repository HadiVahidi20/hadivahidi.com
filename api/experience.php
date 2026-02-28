<?php
// /api/experience.php
// Experience/Timeline API for frontend integration

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

try {
    // Include Database class
    require_once __DIR__ . '/../admin/includes/Database.php';
    
    // Get database instance
    $db = Database::getInstance();
    
    // Get all active experience items
    $experiences = $db->fetchAll("
        SELECT 
            id,
            title,
            slug,
            company,
            location,
            position,
            employment_type,
            description,
            start_date,
            end_date,
            is_current,
            technologies,
            achievements,
            company_logo,
            company_website,
            is_featured,
            sort_order
        FROM experience_items 
        WHERE is_active = 1 
        ORDER BY start_date DESC, sort_order ASC
    ");
    
    // Transform database data to frontend format
    $formattedExperiences = [];
    foreach ($experiences as $experience) {
        // Parse JSON fields
        $technologies = json_decode($experience['technologies'] ?? '[]', true) ?: [];
        $achievements = json_decode($experience['achievements'] ?? '[]', true) ?: [];
        
        // Calculate duration
        $startDate = new DateTime($experience['start_date']);
        $endDate = $experience['end_date'] ? new DateTime($experience['end_date']) : new DateTime();
        $interval = $startDate->diff($endDate);
        
        // Format duration
        $duration = '';
        if ($interval->y > 0) {
            $duration .= $interval->y . ' year' . ($interval->y > 1 ? 's' : '');
            if ($interval->m > 0) {
                $duration .= ' ' . $interval->m . ' month' . ($interval->m > 1 ? 's' : '');
            }
        } elseif ($interval->m > 0) {
            $duration = $interval->m . ' month' . ($interval->m > 1 ? 's' : '');
        } else {
            $duration = 'Less than a month';
        }
        
        // Format dates
        $startDateFormatted = $startDate->format('M Y');
        $endDateFormatted = $experience['end_date'] ? 
            (new DateTime($experience['end_date']))->format('M Y') : 'Present';
        
        $formattedExperience = [
            'id' => intval($experience['id']),
            'title' => $experience['title'],
            'slug' => $experience['slug'],
            'company' => $experience['company'],
            'location' => $experience['location'],
            'position' => $experience['position'],
            'employment_type' => $experience['employment_type'],
            'description' => $experience['description'],
            'start_date' => $experience['start_date'],
            'end_date' => $experience['end_date'],
            'start_date_formatted' => $startDateFormatted,
            'end_date_formatted' => $endDateFormatted,
            'period' => $startDateFormatted . ' - ' . $endDateFormatted,
            'duration' => $duration,
            'is_current' => boolval($experience['is_current']),
            'is_featured' => boolval($experience['is_featured']),
            'technologies' => $technologies,
            'achievements' => $achievements,
            'company_logo' => $experience['company_logo'],
            'company_website' => $experience['company_website'],
            'sort_order' => intval($experience['sort_order'])
        ];
        
        $formattedExperiences[] = $formattedExperience;
    }
    
    // Group experiences by status for easier frontend consumption
    $groupedExperiences = [
        'current' => [],
        'past' => [],
        'featured' => [],
        'all' => $formattedExperiences
    ];
    
    foreach ($formattedExperiences as $exp) {
        if ($exp['is_current']) {
            $groupedExperiences['current'][] = $exp;
        } else {
            $groupedExperiences['past'][] = $exp;
        }
        
        if ($exp['is_featured']) {
            $groupedExperiences['featured'][] = $exp;
        }
    }
    
    // Get statistics
    $stats = [
        'total' => count($formattedExperiences),
        'current' => count($groupedExperiences['current']),
        'past' => count($groupedExperiences['past']),
        'featured' => count($groupedExperiences['featured']),
        'total_years_experience' => calculateTotalExperience($formattedExperiences)
    ];
    
    // Response format
    $response = [
        'success' => true,
        'data' => [
            'experiences' => $groupedExperiences,
            'timeline' => $formattedExperiences, // Chronological timeline
            'stats' => $stats
        ],
        'meta' => [
            'total_count' => count($formattedExperiences),
            'generated_at' => date('c'),
            'api_version' => '1.0'
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch experience data',
        'message' => $e->getMessage(),
        'data' => []
    ]);
}

/**
 * Calculate total years of experience from all positions
 */
function calculateTotalExperience($experiences) {
    $totalMonths = 0;
    
    foreach ($experiences as $exp) {
        $startDate = new DateTime($exp['start_date']);
        $endDate = $exp['end_date'] ? new DateTime($exp['end_date']) : new DateTime();
        
        $interval = $startDate->diff($endDate);
        $months = ($interval->y * 12) + $interval->m;
        $totalMonths += $months;
    }
    
    $years = floor($totalMonths / 12);
    $months = $totalMonths % 12;
    
    if ($years > 0) {
        return $years + ($months / 12); // Return as decimal years
    } else {
        return round($months / 12, 1);
    }
}
?>