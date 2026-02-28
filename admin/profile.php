<?php
// /admin/profile.php
// Complete Profile Management Interface

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/ProfileManager.php';

$db = Database::getInstance();
$profileManager = new ProfileManager($db);
$message = '';
$error = '';
$action = $_GET['action'] ?? 'view';

// Handle AJAX requests
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['ajax_action']) {
        case 'upload_image':
            $result = $profileManager->handleImageUpload($_FILES['profile_image'] ?? null);
            echo json_encode($result);
            exit;
            
        case 'remove_image':
            $result = $profileManager->removeProfileImage();
            echo json_encode($result);
            exit;
            
        case 'update_social_link':
            $platform = $_POST['platform'] ?? '';
            $url = $_POST['url'] ?? '';
            $result = $profileManager->updateSocialLink($platform, $url);
            echo json_encode($result);
            exit;
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['ajax_action'])) {
    try {
        // Get form data
        $profileData = [
            'first_name' => trim($_POST['first_name'] ?? ''),
            'last_name' => trim($_POST['last_name'] ?? ''),
            'professional_title' => trim($_POST['professional_title'] ?? ''),
            'location' => trim($_POST['location'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'phone' => trim($_POST['phone'] ?? ''),
            'website' => trim($_POST['website'] ?? ''),
            'bio' => trim($_POST['bio'] ?? ''),
            'about' => trim($_POST['about'] ?? ''),
            'meta_title' => trim($_POST['meta_title'] ?? ''),
            'meta_description' => trim($_POST['meta_description'] ?? ''),
            'meta_keywords' => trim($_POST['meta_keywords'] ?? ''),
            'is_available' => isset($_POST['is_available']) ? 1 : 0,
        ];
        
        // Handle social links
        $socialLinks = [];
        $socialPlatforms = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'behance', 'dribbble'];
        foreach ($socialPlatforms as $platform) {
            if (!empty($_POST["social_{$platform}"])) {
                $socialLinks[$platform] = trim($_POST["social_{$platform}"]);
            }
        }
        $profileData['social_links'] = json_encode($socialLinks);
        
        // Handle skills highlights
        $skillsHighlights = [];
        if (!empty($_POST['skills_highlights'])) {
            $highlights = explode(',', $_POST['skills_highlights']);
            foreach ($highlights as $highlight) {
                $highlight = trim($highlight);
                if ($highlight) {
                    $skillsHighlights[] = $highlight;
                }
            }
        }
        $profileData['skills_highlights'] = json_encode($skillsHighlights);
        
        if ($action === 'edit') {
            $result = $profileManager->updateProfile($profileData);
            if ($result['success']) {
                $message = 'Profile updated successfully!';
                header('Location: profile.php?action=view&message=' . urlencode($message));
                exit;
            } else {
                $error = implode('<br>', $result['errors']);
            }
        }
        
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}

// Get current profile data
$profile = $profileManager->getProfile();
$socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
$skillsHighlights = json_decode($profile['skills_highlights'] ?? '[]', true) ?: [];

// Handle messages
if (isset($_GET['message'])) {
    $message = $_GET['message'];
}
if (isset($_GET['error'])) {
    $error = $_GET['error'];
}

$pageTitle = match($action) {
    'edit' => 'Edit Profile',
    default => 'Profile Information'
};

$currentPage = "profile";

// Get user info for sidebar
$user = $db->fetch("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> - Portfolio Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-semibold text-gray-900"><?php echo htmlspecialchars($pageTitle); ?></h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="../index.php" class="text-gray-500 hover:text-gray-700" target="_blank">
                        <i class="fas fa-external-link-alt mr-1"></i>
                        View Portfolio
                    </a>
                    <a href="logout.php" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-sign-out-alt mr-1"></i>
                        Logout
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-user-circle text-white"></i>
                    </div>
                    <div>
                        <h2 class="font-semibold text-gray-900"><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h2>
                        <p class="text-sm text-gray-500">Administrator</p>
                    </div>
                </div>
                
                <nav class="space-y-2">
                    <a href="index.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-chart-bar mr-3"></i>
                        Dashboard
                    </a>
                    <a href="projects.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-folder mr-3"></i>
                        Projects
                    </a>
                    <a href="skills.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-code mr-3"></i>
                        Skills
                    </a>
                    <a href="experience.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-briefcase mr-3"></i>
                        Experience
                    </a>
                    <a href="profile.php" class="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                        <i class="fas fa-user mr-3"></i>
                        Profile
                    </a>
                    <a href="settings.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-cog mr-3"></i>
                        Settings
                    </a>
                </nav>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8">
            <?php if ($message): ?>
            <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                <i class="fas fa-check-circle mr-2"></i>
                <?php echo htmlspecialchars($message); ?>
            </div>
            <?php endif; ?>

            <?php if ($error): ?>
            <div class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <?php echo $error; ?>
            </div>
            <?php endif; ?>

            <?php if ($action === 'view'): ?>
            <!-- Profile View Mode -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
                    <a href="profile.php?action=edit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        <i class="fas fa-edit mr-2"></i>
                        Edit Profile
                    </a>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Personal Information -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            
                            <!-- Profile Image -->
                            <div class="mb-6 flex items-center space-x-4">
                                <?php if (!empty($profile['profile_image'])): ?>
                                <img src="../<?php echo htmlspecialchars($profile['profile_image']); ?>" alt="Profile" class="w-20 h-20 rounded-full object-cover">
                                <?php else: ?>
                                <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-gray-400 text-2xl"></i>
                                </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <p class="text-gray-900"><?php echo htmlspecialchars(($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? '')); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                                    <p class="text-gray-900"><?php echo htmlspecialchars($profile['professional_title'] ?? 'Not specified'); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <p class="text-gray-900"><?php echo htmlspecialchars($profile['location'] ?? 'Not specified'); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p class="text-gray-900"><?php echo htmlspecialchars($profile['email'] ?? 'Not specified'); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <p class="text-gray-900"><?php echo htmlspecialchars($profile['phone'] ?? 'Not specified'); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <p class="text-gray-900">
                                        <?php if (!empty($profile['website'])): ?>
                                        <a href="<?php echo htmlspecialchars($profile['website']); ?>" target="_blank" class="text-primary-600 hover:text-primary-700">
                                            <?php echo htmlspecialchars($profile['website']); ?>
                                        </a>
                                        <?php else: ?>
                                        Not specified
                                        <?php endif; ?>
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                    <p class="text-gray-900">
                                        <?php if ($profile['is_available']): ?>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <i class="fas fa-check mr-1"></i>
                                            Available for opportunities
                                        </span>
                                        <?php else: ?>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <i class="fas fa-times mr-1"></i>
                                            Not available
                                        </span>
                                        <?php endif; ?>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bio & About -->
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Biography</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                                    <p class="text-gray-900 text-sm leading-relaxed"><?php echo nl2br(htmlspecialchars($profile['bio'] ?? 'No bio specified')); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                                    <p class="text-gray-900 text-sm leading-relaxed"><?php echo nl2br(htmlspecialchars($profile['about'] ?? 'No detailed information specified')); ?></p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
                                    <?php if (!empty($skillsHighlights)): ?>
                                    <div class="flex flex-wrap gap-2">
                                        <?php foreach ($skillsHighlights as $skill): ?>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                            <?php echo htmlspecialchars($skill); ?>
                                        </span>
                                        <?php endforeach; ?>
                                    </div>
                                    <?php else: ?>
                                    <p class="text-gray-900">No key skills specified</p>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <?php if (!empty($socialLinks)): ?>
                    <div class="mt-8 border-t border-gray-200 pt-8">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <?php foreach ($socialLinks as $platform => $url): ?>
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <i class="fab fa-<?php echo htmlspecialchars($platform); ?> text-gray-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 capitalize"><?php echo htmlspecialchars($platform); ?></p>
                                    <a href="<?php echo htmlspecialchars($url); ?>" target="_blank" class="text-xs text-primary-600 hover:text-primary-700">View Profile</a>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- SEO Information -->
                    <div class="mt-8 border-t border-gray-200 pt-8">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <p class="text-gray-900 text-sm"><?php echo htmlspecialchars($profile['meta_title'] ?? 'Not specified'); ?></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <p class="text-gray-900 text-sm"><?php echo htmlspecialchars($profile['meta_description'] ?? 'Not specified'); ?></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                                <p class="text-gray-900 text-sm"><?php echo htmlspecialchars($profile['meta_keywords'] ?? 'Not specified'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <?php elseif ($action === 'edit'): ?>
            <!-- Profile Edit Mode -->
            <form method="POST" enctype="multipart/form-data" class="space-y-6">
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900">Edit Profile</h2>
                    </div>
                    
                    <div class="p-6">
                        <!-- Profile Image Upload -->
                        <div class="mb-8">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                            <div class="flex items-center space-x-6">
                                <div class="profile-image-container">
                                    <?php if (!empty($profile['profile_image'])): ?>
                                    <img src="../<?php echo htmlspecialchars($profile['profile_image']); ?>" alt="Profile" class="w-24 h-24 rounded-full object-cover" id="profile-preview">
                                    <?php else: ?>
                                    <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center" id="profile-preview">
                                        <i class="fas fa-user text-gray-400 text-2xl"></i>
                                    </div>
                                    <?php endif; ?>
                                </div>
                                <div>
                                    <input type="file" name="profile_image" id="profile_image" accept="image/*" class="hidden">
                                    <button type="button" onclick="document.getElementById('profile_image').click()" class="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <i class="fas fa-upload mr-2"></i>
                                        Upload Image
                                    </button>
                                    <?php if (!empty($profile['profile_image'])): ?>
                                    <button type="button" onclick="removeProfileImage()" class="ml-3 text-red-600 hover:text-red-700 text-sm">
                                        <i class="fas fa-trash mr-1"></i>
                                        Remove
                                    </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Personal Information -->
                            <div>
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <input type="text" name="first_name" id="first_name" value="<?php echo htmlspecialchars($profile['first_name'] ?? ''); ?>" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        </div>
                                        
                                        <div>
                                            <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <input type="text" name="last_name" id="last_name" value="<?php echo htmlspecialchars($profile['last_name'] ?? ''); ?>" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label for="professional_title" class="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                                        <input type="text" name="professional_title" id="professional_title" value="<?php echo htmlspecialchars($profile['professional_title'] ?? ''); ?>" placeholder="e.g., Full Stack Developer, UI/UX Designer" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input type="text" name="location" id="location" value="<?php echo htmlspecialchars($profile['location'] ?? ''); ?>" placeholder="e.g., New York, NY" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" id="email" value="<?php echo htmlspecialchars($profile['email'] ?? ''); ?>" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="tel" name="phone" id="phone" value="<?php echo htmlspecialchars($profile['phone'] ?? ''); ?>" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label for="website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                        <input type="url" name="website" id="website" value="<?php echo htmlspecialchars($profile['website'] ?? ''); ?>" placeholder="https://yourwebsite.com" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="is_available" value="1" <?php echo ($profile['is_available'] ?? 0) ? 'checked' : ''; ?> class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                            <span class="ml-2 text-sm text-gray-700">Available for opportunities</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bio & About -->
                            <div>
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Biography</h3>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                                        <textarea name="bio" id="bio" rows="3" placeholder="Brief introduction or tagline" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"><?php echo htmlspecialchars($profile['bio'] ?? ''); ?></textarea>
                                        <p class="text-xs text-gray-500 mt-1">Keep it concise (2-3 sentences)</p>
                                    </div>
                                    
                                    <div>
                                        <label for="about" class="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                                        <textarea name="about" id="about" rows="6" placeholder="Detailed description of your background, experience, and goals" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"><?php echo htmlspecialchars($profile['about'] ?? ''); ?></textarea>
                                    </div>
                                    
                                    <div>
                                        <label for="skills_highlights" class="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
                                        <input type="text" name="skills_highlights" id="skills_highlights" value="<?php echo htmlspecialchars(implode(', ', $skillsHighlights)); ?>" placeholder="React, Node.js, Python, Design" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <p class="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Social Media Links -->
                        <div class="mt-8 border-t border-gray-200 pt-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <?php
                                $socialPlatforms = [
                                    'linkedin' => 'LinkedIn',
                                    'github' => 'GitHub',
                                    'twitter' => 'Twitter',
                                    'instagram' => 'Instagram',
                                    'facebook' => 'Facebook',
                                    'youtube' => 'YouTube',
                                    'behance' => 'Behance',
                                    'dribbble' => 'Dribbble'
                                ];
                                
                                foreach ($socialPlatforms as $platform => $label):
                                ?>
                                <div>
                                    <label for="social_<?php echo $platform; ?>" class="block text-sm font-medium text-gray-700 mb-1">
                                        <i class="fab fa-<?php echo $platform; ?> mr-2"></i>
                                        <?php echo $label; ?>
                                    </label>
                                    <input type="url" name="social_<?php echo $platform; ?>" id="social_<?php echo $platform; ?>" value="<?php echo htmlspecialchars($socialLinks[$platform] ?? ''); ?>" placeholder="https://<?php echo $platform; ?>.com/username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        
                        <!-- SEO Settings -->
                        <div class="mt-8 border-t border-gray-200 pt-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                            <div class="space-y-4">
                                <div>
                                    <label for="meta_title" class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <input type="text" name="meta_title" id="meta_title" value="<?php echo htmlspecialchars($profile['meta_title'] ?? ''); ?>" placeholder="Your Name - Professional Title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <p class="text-xs text-gray-500 mt-1">Recommended length: 50-60 characters</p>
                                </div>
                                
                                <div>
                                    <label for="meta_description" class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea name="meta_description" id="meta_description" rows="2" placeholder="Brief description of your portfolio and skills" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"><?php echo htmlspecialchars($profile['meta_description'] ?? ''); ?></textarea>
                                    <p class="text-xs text-gray-500 mt-1">Recommended length: 150-160 characters</p>
                                </div>
                                
                                <div>
                                    <label for="meta_keywords" class="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                                    <input type="text" name="meta_keywords" id="meta_keywords" value="<?php echo htmlspecialchars($profile['meta_keywords'] ?? ''); ?>" placeholder="web developer, react, javascript, portfolio" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <p class="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Form Actions -->
                <div class="flex justify-between">
                    <a href="profile.php?action=view" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Cancel
                    </a>
                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                        <i class="fas fa-save mr-2"></i>
                        Save Changes
                    </button>
                </div>
            </form>
            <?php endif; ?>
        </main>
    </div>

    <script>
    // Image upload preview
    document.getElementById('profile_image')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('profile-preview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-24 h-24 rounded-full object-cover">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove profile image
    function removeProfileImage() {
        if (confirm('Are you sure you want to remove the profile image?')) {
            fetch('profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'ajax_action=remove_image'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to remove image: ' + data.message);
                }
            });
        }
    }
    </script>
</body>
</html>