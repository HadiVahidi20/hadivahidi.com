<?php
// /templates/sections/footer.php - Fixed Version
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
        $profileData = [
            'name' => trim(($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? ''))
        ];
    }
} catch (Exception $e) {
    error_log('Profile data error in footer template: ' . $e->getMessage());
}

// Set default values if data is not available
$name = $profileData['name'] ?? 'Hadi Vahidi';
$currentYear = date('Y');
?>
<!-- /templates/sections/footer.php -->
<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-logo">
            <div class="logo">HV<span class="logo-dot"></span></div>
        </div>
        <div class="footer-text">
            <p>&copy; <span id="current-year"><?php echo $currentYear; ?></span> <?php echo htmlspecialchars($name); ?>. All rights reserved.</p>
        </div>
        <div class="footer-links">
            <a href="#intro">Home</a>
            <a href="#skills">Skills</a>
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
        </div>
    </div>
    <button class="back-to-top" aria-label="Back to top">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>
</footer>