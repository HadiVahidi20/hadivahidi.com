<?php
// /admin/experience.php
// Complete Experience/Timeline Management Interface

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';

$db = Database::getInstance();
$message = '';
$error = '';
$action = $_GET['action'] ?? 'list';
$experienceId = $_GET['id'] ?? null;

// Handle AJAX requests
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['ajax_action']) {
        case 'generate_slug':
            $title = $_POST['title'] ?? '';
            $slug = strtolower(trim($title));
            $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
            $slug = preg_replace('/-+/', '-', $slug);
            $slug = trim($slug, '-');
            
            // Check uniqueness
            $counter = 1;
            $originalSlug = $slug;
            while (true) {
                $existing = $db->fetch("SELECT id FROM experience_items WHERE slug = ? AND id != ?", [$slug, $experienceId ?: 0]);
                if (!$existing) break;
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            echo json_encode(['slug' => $slug]);
            exit;
            
        case 'toggle_status':
            $id = $_POST['experience_id'] ?? 0;
            $field = $_POST['field'] ?? '';
            $value = $_POST['value'] ?? 0;
            
            if ($id && in_array($field, ['is_active', 'is_featured', 'is_current'])) {
                // If setting is_current to true, make sure only one is current
                if ($field === 'is_current' && $value == 1) {
                    $db->execute("UPDATE experience_items SET is_current = 0");
                }
                $db->execute("UPDATE experience_items SET {$field} = ? WHERE id = ?", [$value, $id]);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
            exit;
            
        case 'delete_experience':
            $id = $_POST['experience_id'] ?? 0;
            if ($id) {
                try {
                    $db->execute("DELETE FROM experience_items WHERE id = ?", [$id]);
                    echo json_encode(['success' => true, 'message' => 'Experience deleted successfully!']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete experience: ' . $e->getMessage()]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid experience ID']);
            }
            exit;
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['ajax_action'])) {
    try {
        $title = trim($_POST['title'] ?? '');
        $company = trim($_POST['company'] ?? '');
        $position = trim($_POST['position'] ?? '');
        $location = trim($_POST['location'] ?? '');
        $employment_type = $_POST['employment_type'] ?? 'full-time';
        $description = trim($_POST['description'] ?? '');
        $start_date = $_POST['start_date'] ?? '';
        $end_date = $_POST['end_date'] ?? '';
        $is_current = isset($_POST['is_current']) ? 1 : 0;
        $is_featured = isset($_POST['is_featured']) ? 1 : 0;
        $company_website = trim($_POST['company_website'] ?? '');
        $company_logo = trim($_POST['company_logo'] ?? '');
        $technologies = $_POST['technologies'] ?? '';
        $achievements = $_POST['achievements'] ?? '';
        
        // Convert comma-separated strings to JSON arrays
        $technologiesArray = array_filter(array_map('trim', explode(',', $technologies)));
        $achievementsArray = array_filter(array_map('trim', explode("\n", $achievements)));
        
        // Validation
        if (empty($title) || empty($company) || empty($position) || empty($start_date)) {
            throw new Exception('Title, company, position, and start date are required');
        }
        
        if ($is_current) {
            $end_date = null;
        } elseif (empty($end_date)) {
            throw new Exception('End date is required for non-current positions');
        }
        
        // Generate slug
        $slug = strtolower(trim($title . ' ' . $company));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Ensure unique slug
        $counter = 1;
        $originalSlug = $slug;
        while (true) {
            $existing = $db->fetch("SELECT id FROM experience_items WHERE slug = ? AND id != ?", [$slug, $experienceId ?: 0]);
            if (!$existing) break;
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        // If setting as current, unset all other current positions
        if ($is_current) {
            $db->execute("UPDATE experience_items SET is_current = 0");
        }
        
        if ($action === 'add') {
            // Get max sort order
            $maxOrder = $db->fetch("SELECT MAX(sort_order) as max_order FROM experience_items")['max_order'] ?? 0;
            
            $id = $db->execute(
                "INSERT INTO experience_items (title, slug, company, location, position, employment_type, description, start_date, end_date, is_current, technologies, achievements, company_logo, company_website, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $title, $slug, $company, $location, $position, $employment_type, $description, 
                    $start_date, $end_date, $is_current, json_encode($technologiesArray), 
                    json_encode($achievementsArray), $company_logo, $company_website, 
                    $is_featured, $maxOrder + 1
                ]
            );
            $message = 'Experience added successfully!';
            header('Location: experience.php?action=list&message=' . urlencode($message));
            exit;
            
        } elseif ($action === 'edit' && $experienceId) {
            $db->execute(
                "UPDATE experience_items SET title = ?, slug = ?, company = ?, location = ?, position = ?, employment_type = ?, description = ?, start_date = ?, end_date = ?, is_current = ?, technologies = ?, achievements = ?, company_logo = ?, company_website = ?, is_featured = ? WHERE id = ?",
                [
                    $title, $slug, $company, $location, $position, $employment_type, $description, 
                    $start_date, $end_date, $is_current, json_encode($technologiesArray), 
                    json_encode($achievementsArray), $company_logo, $company_website, 
                    $is_featured, $experienceId
                ]
            );
            $message = 'Experience updated successfully!';
            header('Location: experience.php?action=list&message=' . urlencode($message));
            exit;
        }
        
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}

// Get experience item for edit/view
$experience = null;
if (($action === 'edit' || $action === 'view') && $experienceId) {
    $experience = $db->fetch("SELECT * FROM experience_items WHERE id = ?", [$experienceId]);
    if (!$experience) {
        header('Location: experience.php?action=list&error=' . urlencode('Experience not found'));
        exit;
    }
}

// Get all experience items for listing
$experiences = [];
if ($action === 'list') {
    // Handle search and filters
    $searchTerm = $_GET['search'] ?? '';
    $employmentTypeFilter = $_GET['employment_type'] ?? '';
    $statusFilter = $_GET['status'] ?? '';
    $featuredFilter = $_GET['featured'] ?? '';
    
    $whereConditions = [];
    $params = [];
    
    if (!empty($searchTerm)) {
        $whereConditions[] = "(e.title LIKE ? OR e.company LIKE ? OR e.position LIKE ?)";
        $params[] = "%{$searchTerm}%";
        $params[] = "%{$searchTerm}%";
        $params[] = "%{$searchTerm}%";
    }
    
    if (!empty($employmentTypeFilter)) {
        $whereConditions[] = "e.employment_type = ?";
        $params[] = $employmentTypeFilter;
    }
    
    if (!empty($statusFilter)) {
        if ($statusFilter === 'current') {
            $whereConditions[] = "e.is_current = 1";
        } elseif ($statusFilter === 'past') {
            $whereConditions[] = "e.is_current = 0";
        } elseif ($statusFilter === 'active') {
            $whereConditions[] = "e.is_active = 1";
        } elseif ($statusFilter === 'inactive') {
            $whereConditions[] = "e.is_active = 0";
        }
    }
    
    if (!empty($featuredFilter)) {
        $whereConditions[] = "e.is_featured = ?";
        $params[] = $featuredFilter === 'yes' ? 1 : 0;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    $experiences = $db->fetchAll("
        SELECT e.*
        FROM experience_items e
        {$whereClause}
        ORDER BY e.start_date DESC, e.sort_order ASC
    ", $params);
}

// Get statistics
$stats = [
    'total' => $db->fetch("SELECT COUNT(*) as count FROM experience_items")['count'],
    'active' => $db->fetch("SELECT COUNT(*) as count FROM experience_items WHERE is_active = 1")['count'],
    'current' => $db->fetch("SELECT COUNT(*) as count FROM experience_items WHERE is_current = 1")['count'],
    'featured' => $db->fetch("SELECT COUNT(*) as count FROM experience_items WHERE is_featured = 1")['count']
];

// Handle messages
if (isset($_GET['message'])) {
    $message = $_GET['message'];
}
if (isset($_GET['error'])) {
    $error = $_GET['error'];
}

$pageTitle = match($action) {
    'add' => 'Add Experience',
    'edit' => 'Edit Experience',
    'view' => 'View Experience',
    default => 'Experience Management'
};

$currentPage = "experience";

// Get user info for sidebar
$user = $db->fetch("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - Portfolio Admin</title>
    <link rel="icon" href="../assets/images/favicon.png">
    
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
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8'
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm border-r border-gray-200">
            <div class="flex flex-col h-full">
                <!-- Logo -->
                <div class="flex items-center px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-layer-group text-white text-sm"></i>
                        </div>
                        <span class="ml-3 text-lg font-semibold text-gray-900">Portfolio Admin</span>
                    </div>
                </div>
                
                <!-- Navigation -->
                <nav class="flex-1 px-4 py-6 space-y-2">
                    <a href="index.php" class="<?php echo $currentPage === 'dashboard' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'text-gray-600 hover:bg-gray-50'; ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-chart-line w-5 h-5 mr-3"></i>
                        Dashboard
                    </a>
                    
                    <a href="projects.php" class="<?php echo $currentPage === 'projects' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'text-gray-600 hover:bg-gray-50'; ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-folder-open w-5 h-5 mr-3"></i>
                        Projects
                    </a>
                    
                    <a href="skills.php" class="<?php echo $currentPage === 'skills' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'text-gray-600 hover:bg-gray-50'; ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-cogs w-5 h-5 mr-3"></i>
                        Skills
                    </a>
                    
                    <a href="experience.php" class="<?php echo $currentPage === 'experience' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'text-gray-600 hover:bg-gray-50'; ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-briefcase w-5 h-5 mr-3"></i>
                        Experience
                    </a>
                </nav>
                
                <!-- User Info -->
                <div class="p-4 border-t border-gray-200">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-medium">
                                <?php echo strtoupper(substr($user['first_name'] ?: $user['username'], 0, 1)); ?>
                            </span>
                        </div>
                        <div class="ml-3 flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                <?php echo htmlspecialchars($user['first_name'] ? $user['first_name'] . ' ' . $user['last_name'] : $user['username']); ?>
                            </p>
                            <p class="text-xs text-gray-500">Administrator</p>
                        </div>
                        <a href="logout.php" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fas fa-sign-out-alt"></i>
                        </a>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 overflow-hidden">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900"><?php echo $pageTitle; ?></h1>
                        <p class="text-sm text-gray-600 mt-1">Manage your professional experience and career timeline</p>
                    </div>
                    
                    <?php if ($action === 'list'): ?>
                    <div class="flex space-x-3">
                        <a href="experience.php?action=add" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Add Experience
                        </a>
                    </div>
                    <?php endif; ?>
                </div>
            </header>
            
            <!-- Messages -->
            <?php if ($message): ?>
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mx-6 mt-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($error): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-6 mt-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <?php echo htmlspecialchars($error); ?>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Content -->
            <div class="p-6 overflow-y-auto" style="height: calc(100vh - 120px);">
                
                <?php if ($action === 'list'): ?>
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-briefcase text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Total Experience</p>
                                <p class="text-2xl font-bold text-gray-900"><?php echo $stats['total']; ?></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-check-circle text-green-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Active</p>
                                <p class="text-2xl font-bold text-gray-900"><?php echo $stats['active']; ?></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-yellow-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Current Position</p>
                                <p class="text-2xl font-bold text-gray-900"><?php echo $stats['current']; ?></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-star text-purple-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Featured</p>
                                <p class="text-2xl font-bold text-gray-900"><?php echo $stats['featured']; ?></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <form method="GET" class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input type="hidden" name="action" value="list">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input type="text" name="search" value="<?php echo htmlspecialchars($_GET['search'] ?? ''); ?>" 
                                   placeholder="Search experiences..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                            <select name="employment_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All Types</option>
                                <option value="full-time" <?php echo ($_GET['employment_type'] ?? '') === 'full-time' ? 'selected' : ''; ?>>Full-time</option>
                                <option value="part-time" <?php echo ($_GET['employment_type'] ?? '') === 'part-time' ? 'selected' : ''; ?>>Part-time</option>
                                <option value="freelance" <?php echo ($_GET['employment_type'] ?? '') === 'freelance' ? 'selected' : ''; ?>>Freelance</option>
                                <option value="contract" <?php echo ($_GET['employment_type'] ?? '') === 'contract' ? 'selected' : ''; ?>>Contract</option>
                                <option value="internship" <?php echo ($_GET['employment_type'] ?? '') === 'internship' ? 'selected' : ''; ?>>Internship</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All Status</option>
                                <option value="current" <?php echo ($_GET['status'] ?? '') === 'current' ? 'selected' : ''; ?>>Current</option>
                                <option value="past" <?php echo ($_GET['status'] ?? '') === 'past' ? 'selected' : ''; ?>>Past</option>
                                <option value="active" <?php echo ($_GET['status'] ?? '') === 'active' ? 'selected' : ''; ?>>Active</option>
                                <option value="inactive" <?php echo ($_GET['status'] ?? '') === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                            <select name="featured" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All</option>
                                <option value="yes" <?php echo ($_GET['featured'] ?? '') === 'yes' ? 'selected' : ''; ?>>Featured</option>
                                <option value="no" <?php echo ($_GET['featured'] ?? '') === 'no' ? 'selected' : ''; ?>>Not Featured</option>
                            </select>
                        </div>
                        
                        <div class="flex items-end space-x-2">
                            <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1">
                                <i class="fas fa-search mr-1"></i> Filter
                            </button>
                            <a href="experience.php?action=list" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <i class="fas fa-times"></i>
                            </a>
                        </div>
                    </form>
                </div>
                
                <!-- Experience List -->
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php if (empty($experiences)): ?>
                                <tr>
                                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                        <i class="fas fa-briefcase text-4xl mb-4 text-gray-300"></i>
                                        <p class="text-lg font-medium">No experience entries found</p>
                                        <p class="text-sm">Start by adding your first professional experience.</p>
                                        <a href="experience.php?action=add" class="mt-4 inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <i class="fas fa-plus mr-2"></i>
                                            Add Experience
                                        </a>
                                    </td>
                                </tr>
                                <?php else: ?>
                                <?php foreach ($experiences as $exp): ?>
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <?php if ($exp['company_logo']): ?>
                                            <img src="<?php echo htmlspecialchars($exp['company_logo']); ?>" alt="Logo" class="w-10 h-10 rounded-lg object-cover mr-4">
                                            <?php else: ?>
                                            <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                                                <i class="fas fa-building text-gray-400"></i>
                                            </div>
                                            <?php endif; ?>
                                            <div>
                                                <div class="text-sm font-medium text-gray-900 flex items-center">
                                                    <?php echo htmlspecialchars($exp['position']); ?>
                                                    <?php if ($exp['is_current']): ?>
                                                    <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
                                                    <?php endif; ?>
                                                    <?php if ($exp['is_featured']): ?>
                                                    <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                                                    <?php endif; ?>
                                                </div>
                                                <div class="text-sm text-gray-500"><?php echo htmlspecialchars($exp['title']); ?></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($exp['company']); ?></div>
                                        <?php if ($exp['location']): ?>
                                        <div class="text-sm text-gray-500"><?php echo htmlspecialchars($exp['location']); ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <?php 
                                        $startDate = new DateTime($exp['start_date']);
                                        $endDate = $exp['end_date'] ? new DateTime($exp['end_date']) : null;
                                        echo $startDate->format('M Y');
                                        if ($endDate) {
                                            echo ' - ' . $endDate->format('M Y');
                                        } else {
                                            echo ' - Present';
                                        }
                                        ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                            <?php echo ucfirst($exp['employment_type']); ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex space-x-2">
                                            <label class="inline-flex items-center">
                                                <input type="checkbox" class="status-toggle" 
                                                       data-experience-id="<?php echo $exp['id']; ?>" 
                                                       data-field="is_active"
                                                       <?php echo $exp['is_active'] ? 'checked' : ''; ?>
                                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                                <span class="ml-2 text-sm text-gray-600">Active</span>
                                            </label>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div class="flex items-center space-x-2">
                                            <a href="experience.php?action=view&id=<?php echo $exp['id']; ?>" 
                                               class="text-primary-600 hover:text-primary-900 transition-colors">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="experience.php?action=edit&id=<?php echo $exp['id']; ?>" 
                                               class="text-green-600 hover:text-green-900 transition-colors">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button onclick="deleteExperience(<?php echo $exp['id']; ?>)" 
                                                    class="text-red-600 hover:text-red-900 transition-colors">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <?php elseif ($action === 'add' || $action === 'edit'): ?>
                <!-- Add/Edit Form -->
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <form method="POST" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Title -->
                            <div>
                                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Position Title *</label>
                                <input type="text" id="title" name="title" required
                                       value="<?php echo htmlspecialchars($experience['title'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Company -->
                            <div>
                                <label for="company" class="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                                <input type="text" id="company" name="company" required
                                       value="<?php echo htmlspecialchars($experience['company'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Position -->
                            <div>
                                <label for="position" class="block text-sm font-medium text-gray-700 mb-2">Job Position *</label>
                                <input type="text" id="position" name="position" required
                                       value="<?php echo htmlspecialchars($experience['position'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Location -->
                            <div>
                                <label for="location" class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input type="text" id="location" name="location"
                                       value="<?php echo htmlspecialchars($experience['location'] ?? ''); ?>"
                                       placeholder="City, Country"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Employment Type -->
                            <div>
                                <label for="employment_type" class="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                <select id="employment_type" name="employment_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="full-time" <?php echo ($experience['employment_type'] ?? 'full-time') === 'full-time' ? 'selected' : ''; ?>>Full-time</option>
                                    <option value="part-time" <?php echo ($experience['employment_type'] ?? '') === 'part-time' ? 'selected' : ''; ?>>Part-time</option>
                                    <option value="freelance" <?php echo ($experience['employment_type'] ?? '') === 'freelance' ? 'selected' : ''; ?>>Freelance</option>
                                    <option value="contract" <?php echo ($experience['employment_type'] ?? '') === 'contract' ? 'selected' : ''; ?>>Contract</option>
                                    <option value="internship" <?php echo ($experience['employment_type'] ?? '') === 'internship' ? 'selected' : ''; ?>>Internship</option>
                                </select>
                            </div>
                            
                            <!-- Start Date -->
                            <div>
                                <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                <input type="date" id="start_date" name="start_date" required
                                       value="<?php echo htmlspecialchars($experience['start_date'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- End Date -->
                            <div>
                                <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input type="date" id="end_date" name="end_date"
                                       value="<?php echo htmlspecialchars($experience['end_date'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Company Website -->
                            <div>
                                <label for="company_website" class="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                                <input type="url" id="company_website" name="company_website"
                                       value="<?php echo htmlspecialchars($experience['company_website'] ?? ''); ?>"
                                       placeholder="https://company.com"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                            
                            <!-- Company Logo -->
                            <div>
                                <label for="company_logo" class="block text-sm font-medium text-gray-700 mb-2">Company Logo URL</label>
                                <input type="url" id="company_logo" name="company_logo"
                                       value="<?php echo htmlspecialchars($experience['company_logo'] ?? ''); ?>"
                                       placeholder="https://example.com/logo.png"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                            <textarea id="description" name="description" rows="4"
                                      placeholder="Describe your role, responsibilities, and key achievements..."
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><?php echo htmlspecialchars($experience['description'] ?? ''); ?></textarea>
                        </div>
                        
                        <!-- Technologies -->
                        <div>
                            <label for="technologies" class="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                            <input type="text" id="technologies" name="technologies"
                                   value="<?php echo htmlspecialchars($experience ? implode(', ', json_decode($experience['technologies'] ?? '[]', true)) : ''); ?>"
                                   placeholder="JavaScript, React, Node.js, MySQL..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <p class="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
                        </div>
                        
                        <!-- Achievements -->
                        <div>
                            <label for="achievements" class="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
                            <textarea id="achievements" name="achievements" rows="4"
                                      placeholder="List your key achievements, one per line..."
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><?php echo htmlspecialchars($experience ? implode("\n", json_decode($experience['achievements'] ?? '[]', true)) : ''); ?></textarea>
                            <p class="text-sm text-gray-500 mt-1">Enter each achievement on a new line</p>
                        </div>
                        
                        <!-- Checkboxes -->
                        <div class="flex flex-wrap gap-6">
                            <label class="flex items-center">
                                <input type="checkbox" id="is_current" name="is_current" value="1"
                                       <?php echo ($experience['is_current'] ?? 0) ? 'checked' : ''; ?>
                                       onchange="toggleEndDate()"
                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                <span class="ml-2 text-sm text-gray-700">Current Position</span>
                            </label>
                            
                            <label class="flex items-center">
                                <input type="checkbox" name="is_featured" value="1"
                                       <?php echo ($experience['is_featured'] ?? 0) ? 'checked' : ''; ?>
                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                <span class="ml-2 text-sm text-gray-700">Featured Experience</span>
                            </label>
                        </div>
                        
                        <!-- Submit Buttons -->
                        <div class="flex justify-between">
                            <a href="experience.php?action=list" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to List
                            </a>
                            <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                <?php echo $action === 'add' ? 'Add Experience' : 'Update Experience'; ?>
                            </button>
                        </div>
                    </form>
                </div>
                
                <?php elseif ($action === 'view' && $experience): ?>
                <!-- View Experience -->
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center">
                            <?php if ($experience['company_logo']): ?>
                            <img src="<?php echo htmlspecialchars($experience['company_logo']); ?>" alt="Logo" class="w-16 h-16 rounded-lg object-cover mr-4">
                            <?php else: ?>
                            <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                                <i class="fas fa-building text-gray-400 text-2xl"></i>
                            </div>
                            <?php endif; ?>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900"><?php echo htmlspecialchars($experience['position']); ?></h2>
                                <p class="text-lg text-gray-600"><?php echo htmlspecialchars($experience['company']); ?></p>
                                <?php if ($experience['location']): ?>
                                <p class="text-sm text-gray-500"><?php echo htmlspecialchars($experience['location']); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <a href="experience.php?action=edit&id=<?php echo $experience['id']; ?>" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <i class="fas fa-edit mr-2"></i>
                                Edit
                            </a>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Employment Details</h3>
                            <div class="space-y-2">
                                <p><span class="font-medium">Type:</span> <?php echo ucfirst($experience['employment_type']); ?></p>
                                <p><span class="font-medium">Period:</span> 
                                    <?php 
                                    $startDate = new DateTime($experience['start_date']);
                                    $endDate = $experience['end_date'] ? new DateTime($experience['end_date']) : null;
                                    echo $startDate->format('F Y');
                                    if ($endDate) {
                                        echo ' - ' . $endDate->format('F Y');
                                    } else {
                                        echo ' - Present';
                                    }
                                    ?>
                                </p>
                                <div class="flex space-x-2">
                                    <?php if ($experience['is_current']): ?>
                                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current Position</span>
                                    <?php endif; ?>
                                    <?php if ($experience['is_featured']): ?>
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                                    <?php endif; ?>
                                    <?php if ($experience['is_active']): ?>
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Active</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Company Information</h3>
                            <div class="space-y-2">
                                <p><span class="font-medium">Name:</span> <?php echo htmlspecialchars($experience['company']); ?></p>
                                <?php if ($experience['company_website']): ?>
                                <p><span class="font-medium">Website:</span> 
                                    <a href="<?php echo htmlspecialchars($experience['company_website']); ?>" target="_blank" class="text-primary-600 hover:text-primary-800">
                                        <?php echo htmlspecialchars($experience['company_website']); ?>
                                        <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                                    </a>
                                </p>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    
                    <?php if ($experience['description']): ?>
                    <div class="mb-6">
                        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                        <div class="text-gray-700 leading-relaxed">
                            <?php echo nl2br(htmlspecialchars($experience['description'])); ?>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <?php 
                    $technologies = json_decode($experience['technologies'] ?? '[]', true);
                    if (!empty($technologies)): 
                    ?>
                    <div class="mb-6">
                        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Technologies Used</h3>
                        <div class="flex flex-wrap gap-2">
                            <?php foreach ($technologies as $tech): ?>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"><?php echo htmlspecialchars($tech); ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <?php 
                    $achievements = json_decode($experience['achievements'] ?? '[]', true);
                    if (!empty($achievements)): 
                    ?>
                    <div class="mb-6">
                        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Key Achievements</h3>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            <?php foreach ($achievements as $achievement): ?>
                            <li><?php echo htmlspecialchars($achievement); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <?php endif; ?>
                    
                    <div class="flex justify-between border-t pt-6">
                        <a href="experience.php?action=list" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Back to List
                        </a>
                        <a href="experience.php?action=edit&id=<?php echo $experience['id']; ?>" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-edit mr-2"></i>
                            Edit Experience
                        </a>
                    </div>
                </div>
                <?php endif; ?>
                
            </div>
        </main>
    </div>
    
    <script>
        // Toggle end date field based on current position checkbox
        function toggleEndDate() {
            const isCurrentCheckbox = document.getElementById('is_current');
            const endDateField = document.getElementById('end_date');
            
            if (isCurrentCheckbox.checked) {
                endDateField.value = '';
                endDateField.disabled = true;
                endDateField.required = false;
            } else {
                endDateField.disabled = false;
                endDateField.required = true;
            }
        }
        
        // Initialize end date toggle
        document.addEventListener('DOMContentLoaded', function() {
            const isCurrentCheckbox = document.getElementById('is_current');
            if (isCurrentCheckbox) {
                toggleEndDate();
            }
        });
        
        // Handle status toggle switches
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.status-toggle').forEach(function(checkbox) {
                checkbox.addEventListener('change', function() {
                    const experienceId = this.dataset.experienceId;
                    const field = this.dataset.field;
                    const value = this.checked ? 1 : 0;
                    
                    fetch('experience.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `ajax_action=toggle_status&experience_id=${experienceId}&field=${field}&value=${value}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) {
                            this.checked = !this.checked; // Revert on error
                            alert('Failed to update status');
                        }
                    })
                    .catch(error => {
                        this.checked = !this.checked; // Revert on error
                        alert('An error occurred');
                    });
                });
            });
        });
        
        // Delete experience function
        function deleteExperience(experienceId) {
            if (confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
                fetch('experience.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=delete_experience&experience_id=${experienceId}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert(data.message || 'Failed to delete experience');
                    }
                })
                .catch(error => {
                    alert('An error occurred while deleting the experience');
                });
            }
        }
    </script>
</body>
</html>