<?php
// /admin/index.php
// Complete dashboard with all modules including Profile integration

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/ProfileManager.php';

// Get user information
$db = Database::getInstance();
$user = $db->fetch("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);

// Get all dashboard statistics
$projectsCount = $db->fetch("SELECT COUNT(*) as count FROM projects WHERE is_active = 1")['count'] ?? 0;
$skillsCount = $db->fetch("SELECT COUNT(*) as count FROM skills WHERE is_active = 1")['count'] ?? 0;
$experienceCount = $db->fetch("SELECT COUNT(*) as count FROM experience_items WHERE is_active = 1")['count'] ?? 0;

// Get profile statistics
$profileManager = new ProfileManager($db);
$profileStats = $profileManager->getStatistics();
$profileCompletion = $profileStats['profile_completed'] ?? 0;

// Get recent activity data
$recentProjects = $db->fetchAll("
    SELECT id, title, thumbnail, status, created_at 
    FROM projects 
    WHERE is_active = 1 
    ORDER BY created_at DESC 
    LIMIT 5
");

$recentSkills = $db->fetchAll("
    SELECT s.id, s.name, s.skill_level, c.name as category_name, s.created_at
    FROM skills s
    LEFT JOIN skill_categories c ON s.category_id = c.id
    WHERE s.is_active = 1 
    ORDER BY s.created_at DESC 
    LIMIT 5
");

$recentExperience = $db->fetchAll("
    SELECT id, title, company, position, start_date, end_date, is_current
    FROM experience_items 
    WHERE is_active = 1 
    ORDER BY created_at DESC 
    LIMIT 4
");

// Calculate some quick stats
$totalActiveItems = $projectsCount + $skillsCount + $experienceCount;
$completedItems = [
    'projects' => $projectsCount > 0,
    'skills' => $skillsCount > 0, 
    'experience' => $experienceCount > 0,
    'profile' => $profileCompletion >= 80
];
$overallCompletion = round((array_sum($completedItems) / count($completedItems)) * 100);

$pageTitle = "Dashboard";
$currentPage = "dashboard";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - Portfolio Admin</title>
    <link rel="icon" href="../assets/images/favicon.png">
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Tailwind Config -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
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
    <div class="flex h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm border-r border-gray-200">
            <div class="flex flex-col h-full">
                <!-- Logo/Brand -->
                <div class="flex items-center px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-layer-group text-white text-sm"></i>
                        </div>
                        <span class="ml-3 text-lg font-semibold text-gray-900">Portfolio Admin</span>
                    </div>
                </div>
                
                <!-- User Profile Section -->
                <div class="px-6 py-4 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-primary-600"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">
                                <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?>
                            </h3>
                            <p class="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>
                
                <!-- Navigation -->
                <nav class="flex-1 px-4 py-6 space-y-2">
                    <a href="index.php" class="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                        <i class="fas fa-chart-bar mr-3 text-primary-500"></i>
                        Dashboard
                    </a>
                    <a href="projects.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-folder mr-3"></i>
                        Projects
                        <span class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"><?php echo $projectsCount; ?></span>
                    </a>
                    <a href="skills.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-code mr-3"></i>
                        Skills
                        <span class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"><?php echo $skillsCount; ?></span>
                    </a>
                    <a href="experience.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-briefcase mr-3"></i>
                        Experience
                        <span class="ml-auto bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"><?php echo $experienceCount; ?></span>
                    </a>
                    <a href="profile.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-user mr-3"></i>
                        Profile
                        <?php if ($profileCompletion < 80): ?>
                        <span class="ml-auto bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full"><?php echo $profileCompletion; ?>%</span>
                        <?php else: ?>
                        <span class="ml-auto bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                            <i class="fas fa-check text-xs"></i>
                        </span>
                        <?php endif; ?>
                    </a>
                    <a href="settings.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-cog mr-3"></i>
                        Settings
                    </a>
                </nav>
                
                <!-- Footer -->
                <div class="p-4 border-t border-gray-100">
                    <a href="logout.php" class="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        Logout
                    </a>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Top Header -->
            <header class="bg-white border-b border-gray-200 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p class="text-sm text-gray-600 mt-1">
                            Welcome back, <?php echo htmlspecialchars($user['first_name'] ?? $user['username']); ?>! 
                            Manage your portfolio content from here.
                        </p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <a href="../index.php" target="_blank" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            View Portfolio
                        </a>
                        <a href="projects.php?action=add" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Add Project
                        </a>
                    </div>
                </div>
            </header>
            
            <!-- Dashboard Content -->
            <main class="flex-1 overflow-y-auto p-6">
                
                <!-- Overview Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Projects Card -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Projects</p>
                                <p class="text-2xl font-bold text-gray-900 mt-1"><?php echo $projectsCount; ?></p>
                                <p class="text-xs text-green-600 mt-1 flex items-center">
                                    <i class="fas fa-arrow-up mr-1"></i>
                                    Active projects
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-folder-open text-blue-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <a href="projects.php" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Manage Projects →
                            </a>
                        </div>
                    </div>
                    
                    <!-- Skills Card -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Skills</p>
                                <p class="text-2xl font-bold text-gray-900 mt-1"><?php echo $skillsCount; ?></p>
                                <p class="text-xs text-green-600 mt-1 flex items-center">
                                    <i class="fas fa-chart-line mr-1"></i>
                                    Active skills
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-code text-green-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <a href="skills.php" class="text-sm text-green-600 hover:text-green-800 font-medium">
                                Manage Skills →
                            </a>
                        </div>
                    </div>
                    
                    <!-- Experience Card -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Experience</p>
                                <p class="text-2xl font-bold text-gray-900 mt-1"><?php echo $experienceCount; ?></p>
                                <p class="text-xs text-blue-600 mt-1 flex items-center">
                                    <i class="fas fa-briefcase mr-1"></i>
                                    Career entries
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-briefcase text-orange-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <a href="experience.php" class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                                Manage Experience →
                            </a>
                        </div>
                    </div>
                    
                    <!-- Profile Completion Card -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Profile Completion</p>
                                <p class="text-2xl font-bold text-gray-900 mt-1"><?php echo $profileCompletion; ?>%</p>
                                <p class="text-xs mt-1 flex items-center">
                                    <?php if ($profileCompletion >= 80): ?>
                                    <span class="text-green-600"><i class="fas fa-check mr-1"></i> Excellent!</span>
                                    <?php elseif ($profileCompletion >= 60): ?>
                                    <span class="text-yellow-600"><i class="fas fa-clock mr-1"></i> Good progress</span>
                                    <?php else: ?>
                                    <span class="text-red-600"><i class="fas fa-exclamation mr-1"></i> Needs attention</span>
                                    <?php endif; ?>
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-user text-purple-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: <?php echo $profileCompletion; ?>%"></div>
                            </div>
                            <a href="profile.php" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
                                Complete Profile →
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity & Quick Actions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Recent Activity -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <p class="text-sm text-gray-600">Latest updates across all modules</p>
                        </div>
                        
                        <div class="p-6">
                            <!-- Recent Projects -->
                            <?php if (!empty($recentProjects)): ?>
                            <div class="mb-6">
                                <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                    <i class="fas fa-folder text-blue-500 mr-2"></i>
                                    Recent Projects
                                </h4>
                                <div class="space-y-2">
                                    <?php foreach (array_slice($recentProjects, 0, 3) as $project): ?>
                                    <div class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div class="flex items-center space-x-3">
                                            <?php if (!empty($project['thumbnail'])): ?>
                                            <img src="../<?php echo htmlspecialchars($project['thumbnail']); ?>" alt="" class="w-8 h-8 rounded object-cover">
                                            <?php else: ?>
                                            <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                                <i class="fas fa-image text-blue-600 text-xs"></i>
                                            </div>
                                            <?php endif; ?>
                                            <div>
                                                <p class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($project['title']); ?></p>
                                                <p class="text-xs text-gray-500"><?php echo date('M j, Y', strtotime($project['created_at'])); ?></p>
                                            </div>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full <?php echo $project['status'] === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'; ?>">
                                            <?php echo ucfirst($project['status']); ?>
                                        </span>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <?php endif; ?>
                            
                            <!-- Recent Skills -->
                            <?php if (!empty($recentSkills)): ?>
                            <div class="mb-6">
                                <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                    <i class="fas fa-code text-green-500 mr-2"></i>
                                    Recent Skills
                                </h4>
                                <div class="space-y-2">
                                    <?php foreach (array_slice($recentSkills, 0, 3) as $skill): ?>
                                    <div class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($skill['name']); ?></p>
                                            <p class="text-xs text-gray-500"><?php echo htmlspecialchars($skill['category_name'] ?? 'No category'); ?></p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm font-medium text-gray-900"><?php echo $skill['skill_level']; ?>%</p>
                                            <div class="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                                <div class="bg-green-500 h-1 rounded-full" style="width: <?php echo $skill['skill_level']; ?>%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <?php endif; ?>
                            
                            <!-- Recent Experience -->
                            <?php if (!empty($recentExperience)): ?>
                            <div>
                                <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                    <i class="fas fa-briefcase text-orange-500 mr-2"></i>
                                    Recent Experience
                                </h4>
                                <div class="space-y-2">
                                    <?php foreach (array_slice($recentExperience, 0, 2) as $exp): ?>
                                    <div class="py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($exp['title']); ?></p>
                                                <p class="text-xs text-gray-600"><?php echo htmlspecialchars($exp['company']); ?></p>
                                            </div>
                                            <?php if ($exp['is_current']): ?>
                                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Current</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Quick Actions & System Status -->
                    <div class="space-y-6">
                        <!-- Quick Actions -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div class="p-6 border-b border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                <p class="text-sm text-gray-600">Frequently used actions</p>
                            </div>
                            
                            <div class="p-6">
                                <div class="grid grid-cols-2 gap-4">
                                    <a href="projects.php?action=add" class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                                        <i class="fas fa-plus text-2xl text-gray-400 group-hover:text-blue-500 mb-2"></i>
                                        <span class="text-sm font-medium text-gray-600 group-hover:text-blue-600">Add Project</span>
                                    </a>
                                    
                                    <a href="skills.php?action=add" class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
                                        <i class="fas fa-code text-2xl text-gray-400 group-hover:text-green-500 mb-2"></i>
                                        <span class="text-sm font-medium text-gray-600 group-hover:text-green-600">Add Skill</span>
                                    </a>
                                    
                                    <a href="experience.php?action=add" class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group">
                                        <i class="fas fa-briefcase text-2xl text-gray-400 group-hover:text-orange-500 mb-2"></i>
                                        <span class="text-sm font-medium text-gray-600 group-hover:text-orange-600">Add Experience</span>
                                    </a>
                                    
                                    <a href="profile.php?action=edit" class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                                        <i class="fas fa-user-edit text-2xl text-gray-400 group-hover:text-purple-500 mb-2"></i>
                                        <span class="text-sm font-medium text-gray-600 group-hover:text-purple-600">Edit Profile</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- System Status -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div class="p-6 border-b border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900">System Status</h3>
                                <p class="text-sm text-gray-600">Portfolio completeness overview</p>
                            </div>
                            
                            <div class="p-6">
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600">Overall Completion</span>
                                        <span class="text-sm font-medium text-gray-900"><?php echo $overallCompletion; ?>%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" style="width: <?php echo $overallCompletion; ?>%"></div>
                                    </div>
                                    
                                    <div class="pt-2 space-y-2">
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="flex items-center">
                                                <i class="fas fa-folder text-blue-500 mr-2"></i>
                                                Projects
                                            </span>
                                            <span class="<?php echo $projectsCount > 0 ? 'text-green-600' : 'text-red-500'; ?>">
                                                <?php echo $projectsCount > 0 ? '✓' : '✗'; ?>
                                            </span>
                                        </div>
                                        
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="flex items-center">
                                                <i class="fas fa-code text-green-500 mr-2"></i>
                                                Skills
                                            </span>
                                            <span class="<?php echo $skillsCount > 0 ? 'text-green-600' : 'text-red-500'; ?>">
                                                <?php echo $skillsCount > 0 ? '✓' : '✗'; ?>
                                            </span>
                                        </div>
                                        
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="flex items-center">
                                                <i class="fas fa-briefcase text-orange-500 mr-2"></i>
                                                Experience
                                            </span>
                                            <span class="<?php echo $experienceCount > 0 ? 'text-green-600' : 'text-red-500'; ?>">
                                                <?php echo $experienceCount > 0 ? '✓' : '✗'; ?>
                                            </span>
                                        </div>
                                        
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="flex items-center">
                                                <i class="fas fa-user text-purple-500 mr-2"></i>
                                                Profile
                                            </span>
                                            <span class="<?php echo $profileCompletion >= 80 ? 'text-green-600' : 'text-yellow-500'; ?>">
                                                <?php echo $profileCompletion >= 80 ? '✓' : $profileCompletion . '%'; ?>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    
    <!-- Optional: Add some JavaScript for enhanced interactions -->
    <script>
    // Auto-refresh statistics every 5 minutes
    setTimeout(function() {
        location.reload();
    }, 300000);
    
    // Add smooth scroll to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    </script>
</body>
</html>