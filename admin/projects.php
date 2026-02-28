<?php
// /admin/projects.php
// Fixed Projects Management Interface - resolving scrolling, images, delete, and API issues

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
$projectId = $_GET['id'] ?? null;

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
                $existing = $db->fetch("SELECT id FROM projects WHERE slug = ? AND id != ?", [$slug, $projectId ?: 0]);
                if (!$existing) break;
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            echo json_encode(['slug' => $slug]);
            exit;
            
        case 'toggle_status':
            $id = $_POST['project_id'] ?? 0;
            $field = $_POST['field'] ?? '';
            $value = $_POST['value'] ?? 0;
            
            if ($id && in_array($field, ['is_active', 'is_featured'])) {
                $db->execute("UPDATE projects SET {$field} = ? WHERE id = ?", [$value, $id]);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
            exit;
            
        case 'delete_project':
            $id = $_POST['project_id'] ?? 0;
            if ($id) {
                try {
                    $db->execute("DELETE FROM project_highlights WHERE project_id = ?", [$id]);
                    $db->execute("DELETE FROM project_links WHERE project_id = ?", [$id]);
                    $db->execute("DELETE FROM project_images WHERE project_id = ?", [$id]);
                    $db->execute("DELETE FROM projects WHERE id = ?", [$id]);
                    echo json_encode(['success' => true, 'message' => 'Project deleted successfully!']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete project: ' . $e->getMessage()]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid project ID']);
            }
            exit;
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['ajax_action'])) {
    if (isset($_POST['save_project'])) {
        try {
            $data = [
                'title' => trim($_POST['title']),
                'slug' => trim($_POST['slug']),
                'subtitle' => trim($_POST['subtitle']),
                'description' => trim($_POST['description']),
                'short_description' => trim($_POST['short_description']),
                'thumbnail' => trim($_POST['thumbnail']),
                'technologies' => trim($_POST['technologies']),
                'size' => $_POST['size'],
                'status' => $_POST['status'],
                'sort_order' => (int)$_POST['sort_order'],
                'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                'is_active' => isset($_POST['is_active']) ? 1 : 0
            ];
            
            // Handle position data
            $position_top = trim($_POST['position_top']);
            $position_left = trim($_POST['position_left']);
            $data['position_top'] = empty($position_top) ? null : $position_top . '%';
            $data['position_left'] = empty($position_left) ? null : $position_left . '%';
            
            // Validation
            if (empty($data['title'])) {
                throw new Exception('Project title is required');
            }
            
            if (empty($data['slug'])) {
                throw new Exception('Project slug is required');
            }
            
            // Check slug uniqueness
            $slugCheck = $db->fetch("SELECT id FROM projects WHERE slug = ? AND id != ?", [$data['slug'], $projectId ?: 0]);
            if ($slugCheck) {
                throw new Exception('This slug is already in use. Please choose a different one.');
            }
            
            if ($projectId) {
                // Update existing project
                $sql = "UPDATE projects SET 
                        title = ?, slug = ?, subtitle = ?, description = ?, short_description = ?,
                        thumbnail = ?, technologies = ?, size = ?, status = ?,
                        position_top = ?, position_left = ?, sort_order = ?,
                        is_featured = ?, is_active = ?, updated_at = NOW()
                        WHERE id = ?";
                
                $params = [
                    $data['title'], $data['slug'], $data['subtitle'], $data['description'], $data['short_description'],
                    $data['thumbnail'], $data['technologies'], $data['size'], $data['status'],
                    $data['position_top'], $data['position_left'], $data['sort_order'],
                    $data['is_featured'], $data['is_active'], $projectId
                ];
                
                $db->execute($sql, $params);
                $message = 'Project updated successfully!';
                
            } else {
                // Add new project
                $sql = "INSERT INTO projects (
                        title, slug, subtitle, description, short_description, thumbnail,
                        technologies, size, status, position_top, position_left,
                        sort_order, is_featured, is_active, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                
                $params = [
                    $data['title'], $data['slug'], $data['subtitle'], $data['description'], $data['short_description'],
                    $data['thumbnail'], $data['technologies'], $data['size'], $data['status'],
                    $data['position_top'], $data['position_left'], $data['sort_order'],
                    $data['is_featured'], $data['is_active']
                ];
                
                $newId = $db->insert($sql, $params);
                $message = 'Project added successfully!';
                $projectId = $newId;
            }
            
            // Handle project images
            if (!empty($_POST['project_images'])) {
                $db->execute("DELETE FROM project_images WHERE project_id = ?", [$projectId]);
                
                $images = explode("\n", $_POST['project_images']);
                $imageOrder = 0;
                foreach ($images as $image) {
                    $image = trim($image);
                    if (!empty($image)) {
                        $db->execute(
                            "INSERT INTO project_images (project_id, image_path, sort_order, is_active) VALUES (?, ?, ?, 1)",
                            [$projectId, $image, $imageOrder++]
                        );
                    }
                }
            }
            
            // Handle project links
            $db->execute("DELETE FROM project_links WHERE project_id = ?", [$projectId]);
            $links = [
                ['live', $_POST['live_url']],
                ['github', $_POST['github_url']],
                ['demo', $_POST['demo_url']]
            ];
            
            foreach ($links as $link) {
                if (!empty($link[1])) {
                    $db->execute(
                        "INSERT INTO project_links (project_id, link_type, url, is_active) VALUES (?, ?, ?, 1)",
                        [$projectId, $link[0], trim($link[1])]
                    );
                }
            }
            
            // Handle project highlights
            if (!empty($_POST['highlights'])) {
                $db->execute("DELETE FROM project_highlights WHERE project_id = ?", [$projectId]);
                
                $highlights = explode("\n", $_POST['highlights']);
                $highlightOrder = 0;
                foreach ($highlights as $highlight) {
                    $highlight = trim($highlight);
                    if (!empty($highlight)) {
                        $db->execute(
                            "INSERT INTO project_highlights (project_id, highlight_text, sort_order, is_active) VALUES (?, ?, ?, 1)",
                            [$projectId, $highlight, $highlightOrder++]
                        );
                    }
                }
            }
            
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    }
    
    // Duplicate project
    if (isset($_POST['duplicate_project']) && $projectId) {
        try {
            $original = $db->fetch("SELECT * FROM projects WHERE id = ?", [$projectId]);
            if ($original) {
                // Create new project with modified title
                $newTitle = $original['title'] . ' (Copy)';
                $newSlug = $original['slug'] . '-copy';
                
                // Ensure unique slug
                $counter = 1;
                $baseSlug = $newSlug;
                while (true) {
                    $existing = $db->fetch("SELECT id FROM projects WHERE slug = ?", [$newSlug]);
                    if (!$existing) break;
                    $newSlug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                $sql = "INSERT INTO projects (
                    title, slug, subtitle, description, short_description, thumbnail,
                    technologies, size, status, position_top, position_left,
                    sort_order, is_featured, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                
                $params = [
                    $newTitle, $newSlug, $original['subtitle'], $original['description'], $original['short_description'],
                    $original['thumbnail'], $original['technologies'], $original['size'], 'draft',
                    $original['position_top'], $original['position_left'], $original['sort_order'] + 1,
                    0, 1 // Not featured, but active
                ];
                
                $newProjectId = $db->insert($sql, $params);
                
                // Copy related data
                $images = $db->fetchAll("SELECT * FROM project_images WHERE project_id = ?", [$projectId]);
                foreach ($images as $image) {
                    $db->execute(
                        "INSERT INTO project_images (project_id, image_path, alt_text, caption, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                        [$newProjectId, $image['image_path'], $image['alt_text'], $image['caption'], $image['sort_order'], $image['is_active']]
                    );
                }
                
                $links = $db->fetchAll("SELECT * FROM project_links WHERE project_id = ?", [$projectId]);
                foreach ($links as $link) {
                    $db->execute(
                        "INSERT INTO project_links (project_id, link_type, url, title, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                        [$newProjectId, $link['link_type'], $link['url'], $link['title'], $link['sort_order'], $link['is_active']]
                    );
                }
                
                $highlights = $db->fetchAll("SELECT * FROM project_highlights WHERE project_id = ?", [$projectId]);
                foreach ($highlights as $highlight) {
                    $db->execute(
                        "INSERT INTO project_highlights (project_id, highlight_text, sort_order, is_active) VALUES (?, ?, ?, ?)",
                        [$newProjectId, $highlight['highlight_text'], $highlight['sort_order'], $highlight['is_active']]
                    );
                }
                
                $message = 'Project duplicated successfully!';
                $action = 'edit';
                $projectId = $newProjectId;
            }
        } catch (Exception $e) {
            $error = 'Failed to duplicate project: ' . $e->getMessage();
        }
    }
}

// Get project data for editing
$project = null;
$projectImages = [];
$projectLinks = [];
$projectHighlights = [];

if ($projectId && in_array($action, ['edit', 'view'])) {
    $project = $db->fetch("SELECT * FROM projects WHERE id = ?", [$projectId]);
    if (!$project) {
        $error = 'Project not found';
        $action = 'list';
    } else {
        $projectImages = $db->fetchAll("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order", [$projectId]);
        $projectLinks = $db->fetchAll("SELECT * FROM project_links WHERE project_id = ?", [$projectId]);
        $projectHighlights = $db->fetchAll("SELECT * FROM project_highlights WHERE project_id = ? ORDER BY sort_order", [$projectId]);
    }
}

// Get projects for listing with search and filter
$searchTerm = $_GET['search'] ?? '';
$statusFilter = $_GET['status'] ?? '';
$sizeFilter = $_GET['size'] ?? '';
$featuredFilter = $_GET['featured'] ?? '';

$projects = [];
if ($action === 'list') {
    $whereConditions = [];
    $params = [];
    
    if (!empty($searchTerm)) {
        $whereConditions[] = "(p.title LIKE ? OR p.subtitle LIKE ? OR p.description LIKE ?)";
        $params[] = "%{$searchTerm}%";
        $params[] = "%{$searchTerm}%";
        $params[] = "%{$searchTerm}%";
    }
    
    if (!empty($statusFilter)) {
        $whereConditions[] = "p.status = ?";
        $params[] = $statusFilter;
    }
    
    if (!empty($sizeFilter)) {
        $whereConditions[] = "p.size = ?";
        $params[] = $sizeFilter;
    }
    
    if (!empty($featuredFilter)) {
        $whereConditions[] = "p.is_featured = ?";
        $params[] = $featuredFilter === 'yes' ? 1 : 0;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    $projects = $db->fetchAll("
        SELECT p.*, 
               COUNT(DISTINCT pi.id) as image_count,
               COUNT(DISTINCT pl.id) as link_count,
               COUNT(DISTINCT ph.id) as highlight_count
        FROM projects p
        LEFT JOIN project_images pi ON p.id = pi.project_id AND pi.is_active = 1
        LEFT JOIN project_links pl ON p.id = pl.project_id AND pl.is_active = 1
        LEFT JOIN project_highlights ph ON p.id = ph.project_id AND ph.is_active = 1
        {$whereClause}
        GROUP BY p.id
        ORDER BY p.sort_order, p.created_at DESC
    ", $params);
}

// Get statistics
$stats = [
    'total' => $db->fetch("SELECT COUNT(*) as count FROM projects")['count'],
    'active' => $db->fetch("SELECT COUNT(*) as count FROM projects WHERE is_active = 1")['count'],
    'featured' => $db->fetch("SELECT COUNT(*) as count FROM projects WHERE is_featured = 1")['count'],
    'draft' => $db->fetch("SELECT COUNT(*) as count FROM projects WHERE status = 'draft'")['count']
];

$pageTitle = match($action) {
    'add' => 'Add New Project',
    'edit' => 'Edit Project',
    'view' => 'View Project',
    default => 'Projects Management'
};

$currentPage = "projects";

// Function to resolve image path for admin panel
function getImagePath($imagePath) {
    if (empty($imagePath)) return '';
    
    // If it's already a full URL, return as is
    if (strpos($imagePath, 'http') === 0) {
        return $imagePath;
    }
    
    // If it starts with assets or /, it's relative to root
    if (strpos($imagePath, 'assets/') === 0 || strpos($imagePath, '/') === 0) {
        return '../' . ltrim($imagePath, '/');
    }
    
    // Otherwise, assume it's in assets/images/projects/
    return '../assets/images/projects/' . $imagePath;
}
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
        <aside class="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
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
                    <a href="index.php" class="text-gray-600 hover:bg-gray-50 flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-chart-line w-5 h-5 mr-3"></i>
                        Dashboard
                    </a>
                    
                    <a href="projects.php" class="bg-primary-50 text-primary-700 border-primary-200 flex items-center px-4 py-3 text-sm font-medium rounded-lg border transition-colors">
                        <i class="fas fa-folder-open w-5 h-5 mr-3"></i>
                        Projects
                        <span class="ml-auto bg-primary-200 text-primary-800 text-xs px-2 py-1 rounded-full"><?php echo $stats['total']; ?></span>
                    </a>
                    
                    <a href="skills.php" class="text-gray-600 hover:bg-gray-50 flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-cogs w-5 h-5 mr-3"></i>
                        Skills
                    </a>
                </nav>
                
                <!-- API Status -->
                <div class="p-4 border-t border-gray-200">
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                            <div class="text-xs">
                                <div class="font-medium text-yellow-800">Frontend Integration Needed</div>
                                <div class="text-yellow-700">New projects won't appear on your website until you complete the API integration.</div>
                                <a href="../test-api.php" target="_blank" class="text-yellow-800 underline">Test API</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-h-0">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                <div class="px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900"><?php echo $pageTitle; ?></h1>
                            <?php if ($action === 'list'): ?>
                            <div class="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                                <span><i class="fas fa-folder-open mr-1"></i> <?php echo $stats['total']; ?> Total</span>
                                <span><i class="fas fa-eye mr-1"></i> <?php echo $stats['active']; ?> Active</span>
                                <span><i class="fas fa-star mr-1"></i> <?php echo $stats['featured']; ?> Featured</span>
                                <span><i class="fas fa-edit mr-1"></i> <?php echo $stats['draft']; ?> Drafts</span>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <?php if ($action === 'list'): ?>
                            <a href="?action=add" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                New Project
                            </a>
                            <?php elseif ($action !== 'add'): ?>
                            <a href="projects.php" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to Projects
                            </a>
                            <?php endif; ?>
                            
                            <a href="../index.php" target="_blank" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <i class="fas fa-external-link-alt mr-2"></i>
                                View Site
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto">
                <!-- Messages -->
                <?php if ($message): ?>
                <div class="mx-6 mt-6">
                    <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle mr-2"></i>
                            <?php echo htmlspecialchars($message); ?>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                <div class="mx-6 mt-6">
                    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            <?php echo htmlspecialchars($error); ?>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <div class="p-6">
                    <?php if ($action === 'list'): ?>
                    <!-- Projects List -->
                    <div class="space-y-6">
                        <!-- Search and Filters -->
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <form method="GET" class="flex flex-wrap gap-4 items-center">
                                <div class="flex-1 min-w-64">
                                    <div class="relative">
                                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        <input type="text" name="search" placeholder="Search projects..." 
                                               value="<?php echo htmlspecialchars($searchTerm); ?>"
                                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                    </div>
                                </div>
                                
                                <select name="status" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Status</option>
                                    <option value="completed" <?php echo $statusFilter === 'completed' ? 'selected' : ''; ?>>Completed</option>
                                    <option value="in_progress" <?php echo $statusFilter === 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                    <option value="draft" <?php echo $statusFilter === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                    <option value="planned" <?php echo $statusFilter === 'planned' ? 'selected' : ''; ?>>Planned</option>
                                </select>
                                
                               <select name="size" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
    <option value="">All Sizes</option>
    <option value="sm" <?php echo $sizeFilter === 'sm' || $sizeFilter === 'small' ? 'selected' : ''; ?>>Small</option>
    <option value="md" <?php echo $sizeFilter === 'md' || $sizeFilter === 'medium' ? 'selected' : ''; ?>>Medium</option>
    <option value="lg" <?php echo $sizeFilter === 'lg' || $sizeFilter === 'large' ? 'selected' : ''; ?>>Large</option>
</select>
                                
                                <select name="featured" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Projects</option>
                                    <option value="yes" <?php echo $featuredFilter === 'yes' ? 'selected' : ''; ?>>Featured Only</option>
                                    <option value="no" <?php echo $featuredFilter === 'no' ? 'selected' : ''; ?>>Not Featured</option>
                                </select>
                                
                                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    <i class="fas fa-filter mr-2"></i>
                                    Filter
                                </button>
                                
                                <?php if (!empty($searchTerm) || !empty($statusFilter) || !empty($sizeFilter) || !empty($featuredFilter)): ?>
                                <a href="projects.php" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                    <i class="fas fa-times mr-2"></i>
                                    Clear
                                </a>
                                <?php endif; ?>
                            </form>
                        </div>
                        
                        <!-- Projects Grid/Table -->
                        <?php if (empty($projects)): ?>
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <div class="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fas fa-folder-open text-gray-400 text-2xl"></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                                <?php echo !empty($searchTerm) || !empty($statusFilter) || !empty($sizeFilter) ? 'No projects match your filters' : 'No projects yet'; ?>
                            </h3>
                            <p class="text-gray-500 mb-6">
                                <?php echo !empty($searchTerm) || !empty($statusFilter) || !empty($sizeFilter) ? 'Try adjusting your search criteria or filters.' : 'Get started by creating your first project.'; ?>
                            </p>
                            <a href="?action=add" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                                <i class="fas fa-plus mr-2"></i>
                                Create First Project
                            </a>
                        </div>
                        <?php else: ?>
                        
                        <!-- Project Cards Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <?php foreach ($projects as $proj): ?>
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <!-- Project Image -->
                                <div class="aspect-video bg-gray-100 relative overflow-hidden">
                                    <?php if ($proj['thumbnail']): ?>
                                    <img src="<?php echo getImagePath($proj['thumbnail']); ?>" 
                                         alt="<?php echo htmlspecialchars($proj['title']); ?>"
                                         class="w-full h-full object-cover"
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="w-full h-full hidden items-center justify-center">
                                        <i class="fas fa-image text-gray-400 text-3xl"></i>
                                    </div>
                                    <?php else: ?>
                                    <div class="w-full h-full flex items-center justify-center">
                                        <i class="fas fa-image text-gray-400 text-3xl"></i>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Status Badges -->
                                    <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                                        <?php if ($proj['is_featured']): ?>
                                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                            <i class="fas fa-star mr-1"></i>Featured
                                        </span>
                                        <?php endif; ?>
                                        
                                        <span class="px-2 py-1 bg-<?php echo $proj['is_active'] ? 'green' : 'gray'; ?>-100 text-<?php echo $proj['is_active'] ? 'green' : 'gray'; ?>-800 text-xs font-medium rounded-full">
                                            <?php echo $proj['is_active'] ? 'Active' : 'Inactive'; ?>
                                        </span>
                                    </div>
                                    
                                    <!-- Quick Actions -->
                                    <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div class="flex space-x-1">
                                            <!-- Toggle Active Status -->
                                            <button onclick="toggleProjectStatus(<?php echo $proj['id']; ?>, 'is_active', <?php echo $proj['is_active'] ? 0 : 1; ?>)"
                                                    class="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                                                    title="<?php echo $proj['is_active'] ? 'Deactivate' : 'Activate'; ?> Project">
                                                <i class="fas fa-<?php echo $proj['is_active'] ? 'eye-slash' : 'eye'; ?> text-gray-600"></i>
                                            </button>
                                            
                                            <!-- Toggle Featured Status -->
                                            <button onclick="toggleProjectStatus(<?php echo $proj['id']; ?>, 'is_featured', <?php echo $proj['is_featured'] ? 0 : 1; ?>)"
                                                    class="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                                                    title="<?php echo $proj['is_featured'] ? 'Remove from' : 'Add to'; ?> Featured">
                                                <i class="fas fa-star text-<?php echo $proj['is_featured'] ? 'yellow' : 'gray'; ?>-500"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Project Info -->
                                <div class="p-4">
                                    <div class="flex items-start justify-between mb-2">
                                        <h3 class="font-semibold text-gray-900 text-lg leading-tight">
                                            <?php echo htmlspecialchars($proj['title']); ?>
                                        </h3>
                                        <span class="ml-2 px-2 py-1 bg-<?php echo $proj['status'] === 'completed' ? 'green' : ($proj['status'] === 'in_progress' ? 'blue' : 'gray'); ?>-100 text-<?php echo $proj['status'] === 'completed' ? 'green' : ($proj['status'] === 'in_progress' ? 'blue' : 'gray'); ?>-800 text-xs font-medium rounded-full whitespace-nowrap">
                                            <?php echo ucfirst(str_replace('_', ' ', $proj['status'])); ?>
                                        </span>
                                    </div>
                                    
                                    <?php if ($proj['subtitle']): ?>
                                    <p class="text-gray-600 text-sm mb-3"><?php echo htmlspecialchars($proj['subtitle']); ?></p>
                                    <?php endif; ?>
                                    
                                    <!-- Project Meta -->
                                    <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div class="flex items-center space-x-3">
                                            <span><i class="fas fa-images mr-1"></i> <?php echo $proj['image_count']; ?></span>
                                            <span><i class="fas fa-link mr-1"></i> <?php echo $proj['link_count']; ?></span>
                                            <span><i class="fas fa-list mr-1"></i> <?php echo $proj['highlight_count']; ?></span>
                                        </div>
                                        <span class="capitalize"><?php echo $proj['size']; ?></span>
                                    </div>
                                    
                                    <!-- Technologies -->
                                    <?php if ($proj['technologies']): ?>
                                    <div class="mb-4">
                                        <div class="flex flex-wrap gap-1">
                                            <?php 
                                            $techs = explode(',', $proj['technologies']);
                                            $techCount = 0;
                                            foreach ($techs as $tech): 
                                                $tech = trim($tech);
                                                if (!empty($tech) && $techCount < 3):
                                                    $techCount++;
                                            ?>
                                            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                <?php echo htmlspecialchars($tech); ?>
                                            </span>
                                            <?php 
                                                endif;
                                            endforeach; 
                                            if (count($techs) > 3):
                                            ?>
                                            <span class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                                +<?php echo count($techs) - 3; ?> more
                                            </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Actions -->
                                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div class="flex items-center space-x-2">
                                            <a href="?action=view&id=<?php echo $proj['id']; ?>" 
                                               class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                <i class="fas fa-eye mr-1"></i>View
                                            </a>
                                            <a href="?action=edit&id=<?php echo $proj['id']; ?>" 
                                               class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                <i class="fas fa-edit mr-1"></i>Edit
                                            </a>
                                        </div>
                                        
                                        <div class="flex items-center space-x-2">
                                            <form method="post" class="inline" onsubmit="return confirm('Create a copy of this project?')">
                                                <input type="hidden" name="duplicate_project" value="1">
                                                <input type="hidden" name="id" value="<?php echo $proj['id']; ?>">
                                                <button type="submit" class="text-green-600 hover:text-green-700 text-sm font-medium">
                                                    <i class="fas fa-copy mr-1"></i>Copy
                                                </button>
                                            </form>
                                            
                                            <button onclick="deleteProject(<?php echo $proj['id']; ?>)" 
                                                    class="text-red-600 hover:text-red-700 text-sm font-medium">
                                                <i class="fas fa-trash mr-1"></i>Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Timestamps -->
                                    <div class="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                        Created: <?php echo date('M j, Y', strtotime($proj['created_at'])); ?>
                                        <?php if ($proj['updated_at'] !== $proj['created_at']): ?>
                                        • Updated: <?php echo date('M j, Y', strtotime($proj['updated_at'])); ?>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <?php elseif (in_array($action, ['add', 'edit'])): ?>
                    <!-- Add/Edit Form -->
                    <div class="max-w-4xl">
                        <form method="post" id="project-form" class="space-y-6">
                            <!-- Basic Information Card -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-info-circle mr-2 text-primary-500"></i>
                                    Basic Information
                                </h3>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                                        <input type="text" name="title" id="project-title" required 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($project['title'] ?? ''); ?>"
                                               placeholder="Enter your project title">
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                                        <div class="flex">
                                            <span class="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                                                <?php echo $_SERVER['HTTP_HOST']; ?>/project/
                                            </span>
                                            <input type="text" name="slug" id="project-slug" required 
                                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                                   value="<?php echo htmlspecialchars($project['slug'] ?? ''); ?>"
                                                   placeholder="project-slug">
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1">
                                            <i class="fas fa-lightbulb mr-1"></i>
                                            <span id="slug-auto-text">Leave empty to auto-generate from title</span>
                                        </p>
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                                        <input type="text" name="subtitle" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($project['subtitle'] ?? ''); ?>"
                                               placeholder="Brief description or tagline">
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                                        <textarea name="description" rows="4" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                  placeholder="Detailed description of your project..."><?php echo htmlspecialchars($project['description'] ?? ''); ?></textarea>
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                                        <textarea name="short_description" rows="2" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                  placeholder="Brief description for cards and previews..."><?php echo htmlspecialchars($project['short_description'] ?? ''); ?></textarea>
                                        <p class="text-xs text-gray-500 mt-1">Used in project cards and previews (recommended: 1-2 sentences)</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Media & Links Card -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-images mr-2 text-primary-500"></i>
                                    Media & Links
                                </h3>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                                        <input type="text" name="thumbnail" id="thumbnail-input"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($project['thumbnail'] ?? ''); ?>"
                                               placeholder="assets/images/projects/thumbnail.jpg">
                                        <p class="text-xs text-gray-500 mt-1">Path relative to root directory</p>
                                        
                                        <!-- Thumbnail Preview -->
                                        <div id="thumbnail-preview" class="mt-3">
                                            <?php if (!empty($project['thumbnail'])): ?>
                                            <img src="<?php echo getImagePath($project['thumbnail']); ?>" 
                                                 alt="Thumbnail preview" 
                                                 class="w-32 h-20 object-cover rounded border border-gray-200"
                                                 onerror="this.style.display='none'">
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                                        <input type="text" name="technologies" id="technologies-input"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($project['technologies'] ?? ''); ?>"
                                               placeholder="React, Node.js, MongoDB, Tailwind CSS">
                                        <p class="text-xs text-gray-500 mt-1">Comma-separated list of technologies</p>
                                        
                                        <!-- Technology Preview -->
                                        <div id="tech-preview" class="mt-3 flex flex-wrap gap-1">
                                            <?php if (!empty($project['technologies'])): ?>
                                                <?php foreach (explode(',', $project['technologies']) as $tech): ?>
                                                    <span class="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                                                        <?php echo htmlspecialchars(trim($tech)); ?>
                                                    </span>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Live Demo URL</label>
                                        <input type="url" name="live_url" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($projectLinks[0]['url'] ?? ''); ?>"
                                               placeholder="https://your-project.com">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">GitHub Repository</label>
                                        <input type="url" name="github_url" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($projectLinks[1]['url'] ?? ''); ?>"
                                               placeholder="https://github.com/username/project">
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Demo/Additional URL</label>
                                        <input type="url" name="demo_url" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo htmlspecialchars($projectLinks[2]['url'] ?? ''); ?>"
                                               placeholder="https://demo.your-project.com">
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Images</label>
                                        <textarea name="project_images" rows="4" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                  placeholder="assets/images/projects/image1.jpg&#10;assets/images/projects/image2.jpg&#10;assets/images/projects/image3.jpg"><?php echo htmlspecialchars(implode("\n", array_column($projectImages, 'image_path'))); ?></textarea>
                                        <p class="text-xs text-gray-500 mt-1">One image path per line (for slideshow)</p>
                                    </div>
                                    
                                    <div class="lg:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Highlights</label>
                                        <textarea name="highlights" rows="4" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                  placeholder="Responsive design&#10;Real-time data updates&#10;User authentication&#10;Admin dashboard"><?php echo htmlspecialchars(implode("\n", array_column($projectHighlights, 'highlight_text'))); ?></textarea>
                                        <p class="text-xs text-gray-500 mt-1">One highlight per line (key features or achievements)</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Project Settings Card -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-cog mr-2 text-primary-500"></i>
                                    Project Settings
                                </h3>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Size</label>
                                      <select name="size" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
    <option value="sm" <?php echo ($project['size'] ?? '') === 'sm' || ($project['size'] ?? '') === 'small' ? 'selected' : ''; ?>>Small</option>
    <option value="md" <?php echo ($project['size'] ?? 'md') === 'md' || ($project['size'] ?? 'medium') === 'medium' ? 'selected' : ''; ?>>Medium</option>
    <option value="lg" <?php echo ($project['size'] ?? '') === 'lg' || ($project['size'] ?? '') === 'large' ? 'selected' : ''; ?>>Large</option>
</select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                            <option value="completed" <?php echo ($project['status'] ?? 'completed') === 'completed' ? 'selected' : ''; ?>>Completed</option>
                                            <option value="in_progress" <?php echo ($project['status'] ?? '') === 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                            <option value="draft" <?php echo ($project['status'] ?? '') === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                            <option value="planned" <?php echo ($project['status'] ?? '') === 'planned' ? 'selected' : ''; ?>>Planned</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                        <input type="number" name="sort_order" min="0" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo $project['sort_order'] ?? 0; ?>">
                                        <p class="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Position Top (%)</label>
                                        <input type="number" name="position_top" min="0" max="100" step="0.1" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo $project ? str_replace('%', '', $project['position_top']) : ''; ?>"
                                               placeholder="Auto">
                                        <p class="text-xs text-gray-500 mt-1">Leave empty for auto-positioning</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Position Left (%)</label>
                                        <input type="number" name="position_left" min="0" max="100" step="0.1" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                               value="<?php echo $project ? str_replace('%', '', $project['position_left']) : ''; ?>"
                                               placeholder="Auto">
                                        <p class="text-xs text-gray-500 mt-1">Leave empty for auto-positioning</p>
                                    </div>
                                    
                                    <div class="lg:col-span-3">
                                        <div class="flex items-center space-x-8">
                                            <label class="flex items-center">
                                                <input type="checkbox" name="is_featured" value="1" 
                                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                                                       <?php echo ($project['is_featured'] ?? 0) ? 'checked' : ''; ?>>
                                                <span class="ml-2 text-sm text-gray-700">
                                                    <i class="fas fa-star mr-1 text-yellow-500"></i>
                                                    Featured Project
                                                </span>
                                            </label>
                                            
                                            <label class="flex items-center">
                                                <input type="checkbox" name="is_active" value="1" 
                                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                                                       <?php echo ($project['is_active'] ?? 1) ? 'checked' : ''; ?>>
                                                <span class="ml-2 text-sm text-gray-700">
                                                    <i class="fas fa-eye mr-1 text-green-500"></i>
                                                    Active (Visible on Website)
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Form Actions -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <?php if ($action === 'edit'): ?>
                                        <form method="post" class="inline" onsubmit="return confirm('Create a copy of this project?')">
                                            <input type="hidden" name="duplicate_project" value="1">
                                            <button type="submit" class="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-white hover:bg-green-50 transition-colors">
                                                <i class="fas fa-copy mr-2"></i>
                                                Duplicate
                                            </button>
                                        </form>
                                        
                                        <button onclick="deleteProject(<?php echo $projectId; ?>)" 
                                                class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors">
                                            <i class="fas fa-trash mr-2"></i>
                                            Delete Project
                                        </button>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3">
                                        <a href="projects.php" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </a>
                                        
                                        <?php if ($action === 'edit'): ?>
                                        <a href="?action=view&id=<?php echo $projectId; ?>" class="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-lg text-primary-700 bg-white hover:bg-primary-50 transition-colors">
                                            <i class="fas fa-eye mr-2"></i>
                                            Preview
                                        </a>
                                        <?php endif; ?>
                                        
                                        <button type="submit" name="save_project" class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                                            <i class="fas fa-save mr-2"></i>
                                            <?php echo $action === 'edit' ? 'Update' : 'Create'; ?> Project
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <?php elseif ($action === 'view' && $project): ?>
                    <!-- View Project (keeping existing view code) -->
                    <div class="max-w-4xl">
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <!-- Project Header -->
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <h2 class="text-2xl font-bold text-gray-900 mb-2"><?php echo htmlspecialchars($project['title']); ?></h2>
                                        <?php if ($project['subtitle']): ?>
                                        <p class="text-lg text-gray-600 mb-4"><?php echo htmlspecialchars($project['subtitle']); ?></p>
                                        <?php endif; ?>
                                        
                                        <div class="flex items-center space-x-4 text-sm">
                                            <span class="px-3 py-1 bg-<?php echo $project['status'] === 'completed' ? 'green' : ($project['status'] === 'in_progress' ? 'blue' : 'gray'); ?>-100 text-<?php echo $project['status'] === 'completed' ? 'green' : ($project['status'] === 'in_progress' ? 'blue' : 'gray'); ?>-800 rounded-full">
                                                <?php echo ucfirst(str_replace('_', ' ', $project['status'])); ?>
                                            </span>
                                            
                                            <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full capitalize">
                                                <?php echo $project['size']; ?>
                                            </span>
                                            
                                            <?php if ($project['is_featured']): ?>
                                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                <i class="fas fa-star mr-1"></i>Featured
                                            </span>
                                            <?php endif; ?>
                                            
                                            <span class="px-3 py-1 bg-<?php echo $project['is_active'] ? 'green' : 'red'; ?>-100 text-<?php echo $project['is_active'] ? 'green' : 'red'; ?>-800 rounded-full">
                                                <?php echo $project['is_active'] ? 'Active' : 'Inactive'; ?>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3 ml-6">
                                        <a href="?action=edit&id=<?php echo $project['id']; ?>" class="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-lg text-primary-700 bg-white hover:bg-primary-50">
                                            <i class="fas fa-edit mr-2"></i>
                                            Edit Project
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                <!-- Project Details -->
                                <div class="space-y-6">
                                    <?php if ($project['description']): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
                                        <p class="text-gray-600"><?php echo nl2br(htmlspecialchars($project['description'])); ?></p>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Technologies -->
                                    <?php if ($project['technologies']): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-3">Technologies</h3>
                                        <div class="flex flex-wrap gap-2">
                                            <?php foreach (explode(',', $project['technologies']) as $tech): ?>
                                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                                                <?php echo htmlspecialchars(trim($tech)); ?>
                                            </span>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Project Links -->
                                    <?php if ($projectLinks): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-3">Project Links</h3>
                                        <div class="space-y-2">
                                            <?php foreach ($projectLinks as $link): ?>
                                            <a href="<?php echo htmlspecialchars($link['url']); ?>" target="_blank" 
                                               class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <i class="fas fa-<?php echo $link['link_type'] === 'github' ? 'code-branch' : ($link['link_type'] === 'demo' ? 'play' : 'external-link-alt'); ?> mr-3 text-gray-400"></i>
                                                <div>
                                                    <div class="font-medium text-gray-900 capitalize"><?php echo str_replace('_', ' ', $link['link_type']); ?></div>
                                                    <div class="text-sm text-gray-500"><?php echo htmlspecialchars($link['url']); ?></div>
                                                </div>
                                            </a>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Project Highlights -->
                                    <?php if ($projectHighlights): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-3">Project Highlights</h3>
                                        <ul class="space-y-2">
                                            <?php foreach ($projectHighlights as $highlight): ?>
                                            <li class="flex items-start">
                                                <i class="fas fa-check text-green-500 mr-2 mt-1 text-sm"></i>
                                                <span class="text-gray-600"><?php echo htmlspecialchars($highlight['highlight_text']); ?></span>
                                            </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                    <?php endif; ?>
                                </div>
                                
                                <!-- Project Media -->
                                <div class="space-y-6">
                                    <!-- Thumbnail -->
                                    <?php if ($project['thumbnail']): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-3">Project Thumbnail</h3>
                                        <img src="<?php echo getImagePath($project['thumbnail']); ?>" 
                                             alt="<?php echo htmlspecialchars($project['title']); ?>" 
                                             class="w-full h-64 object-cover rounded-lg border border-gray-200"
                                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                                        <div class="w-full h-64 hidden items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                            <i class="fas fa-image text-gray-400 text-3xl"></i>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <!-- Project Images -->
                                    <?php if ($projectImages): ?>
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-3">Project Images (<?php echo count($projectImages); ?>)</h3>
                                        <div class="grid grid-cols-2 gap-3">
                                            <?php foreach ($projectImages as $image): ?>
                                            <img src="<?php echo getImagePath($image['image_path']); ?>" 
                                                 alt="Project image" 
                                                 class="w-full h-32 object-cover rounded border border-gray-200"
                                                 onerror="this.style.display='none'">
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>
    
    <!-- JavaScript -->
    <script>
        // Auto-generate slug from title
        document.getElementById('project-title')?.addEventListener('input', function() {
            const title = this.value;
            const slugInput = document.getElementById('project-slug');
            
            if (title && !slugInput.value) {
                fetch('projects.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'ajax_action=generate_slug&title=' + encodeURIComponent(title) + '&project_id=<?php echo $projectId ?: 0; ?>'
                })
                .then(response => response.json())
                .then(data => {
                    slugInput.value = data.slug;
                });
            }
        });
        
        // Preview thumbnail
        document.getElementById('thumbnail-input')?.addEventListener('input', function() {
            const path = this.value;
            const preview = document.getElementById('thumbnail-preview');
            
            if (path) {
                // Build the correct path for preview
                let previewPath = path;
                if (!path.startsWith('http') && !path.startsWith('../')) {
                    if (path.startsWith('assets/') || path.startsWith('/')) {
                        previewPath = '../' + path.replace(/^\//, '');
                    } else {
                        previewPath = '../assets/images/projects/' + path;
                    }
                }
                
                preview.innerHTML = '<img src="' + previewPath + '" alt="Thumbnail preview" class="w-32 h-20 object-cover rounded border border-gray-200" onerror="this.style.display=\'none\'">';
            } else {
                preview.innerHTML = '';
            }
        });
        
        // Preview technologies
        document.getElementById('technologies-input')?.addEventListener('input', function() {
            const technologies = this.value;
            const preview = document.getElementById('tech-preview');
            
            if (technologies) {
                const techArray = technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
                preview.innerHTML = techArray.map(tech => 
                    '<span class="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">' + tech + '</span>'
                ).join('');
            } else {
                preview.innerHTML = '';
            }
        });
        
        // Toggle project status via AJAX
        function toggleProjectStatus(projectId, field, value) {
            fetch('projects.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'ajax_action=toggle_status&project_id=' + projectId + '&field=' + field + '&value=' + value
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload(); // Refresh to show changes
                } else {
                    alert('Failed to update project status');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update project status');
            });
        }
        
        // Delete project via AJAX
        function deleteProject(projectId) {
            if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                fetch('projects.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'ajax_action=delete_project&project_id=' + projectId
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        location.reload(); // Refresh to show changes
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete project');
                });
            }
        }
        
        // Form submission with loading state
        document.getElementById('project-form')?.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
            submitBtn.disabled = true;
            
            // Re-enable if form submission fails
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        });
    </script>
</body>
</html>