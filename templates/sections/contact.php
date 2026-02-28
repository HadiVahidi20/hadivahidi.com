<?php
// /templates/sections/contact.php - Fixed Version
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
        // Parse JSON fields
        $socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
        
        // Format social links for display
        $socialLinksArray = [];
        foreach ($socialLinks as $platform => $url) {
            if (!empty($url)) {
                $socialLinksArray[] = [
                    'platform' => $platform,
                    'url' => $url,
                    'icon' => 'fab fa-' . $platform,
                    'label' => ucfirst($platform)
                ];
            }
        }
        
        $profileData = [
            'email' => $profile['email'] ?? '',
            'location' => $profile['location'] ?? '',
            'contact' => [
                'availability' => [
                    'status' => $profile['is_available'] ? 'available' : 'unavailable',
                    'text' => $profile['is_available'] ? 'Available for opportunities' : 'Currently unavailable'
                ]
            ],
            'social_links_array' => $socialLinksArray
        ];
    }
} catch (Exception $e) {
    error_log('Profile data error in contact template: ' . $e->getMessage());
}

// Set default values if data is not available
$email = $profileData['email'] ?? 'hi@hadivahidi.com';
$location = $profileData['location'] ?? 'London, United Kingdom';
$availability = $profileData['contact']['availability']['text'] ?? 'Available for opportunities';
$isAvailable = $profileData['contact']['availability']['status'] ?? 'available';
$socialLinks = $profileData['social_links_array'] ?? [];
?>
<!-- /templates/sections/contact.php -->
<section id="contact" class="contact section">
    <h2 class="section-title">Get In Touch</h2>
    <div class="contact-container">
        <div class="contact-content">
            <div class="contact-text">
                <?php if ($isAvailable === 'available'): ?>
                <p>I'm currently open to new opportunities. Whether you have a question or just want to say hello, I'll get back to you soon!</p>
                <?php else: ?>
                <p>Thank you for your interest! While I'm not currently available for new opportunities, feel free to reach out and I'll get back to you when I can.</p>
                <?php endif; ?>
            </div>
            
            <div class="contact-methods">
                <a href="mailto:<?php echo htmlspecialchars($email); ?>" class="contact-method email">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 6l-10 7-10-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><?php echo htmlspecialchars($email); ?></span>
                </a>
                
                <div class="contact-method location">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><?php echo htmlspecialchars($location); ?></span>
                </div>
                
                <div class="contact-method availability <?php echo $isAvailable; ?>">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <?php if ($isAvailable === 'available'): ?>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <?php else: ?>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <?php endif; ?>
                    </svg>
                    <span><?php echo htmlspecialchars($availability); ?></span>
                </div>
            </div>
            
            <?php if (!empty($socialLinks)): ?>
            <div class="social-links">
                <h3>Connect With Me</h3>
                <div class="social-grid">
                    <?php foreach ($socialLinks as $social): ?>
                    <a href="<?php echo htmlspecialchars($social['url']); ?>" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="social-link <?php echo htmlspecialchars($social['platform']); ?>"
                       aria-label="<?php echo htmlspecialchars($social['label']); ?>">
                        <i class="<?php echo htmlspecialchars($social['icon']); ?>"></i>
                        <span><?php echo htmlspecialchars($social['label']); ?></span>
                    </a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
</section>