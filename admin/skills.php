<?php
// /admin/skills.php
// Complete Skills Management Interface with CRUD operations, category management, and proficiency levels

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
$skillId = $_GET['id'] ?? null;

// Handle AJAX requests
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['ajax_action']) {
        case 'generate_slug':
            $name = $_POST['name'] ?? '';
            $slug = strtolower(trim($name));
            $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
            $slug = preg_replace('/-+/', '-', $slug);
            $slug = trim($slug, '-');
            
            // Check uniqueness
            $counter = 1;
            $originalSlug = $slug;
            while (true) {
                $existing = $db->fetch("SELECT id FROM skills WHERE slug = ? AND id != ?", [$slug, $skillId ?: 0]);
                if (!$existing) break;
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            echo json_encode(['slug' => $slug]);
            exit;
            
        case 'toggle_status':
            $id = $_POST['skill_id'] ?? 0;
            $field = $_POST['field'] ?? '';
            $value = $_POST['value'] ?? 0;
            
            if ($id && in_array($field, ['is_active', 'is_featured'])) {
                $db->execute("UPDATE skills SET {$field} = ? WHERE id = ?", [$value, $id]);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
            exit;
            
        case 'update_proficiency':
            $id = $_POST['skill_id'] ?? 0;
            $level = $_POST['level'] ?? 0;
            
            if ($id && is_numeric($level) && $level >= 0 && $level <= 100) {
                $db->execute("UPDATE skills SET skill_level = ?, proficiency_level = ? WHERE id = ?", [$level, $level, $id]);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
            exit;
            
        case 'delete_skill':
            $id = $_POST['skill_id'] ?? 0;
            if ($id) {
                try {
                    $db->execute("DELETE FROM skills WHERE id = ?", [$id]);
                    echo json_encode(['success' => true, 'message' => 'Skill deleted successfully!']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete skill: ' . $e->getMessage()]);
                }
            }
            exit;
            
        case 'add_category':
            $name = trim($_POST['name'] ?? '');
            $color = $_POST['color'] ?? '#3B82F6';
            $description = trim($_POST['description'] ?? '');
            
            if ($name) {
                $slug = strtolower(preg_replace('/[^a-z0-9-]/', '-', $name));
                $slug = preg_replace('/-+/', '-', trim($slug, '-'));
                
                $maxOrder = $db->fetch("SELECT MAX(sort_order) as max_order FROM skill_categories")['max_order'] ?? 0;
                
                try {
                    $db->execute(
                        "INSERT INTO skill_categories (name, slug, description, color, sort_order) VALUES (?, ?, ?, ?, ?)",
                        [$name, $slug, $description, $color, $maxOrder + 1]
                    );
                    echo json_encode(['success' => true, 'message' => 'Category added successfully!']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Failed to add category: ' . $e->getMessage()]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Category name is required']);
            }
            exit;
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['ajax_action'])) {
    if ($action === 'add' || $action === 'edit') {
        $name = trim($_POST['name'] ?? '');
        $categoryId = $_POST['category_id'] ?? 0;
        $skillLevel = $_POST['skill_level'] ?? 50;
        $description = trim($_POST['description'] ?? '');
        $icon = trim($_POST['icon'] ?? '');
        $yearsExperience = $_POST['years_experience'] ?? null;
        $color = $_POST['color'] ?? null;
        $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
        
        if ($name && $categoryId) {
            $slug = strtolower(preg_replace('/[^a-z0-9-]/', '-', $name));
            $slug = preg_replace('/-+/', '-', trim($slug, '-'));
            
            try {
                if ($action === 'add') {
                    $maxOrder = $db->fetch("SELECT MAX(sort_order) as max_order FROM skills WHERE category_id = ?", [$categoryId])['max_order'] ?? 0;
                    
                    $db->execute(
                        "INSERT INTO skills (name, slug, category_id, skill_level, proficiency_level, description, icon, years_experience, color, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [$name, $slug, $categoryId, $skillLevel, $skillLevel, $description, $icon, $yearsExperience, $color, $isFeatured, $maxOrder + 1]
                    );
                    $message = 'Skill added successfully!';
                } else {
                    $db->execute(
                        "UPDATE skills SET name = ?, slug = ?, category_id = ?, skill_level = ?, proficiency_level = ?, description = ?, icon = ?, years_experience = ?, color = ?, is_featured = ? WHERE id = ?",
                        [$name, $slug, $categoryId, $skillLevel, $skillLevel, $description, $icon, $yearsExperience, $color, $isFeatured, $skillId]
                    );
                    $message = 'Skill updated successfully!';
                }
                $action = 'list';
            } catch (Exception $e) {
                $error = 'Database error: ' . $e->getMessage();
            }
        } else {
            $error = 'Please fill in all required fields.';
        }
    }
}

// Get skill data for editing
$skill = null;
if ($skillId && in_array($action, ['edit', 'view'])) {
    $skill = $db->fetch("SELECT * FROM skills WHERE id = ?", [$skillId]);
    if (!$skill) {
        $error = 'Skill not found';
        $action = 'list';
    }
}

// Get skills for listing with search and filter
$searchTerm = $_GET['search'] ?? '';
$categoryFilter = $_GET['category'] ?? '';
$featuredFilter = $_GET['featured'] ?? '';
$levelFilter = $_GET['level'] ?? '';

$skills = [];
if ($action === 'list') {
    $whereConditions = [];
    $params = [];
    
    if (!empty($searchTerm)) {
        $whereConditions[] = "(s.name LIKE ? OR s.description LIKE ?)";
        $params[] = "%{$searchTerm}%";
        $params[] = "%{$searchTerm}%";
    }
    
    if (!empty($categoryFilter)) {
        $whereConditions[] = "s.category_id = ?";
        $params[] = $categoryFilter;
    }
    
    if (!empty($featuredFilter)) {
        $whereConditions[] = "s.is_featured = ?";
        $params[] = $featuredFilter === 'yes' ? 1 : 0;
    }
    
    if (!empty($levelFilter)) {
        switch ($levelFilter) {
            case 'beginner':
                $whereConditions[] = "s.skill_level BETWEEN 0 AND 30";
                break;
            case 'intermediate':
                $whereConditions[] = "s.skill_level BETWEEN 31 AND 70";
                break;
            case 'advanced':
                $whereConditions[] = "s.skill_level BETWEEN 71 AND 100";
                break;
        }
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    $skills = $db->fetchAll("
        SELECT s.*, c.name as category_name, c.color as category_color
        FROM skills s
        LEFT JOIN skill_categories c ON s.category_id = c.id
        {$whereClause}
        ORDER BY c.sort_order, s.sort_order, s.created_at DESC
    ", $params);
}

// Get categories for dropdowns
$categories = $db->fetchAll("SELECT * FROM skill_categories WHERE is_active = 1 ORDER BY sort_order, name");

// Get statistics
$stats = [
    'total' => $db->fetch("SELECT COUNT(*) as count FROM skills")['count'],
    'active' => $db->fetch("SELECT COUNT(*) as count FROM skills WHERE is_active = 1")['count'],
    'featured' => $db->fetch("SELECT COUNT(*) as count FROM skills WHERE is_featured = 1")['count'],
    'categories' => $db->fetch("SELECT COUNT(*) as count FROM skill_categories WHERE is_active = 1")['count']
];

$pageTitle = match($action) {
    'add' => 'Add New Skill',
    'edit' => 'Edit Skill',
    'view' => 'View Skill',
    default => 'Skills Management'
};

$currentPage = "skills";
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
                    <a href="index.php" class="text-gray-600 hover:bg-gray-50 flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-chart-line w-5 h-5 mr-3"></i>
                        Dashboard
                    </a>
                    
                    <a href="projects.php" class="text-gray-600 hover:bg-gray-50 flex items-center px-4 py-3 text-sm font-medium rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                        <i class="fas fa-folder-open w-5 h-5 mr-3"></i>
                        Projects
                    </a>
                    
                    <a href="skills.php" class="bg-primary-50 text-primary-700 border-primary-200 flex items-center px-4 py-3 text-sm font-medium rounded-lg border transition-colors">
                        <i class="fas fa-cogs w-5 h-5 mr-3"></i>
                        Skills
                    </a>
                </nav>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 overflow-hidden">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="px-6 py-4">
                    <div class="flex items-center justify-between">
                        <h1 class="text-2xl font-bold text-gray-900"><?php echo $pageTitle; ?></h1>
                        <?php if ($action === 'list'): ?>
                        <div class="flex items-center space-x-4">
                            <!-- Quick Stats -->
                            <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                                <span><strong><?php echo $stats['active']; ?></strong> Active</span>
                                <span><strong><?php echo $stats['featured']; ?></strong> Featured</span>
                                <span><strong><?php echo $stats['categories']; ?></strong> Categories</span>
                            </div>
                            
                            <!-- Add Buttons -->
                            <div class="flex space-x-2">
                                <button onclick="openCategoryModal()" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    <i class="fas fa-plus mr-2"></i>
                                    Category
                                </button>
                                <a href="?action=add" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                                    <i class="fas fa-plus mr-2"></i>
                                    Add Skill
                                </a>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </header>
            
            <!-- Content -->
            <div class="flex-1 overflow-auto p-6">
                <!-- Messages -->
                <?php if ($message): ?>
                <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex">
                        <i class="fas fa-check-circle text-green-400 mr-3 mt-0.5"></i>
                        <span class="text-green-800"><?php echo htmlspecialchars($message); ?></span>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex">
                        <i class="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
                        <span class="text-red-800"><?php echo htmlspecialchars($error); ?></span>
                    </div>
                </div>
                <?php endif; ?>

                <?php if ($action === 'list'): ?>
                <!-- Skills Listing -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <!-- Filters -->
                    <div class="border-b border-gray-200 p-4">
                        <form method="GET" class="flex flex-wrap gap-4">
                            <div class="flex-1 min-w-64">
                                <input type="text" name="search" value="<?php echo htmlspecialchars($searchTerm); ?>" 
                                       placeholder="Search skills..." 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            </div>
                            
                            <select name="category" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All Categories</option>
                                <?php foreach ($categories as $category): ?>
                                <option value="<?php echo $category['id']; ?>" <?php echo $categoryFilter == $category['id'] ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($category['name']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                            
                            <select name="level" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All Levels</option>
                                <option value="beginner" <?php echo $levelFilter === 'beginner' ? 'selected' : ''; ?>>Beginner (0-30%)</option>
                                <option value="intermediate" <?php echo $levelFilter === 'intermediate' ? 'selected' : ''; ?>>Intermediate (31-70%)</option>
                                <option value="advanced" <?php echo $levelFilter === 'advanced' ? 'selected' : ''; ?>>Advanced (71-100%)</option>
                            </select>
                            
                            <select name="featured" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">All Skills</option>
                                <option value="yes" <?php echo $featuredFilter === 'yes' ? 'selected' : ''; ?>>Featured Only</option>
                                <option value="no" <?php echo $featuredFilter === 'no' ? 'selected' : ''; ?>>Non-Featured</option>
                            </select>
                            
                            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                <i class="fas fa-search mr-2"></i>Filter
                            </button>
                            
                            <?php if ($searchTerm || $categoryFilter || $featuredFilter || $levelFilter): ?>
                            <a href="skills.php" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                <i class="fas fa-times mr-2"></i>Clear
                            </a>
                            <?php endif; ?>
                        </form>
                    </div>
                    
                    <!-- Skills Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proficiency</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php if (empty($skills)): ?>
                                <tr>
                                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                        <i class="fas fa-cogs text-4xl text-gray-300 mb-4"></i>
                                        <p class="text-lg font-medium mb-2">No skills found</p>
                                        <p class="text-sm">Add your first skill to get started.</p>
                                    </td>
                                </tr>
                                <?php else: ?>
                                <?php foreach ($skills as $skillItem): ?>
                                <tr class="hover:bg-gray-50" data-skill-id="<?php echo $skillItem['id']; ?>">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <?php if ($skillItem['icon']): ?>
                                            <i class="<?php echo htmlspecialchars($skillItem['icon']); ?> text-lg mr-3" 
                                               style="color: <?php echo $skillItem['color'] ?: $skillItem['category_color']; ?>"></i>
                                            <?php endif; ?>
                                            <div>
                                                <div class="text-sm font-medium text-gray-900 flex items-center">
                                                    <?php echo htmlspecialchars($skillItem['name']); ?>
                                                    <?php if ($skillItem['is_featured']): ?>
                                                    <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <i class="fas fa-star mr-1"></i>Featured
                                                    </span>
                                                    <?php endif; ?>
                                                </div>
                                                <?php if ($skillItem['description']): ?>
                                                <div class="text-sm text-gray-500"><?php echo htmlspecialchars($skillItem['description']); ?></div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                                              style="background-color: <?php echo $skillItem['category_color']; ?>20; color: <?php echo $skillItem['category_color']; ?>">
                                            <?php echo htmlspecialchars($skillItem['category_name']); ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center space-x-3">
                                            <div class="flex-1 bg-gray-200 rounded-full h-2">
                                                <div class="h-2 rounded-full transition-all duration-300" 
                                                     style="width: <?php echo $skillItem['skill_level']; ?>%; background-color: <?php echo $skillItem['category_color']; ?>"></div>
                                            </div>
                                            <span class="text-sm font-medium text-gray-900 w-12 text-right"><?php echo $skillItem['skill_level']; ?>%</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        <?php echo $skillItem['years_experience'] ? $skillItem['years_experience'] . ' years' : '—'; ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" 
                                                   <?php echo $skillItem['is_active'] ? 'checked' : ''; ?>
                                                   onchange="toggleSkillStatus(<?php echo $skillItem['id']; ?>, 'is_active', this.checked ? 1 : 0)"
                                                   class="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                                            <span class="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm font-medium space-x-2">
                                        <a href="?action=edit&id=<?php echo $skillItem['id']; ?>" 
                                           class="text-primary-600 hover:text-primary-900">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <button onclick="deleteSkill(<?php echo $skillItem['id']; ?>)" 
                                                class="text-red-600 hover:text-red-900">
                                            <i class="fas fa-trash"></i>
                                        </button>
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
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form method="POST" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Skill Name -->
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Skill Name *</label>
                                <input type="text" id="name" name="name" required
                                       value="<?php echo htmlspecialchars($skill['name'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            </div>
                            
                            <!-- Category -->
                            <div>
                                <label for="category_id" class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select id="category_id" name="category_id" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Select Category</option>
                                    <?php foreach ($categories as $category): ?>
                                    <option value="<?php echo $category['id']; ?>" 
                                            <?php echo ($skill['category_id'] ?? '') == $category['id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($category['name']); ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <!-- Skill Level -->
                            <div>
                                <label for="skill_level" class="block text-sm font-medium text-gray-700 mb-2">
                                    Proficiency Level: <span id="level-display"><?php echo $skill['skill_level'] ?? 50; ?>%</span>
                                </label>
                                <input type="range" id="skill_level" name="skill_level" min="0" max="100" 
                                       value="<?php echo $skill['skill_level'] ?? 50; ?>"
                                       oninput="document.getElementById('level-display').textContent = this.value + '%'"
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                            </div>
                            
                            <!-- Years of Experience -->
                            <div>
                                <label for="years_experience" class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                <input type="number" id="years_experience" name="years_experience" step="0.1" min="0"
                                       value="<?php echo htmlspecialchars($skill['years_experience'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            </div>
                            
                            <!-- Icon -->
                            <div>
                                <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">Icon Class (Font Awesome)</label>
                                <input type="text" id="icon" name="icon" placeholder="e.g., fab fa-js-square"
                                       value="<?php echo htmlspecialchars($skill['icon'] ?? ''); ?>"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            </div>
                            
                            <!-- Color -->
                            <div>
                                <label for="color" class="block text-sm font-medium text-gray-700 mb-2">Custom Color</label>
                                <input type="color" id="color" name="color"
                                       value="<?php echo $skill['color'] ?? '#3B82F6'; ?>"
                                       class="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="description" name="description" rows="3"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                      placeholder="Brief description of your skill level and experience..."><?php echo htmlspecialchars($skill['description'] ?? ''); ?></textarea>
                        </div>
                        
                        <!-- Featured Skill -->
                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="is_featured" value="1" 
                                       <?php echo ($skill['is_featured'] ?? 0) ? 'checked' : ''; ?>
                                       class="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                                <span class="ml-2 text-sm text-gray-700">Featured Skill (highlight on frontend)</span>
                            </label>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                            <a href="skills.php" class="text-gray-600 hover:text-gray-900">
                                <i class="fas fa-arrow-left mr-2"></i>Back to Skills
                            </a>
                            <div class="space-x-3">
                                <a href="skills.php" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </a>
                                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                    <i class="fas fa-save mr-2"></i>
                                    <?php echo $action === 'add' ? 'Add Skill' : 'Update Skill'; ?>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Category Modal -->
    <div id="categoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Add New Category</h3>
                </div>
                <form id="categoryForm" class="p-6 space-y-4">
                    <div>
                        <label for="category_name" class="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                        <input type="text" id="category_name" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                        <label for="category_color" class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <input type="color" id="category_color" value="#3B82F6"
                               class="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                        <label for="category_description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="category_description" rows="2"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" onclick="closeCategoryModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
    // Toggle skill status
    function toggleSkillStatus(skillId, field, value) {
        fetch('skills.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `ajax_action=toggle_status&skill_id=${skillId}&field=${field}&value=${value}`
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Failed to update skill status');
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred');
            location.reload();
        });
    }

    // Delete skill
    function deleteSkill(skillId) {
        if (confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
            fetch('skills.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=delete_skill&skill_id=${skillId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert(data.message || 'Failed to delete skill');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred');
            });
        }
    }

    // Category modal functions
    function openCategoryModal() {
        document.getElementById('categoryModal').classList.remove('hidden');
    }

    function closeCategoryModal() {
        document.getElementById('categoryModal').classList.add('hidden');
        document.getElementById('categoryForm').reset();
    }

    // Handle category form submission
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('ajax_action', 'add_category');
        formData.append('name', document.getElementById('category_name').value);
        formData.append('color', document.getElementById('category_color').value);
        formData.append('description', document.getElementById('category_description').value);

        fetch('skills.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert(data.message || 'Failed to add category');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred');
        });
    });

    // Close modal when clicking outside
    document.getElementById('categoryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCategoryModal();
        }
    });
    </script>
</body>
</html>