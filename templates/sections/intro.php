<?php
// /templates/sections/intro.php - Fixed Version
// Direct database access instead of API call

$profileData = null;
try {
    // Include required classes
    require_once __DIR__ . '/../../admin/includes/Database.php';
    require_once __DIR__ . '/../../admin/includes/ProfileManager.php';
    
    $db = Database::getInstance();
    $profileManager = new ProfileManager($db);
    
    // Get profile data directly
    $profile = $profileManager->getProfile();
    
    if ($profile) {
        // Format data similar to API response
        $socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
        $skillsHighlights = json_decode($profile['skills_highlights'] ?? '[]', true) ?: [];
        
        $profileData = [
            'name' => trim(($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? '')),
            'title' => $profile['professional_title'] ?? '',
            'bio' => $profile['bio'] ?? '',
            'contact' => [
                'availability' => [
                    'status' => $profile['is_available'] ? 'available' : 'unavailable'
                ]
            ]
        ];
    }
} catch (Exception $e) {
    error_log('Profile data error in intro template: ' . $e->getMessage());
}

// Set default values if data is not available
$name = $profileData['name'] ?? 'Hadi Vahidi';
$title = $profileData['title'] ?? 'Front-End Developer';
$bio = $profileData['bio'] ?? 'I focus on creating exceptional digital experiences with clean code and intuitive user interfaces. Currently crafting accessible, human-centered web applications.';
$isAvailable = $profileData['contact']['availability']['status'] ?? 'available';
?>
<!-- /templates/sections/intro.php -->
<section id="intro" class="intro section">
    <div class="intro-content">
        <div class="logo">
            <span>HV</span>
            <span class="logo-dot"></span>
        </div>
        <h1 class="name"><?php echo htmlspecialchars($name); ?></h1>
        <h2 class="role"><?php echo htmlspecialchars($title); ?></h2>
        <div class="typing-container">
            <p class="typing-text">I build <span class="typing"></span></p>
        </div>
        <p class="bio"><?php echo htmlspecialchars($bio); ?></p>
        
        <?php if ($isAvailable === 'available'): ?>
        <div class="availability-status">
            <span class="status-indicator available"></span>
            <span class="status-text">Available for opportunities</span>
        </div>
        <?php endif; ?>
        
        <div class="cta">
            <a href="#work" class="btn">View My Work</a>
            <a href="#contact" class="btn btn-outline">Contact Me</a>
        </div>
        
        <div class="scroll-indicator" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Scroll to explore</span>
        </div>
    </div>
    <div class="canvas-container">
        <canvas id="particles"></canvas>
    </div>
</section>