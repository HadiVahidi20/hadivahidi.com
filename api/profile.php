<?php
// /api/profile.php
// Profile API for frontend integration

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

try {
    // Include required files
    require_once __DIR__ . '/../admin/includes/Database.php';
    require_once __DIR__ . '/../admin/includes/ProfileManager.php';
    
    // Get database instance
    $db = Database::getInstance();
    $profileManager = new ProfileManager($db);
    
    // Get profile data formatted for frontend
    $profileData = $profileManager->exportForFrontend();
    
    // Add additional computed fields for frontend use
    $response = [
        'success' => true,
        'data' => [
            // Personal Information
            'name' => $profileData['personal_info']['full_name'] ?: 'Portfolio Owner',
            'first_name' => $profileData['personal_info']['first_name'],
            'last_name' => $profileData['personal_info']['last_name'],
            'title' => $profileData['personal_info']['professional_title'] ?: 'Professional',
            'location' => $profileData['personal_info']['location'],
            'email' => $profileData['personal_info']['email'],
            'phone' => $profileData['personal_info']['phone'],
            'website' => $profileData['personal_info']['website'],
            'profile_image' => $profileData['personal_info']['profile_image'],
            'is_available' => $profileData['personal_info']['is_available'],
            
            // Biography
            'bio' => $profileData['bio']['short_bio'] ?: 'Passionate professional with expertise in modern technologies.',
            'about' => $profileData['bio']['about'] ?: 'Welcome to my portfolio. I am dedicated to creating exceptional digital experiences.',
            'skills_highlights' => $profileData['bio']['skills_highlights'],
            
            // Social Media Links
            'social_links' => $profileData['social_links'],
            
            // SEO Data
            'meta' => [
                'title' => $profileData['seo']['meta_title'] ?: ($profileData['personal_info']['full_name'] . ' - ' . $profileData['personal_info']['professional_title']),
                'description' => $profileData['seo']['meta_description'] ?: $profileData['bio']['short_bio'],
                'keywords' => $profileData['seo']['meta_keywords'] ?: implode(', ', $profileData['bio']['skills_highlights'])
            ],
            
            // Contact Information (formatted for contact sections)
            'contact' => [
                'email' => $profileData['personal_info']['email'],
                'phone' => $profileData['personal_info']['phone'],
                'location' => $profileData['personal_info']['location'],
                'website' => $profileData['personal_info']['website'],
                'availability' => [
                    'status' => $profileData['personal_info']['is_available'] ? 'available' : 'unavailable',
                    'text' => $profileData['personal_info']['is_available'] 
                        ? 'Available for opportunities' 
                        : 'Currently unavailable'
                ]
            ],
            
            // Additional frontend-friendly fields
            'display' => [
                'hero_title' => $profileData['personal_info']['full_name'] ?: 'Portfolio',
                'hero_subtitle' => $profileData['personal_info']['professional_title'] ?: 'Professional Portfolio',
                'hero_description' => $profileData['bio']['short_bio'] ?: 'Welcome to my portfolio',
                'avatar_url' => $profileData['personal_info']['profile_image'] 
                    ? '/' . $profileData['personal_info']['profile_image'] 
                    : null,
                'full_title' => trim(
                    ($profileData['personal_info']['full_name'] ?: '') . 
                    ($profileData['personal_info']['professional_title'] ? ' - ' . $profileData['personal_info']['professional_title'] : '')
                ) ?: 'Portfolio'
            ]
        ],
        'meta' => [
            'last_updated' => $profileData['updated_at'],
            'api_version' => '1.0',
            'generated_at' => date('c')
        ]
    ];
    
    // Add social links in array format for easier frontend iteration
    $socialLinksArray = [];
    if (!empty($profileData['social_links'])) {
        foreach ($profileData['social_links'] as $platform => $url) {
            $socialLinksArray[] = [
                'platform' => $platform,
                'url' => $url,
                'icon' => 'fab fa-' . $platform,
                'label' => ucfirst($platform)
            ];
        }
    }
    $response['data']['social_links_array'] = $socialLinksArray;
    
    // Output JSON response
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    // Handle errors gracefully
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'API Error',
        'message' => 'Failed to retrieve profile data',
        'debug' => $_GET['debug'] ?? false ? $e->getMessage() : null,
        'meta' => [
            'api_version' => '1.0',
            'generated_at' => date('c')
        ]
    ], JSON_PRETTY_PRINT);
    
    // Log error for debugging
    error_log("Profile API Error: " . $e->getMessage());
}
?>