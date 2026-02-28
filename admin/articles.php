<?php
// /admin/articles.php
// Complete Articles Management Interface with Rich Text Editor

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/ArticleManager.php';

$db = Database::getInstance();
$articleManager = new ArticleManager($db);
$user = $db->fetch("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);

// Handle actions
$action = $_GET['action'] ?? 'list';
$articleId = $_GET['id'] ?? null;
$message = $_SESSION['message'] ?? null;
$error = $_SESSION['error'] ?? null;
unset($_SESSION['message'], $_SESSION['error']);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if ($action === 'create') {
            $data = [
                'title' => $_POST['title'],
                'excerpt' => $_POST['excerpt'],
                'content' => $_POST['content'],
                'featured_image' => $_POST['featured_image'],
                'status' => $_POST['status'],
                'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                'author_id' => $_SESSION['user_id'],
                'category_id' => !empty($_POST['category_id']) ? $_POST['category_id'] : null,
                'meta_title' => $_POST['meta_title'],
                'meta_description' => $_POST['meta_description'],
                'published_at' => $_POST['published_at'] ?? null,
                'tags' => !empty($_POST['tags']) ? explode(',', $_POST['tags']) : []
            ];
            
            $articleId = $articleManager->createArticle($data);
            $_SESSION['message'] = 'Article created successfully!';
            header("Location: articles.php?action=edit&id={$articleId}");
            exit;
            
        } elseif ($action === 'update' && $articleId) {
            $data = [
                'title' => $_POST['title'],
                'excerpt' => $_POST['excerpt'],
                'content' => $_POST['content'],
                'featured_image' => $_POST['featured_image'],
                'status' => $_POST['status'],
                'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                'category_id' => !empty($_POST['category_id']) ? $_POST['category_id'] : null,
                'meta_title' => $_POST['meta_title'],
                'meta_description' => $_POST['meta_description'],
                'published_at' => $_POST['published_at'] ?? null,
                'tags' => !empty($_POST['tags']) ? explode(',', $_POST['tags']) : []
            ];
            
            $articleManager->updateArticle($articleId, $data);
            $_SESSION['message'] = 'Article updated successfully!';
            header("Location: articles.php?action=edit&id={$articleId}");
            exit;
            
        } elseif ($action === 'delete' && $articleId) {
            $articleManager->deleteArticle($articleId);
            $_SESSION['message'] = 'Article deleted successfully!';
            header('Location: articles.php');
            exit;
        }
    } catch (Exception $e) {
        $_SESSION['error'] = $e->getMessage();
    }
}

// Get data for the current action
if ($action === 'list') {
    // Get filters
    $search = $_GET['search'] ?? '';
    $categoryFilter = $_GET['category'] ?? '';
    $statusFilter = $_GET['status'] ?? '';
    $featuredFilter = $_GET['featured'] ?? '';
    $page = max(1, intval($_GET['page'] ?? 1));
    $perPage = 10;
    
    // Get articles with filters
    $filterOptions = [
        'page' => $page,
        'per_page' => $perPage,
        'search' => $search,
        'category_id' => $categoryFilter ?: null,
        'status' => $statusFilter ?: null,
        'featured' => $featuredFilter === 'yes' ? true : ($featuredFilter === 'no' ? false : null)
    ];
    
    $articles = $articleManager->getArticles($filterOptions);
    $totalArticles = $articleManager->getArticlesCount($filterOptions);
    $totalPages = ceil($totalArticles / $perPage);
    
    // Get categories for filter
    $categories = $articleManager->getCategories();
    
} elseif (in_array($action, ['add', 'edit']) && ($action === 'add' || $articleId)) {
    $article = $action === 'edit' ? $articleManager->getArticleById($articleId) : null;
    $categories = $articleManager->getCategories();
}

// Get statistics
$stats = $articleManager->getStatistics();

$pageTitle = match($action) {
    'add' => 'Add New Article',
    'edit' => 'Edit Article',
    'view' => 'View Article',
    default => 'Articles Management'
};

$currentPage = "articles";

// Helper function to format date
function formatDate($date) {
    return $date ? date('M j, Y g:i A', strtotime($date)) : 'Not set';
}

// Helper function to get status badge
function getStatusBadge($status) {
    $badges = [
        'draft' => 'bg-gray-100 text-gray-800',
        'published' => 'bg-green-100 text-green-800',
        'scheduled' => 'bg-blue-100 text-blue-800'
    ];
    return $badges[$status] ?? 'bg-gray-100 text-gray-800';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - Portfolio Admin</title>
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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <?php if (in_array($action, ['add', 'edit'])): ?>
    <!-- TinyMCE Rich Text Editor -->
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
    <script>
        tinymce.init({
            selector: '#content',
            height: 400,
            menubar: false,
            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
            setup: function (editor) {
                editor.on('change', function () {
                    editor.save();
                });
            }
        });
    </script>
    <?php endif; ?>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm border-r border-gray-200">
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Portfolio Admin</h2>
            </div>
            
            <div class="flex flex-col justify-between h-full pb-6">
                <!-- User Profile -->
                <div class="p-4 border-b border-gray-200">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                            <?php echo strtoupper(substr($user['first_name'], 0, 1) . substr($user['last_name'], 0, 1)); ?>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">
                                <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?>
                            </h3>
                            <p class="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>
                
                <!-- Navigation -->
                <nav class="flex-1 px-4 py-6 space-y-2">
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
                    <a href="profile.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-user mr-3"></i>
                        Profile
                    </a>
                    <a href="articles.php" class="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                        <i class="fas fa-newspaper mr-3 text-primary-500"></i>
                        Articles
                        <span class="ml-auto bg-primary-200 text-primary-800 text-xs px-2 py-1 rounded-full"><?php echo $stats['total']; ?></span>
                    </a>
                    <a href="testimonials.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-quote-left mr-3"></i>
                        Testimonials
                    </a>
                    <a href="requests.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-envelope mr-3"></i>
                        Project Requests
                    </a>
                    <a href="media.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-images mr-3"></i>
                        Media
                    </a>
                    <a href="appearance.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-palette mr-3"></i>
                        Appearance
                    </a>
                    <a href="settings.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-cog mr-3"></i>
                        Settings
                    </a>
                </nav>
                
                <!-- Logout -->
                <div class="px-4">
                    <a href="logout.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        Logout
                    </a>
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
                                <span><i class="fas fa-newspaper mr-1"></i> <?php echo $stats['total']; ?> Total</span>
                                <span><i class="fas fa-check-circle mr-1"></i> <?php echo $stats['published']; ?> Published</span>
                                <span><i class="fas fa-edit mr-1"></i> <?php echo $stats['draft']; ?> Drafts</span>
                                <span><i class="fas fa-clock mr-1"></i> <?php echo $stats['scheduled']; ?> Scheduled</span>
                                <span><i class="fas fa-star mr-1"></i> <?php echo $stats['featured']; ?> Featured</span>
                                <span><i class="fas fa-eye mr-1"></i> <?php echo number_format($stats['total_views']); ?> Views</span>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <?php if ($action === 'list'): ?>
                            <a href="?action=add" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                Add Article
                            </a>
                            <?php elseif ($action === 'edit'): ?>
                            <a href="../article.php?slug=<?php echo htmlspecialchars($article['slug']); ?>" target="_blank" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                <i class="fas fa-external-link-alt mr-2"></i>
                                Preview
                            </a>
                            <a href="articles.php" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to Articles
                            </a>
                            <?php elseif ($action === 'add'): ?>
                            <a href="articles.php" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Back to Articles
                            </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <div class="flex-1 overflow-auto p-6">
                <?php if ($message): ?>
                <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <i class="fas fa-check-circle mr-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                </div>
                <?php endif; ?>

                <?php if ($error): ?>
                <div class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <?php echo htmlspecialchars($error); ?>
                </div>
                <?php endif; ?>

                <?php if ($action === 'list'): ?>
                <!-- Articles List -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <!-- Filters -->
                    <div class="p-6 border-b border-gray-200">
                        <form method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="hidden" name="action" value="list">
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" 
                                       placeholder="Search articles..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Categories</option>
                                    <?php foreach ($categories as $cat): ?>
                                    <option value="<?php echo $cat['id']; ?>" <?php echo $categoryFilter == $cat['id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($cat['name']); ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">All Status</option>
                                    <option value="published" <?php echo $statusFilter === 'published' ? 'selected' : ''; ?>>Published</option>
                                    <option value="draft" <?php echo $statusFilter === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                    <option value="scheduled" <?php echo $statusFilter === 'scheduled' ? 'selected' : ''; ?>>Scheduled</option>
                                </select>
                            </div>
                            
                            <div class="flex items-end">
                                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    <i class="fas fa-search mr-2"></i>
                                    Filter
                                </button>
                                <a href="articles.php" class="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    Clear
                                </a>
                            </div>
                        </form>
                    </div>

                    <!-- Articles Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php foreach ($articles as $article): ?>
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div class="flex items-start space-x-3">
                                            <?php if ($article['featured_image']): ?>
                                            <img src="<?php echo htmlspecialchars($article['featured_image']); ?>" alt="" class="w-12 h-12 object-cover rounded-lg">
                                            <?php else: ?>
                                            <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <i class="fas fa-image text-gray-400"></i>
                                            </div>
                                            <?php endif; ?>
                                            <div class="flex-1 min-w-0">
                                                <h3 class="text-sm font-medium text-gray-900 truncate">
                                                    <?php echo htmlspecialchars($article['title']); ?>
                                                    <?php if ($article['is_featured']): ?>
                                                    <i class="fas fa-star text-yellow-400 ml-1" title="Featured"></i>
                                                    <?php endif; ?>
                                                </h3>
                                                <p class="text-sm text-gray-500 truncate">
                                                    <?php echo htmlspecialchars($article['excerpt'] ?? 'No excerpt'); ?>
                                                </p>
                                                <div class="flex items-center mt-1 text-xs text-gray-400">
                                                    <span><?php echo $article['tag_count']; ?> tags</span>
                                                    <span class="mx-1">•</span>
                                                    <span><?php echo $article['reading_time'] ?? 1; ?> min read</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <?php if ($article['category_name']): ?>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                              style="background-color: <?php echo $article['category_color']; ?>20; color: <?php echo $article['category_color']; ?>">
                                            <?php echo htmlspecialchars($article['category_name']); ?>
                                        </span>
                                        <?php else: ?>
                                        <span class="text-gray-400">No category</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo getStatusBadge($article['status']); ?>">
                                            <?php echo ucfirst($article['status']); ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">
                                        <?php echo formatDate($article['published_at']); ?>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        <?php echo number_format($article['view_count']); ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center space-x-2">
                                            <a href="?action=edit&id=<?php echo $article['id']; ?>" class="text-blue-600 hover:text-blue-900" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <?php if ($article['status'] === 'published'): ?>
                                            <a href="../article.php?slug=<?php echo htmlspecialchars($article['slug']); ?>" target="_blank" class="text-green-600 hover:text-green-900" title="View">
                                                <i class="fas fa-external-link-alt"></i>
                                            </a>
                                            <?php endif; ?>
                                            <button onclick="deleteArticle(<?php echo $article['id']; ?>)" class="text-red-600 hover:text-red-900" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <?php if ($totalPages > 1): ?>
                    <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div class="text-sm text-gray-700">
                            Showing <?php echo (($page - 1) * $perPage) + 1; ?> to <?php echo min($page * $perPage, $totalArticles); ?> of <?php echo $totalArticles; ?> articles
                        </div>
                        <div class="flex space-x-1">
                            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <a href="?action=list&page=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($categoryFilter); ?>&status=<?php echo urlencode($statusFilter); ?>&featured=<?php echo urlencode($featuredFilter); ?>" 
                               class="px-3 py-2 text-sm <?php echo $i === $page ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'; ?> border border-gray-300 rounded-lg">
                                <?php echo $i; ?>
                            </a>
                            <?php endfor; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>

                <?php elseif (in_array($action, ['add', 'edit'])): ?>
                <!-- Add/Edit Article Form -->
                <form method="POST" class="space-y-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Main Content -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Basic Info -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Article Content</h2>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input type="text" name="title" required
                                               value="<?php echo htmlspecialchars($article['title'] ?? ''); ?>"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                                        <textarea name="excerpt" rows="3" placeholder="Brief summary of the article..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"><?php echo htmlspecialchars($article['excerpt'] ?? ''); ?></textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                        <textarea name="content" id="content"><?php echo htmlspecialchars($article['content'] ?? ''); ?></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- SEO Settings -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h2>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                        <input type="text" name="meta_title" maxlength="60"
                                               value="<?php echo htmlspecialchars($article['meta_title'] ?? ''); ?>"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <p class="text-xs text-gray-500 mt-1">Leave empty to use article title</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                        <textarea name="meta_description" rows="3" maxlength="160"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"><?php echo htmlspecialchars($article['meta_description'] ?? ''); ?></textarea>
                                        <p class="text-xs text-gray-500 mt-1">Leave empty to use excerpt</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="space-y-6">
                            <!-- Publish Settings -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Publish Settings</h2>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                            <option value="draft" <?php echo ($article['status'] ?? '') === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                            <option value="published" <?php echo ($article['status'] ?? '') === 'published' ? 'selected' : ''; ?>>Published</option>
                                            <option value="scheduled" <?php echo ($article['status'] ?? '') === 'scheduled' ? 'selected' : ''; ?>>Scheduled</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="is_featured" value="1" <?php echo (!empty($article['is_featured'])) ? 'checked' : ''; ?>
                                                   class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                            <span class="ml-2 text-sm text-gray-700">Featured Article</span>
                                        </label>
                                    </div>
                                    
                                    <div id="scheduled_date" style="display: <?php echo ($article['status'] ?? '') === 'scheduled' ? 'block' : 'none'; ?>">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                        <input type="datetime-local" name="published_at" 
                                               value="<?php echo $article['published_at'] ? date('Y-m-d\TH:i', strtotime($article['published_at'])) : ''; ?>"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    </div>
                                </div>
                                
                                <div class="mt-6 pt-6 border-t border-gray-200">
                                    <button type="submit" name="action" value="<?php echo $action === 'add' ? 'create' : 'update'; ?>" 
                                            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                        <i class="fas fa-save mr-2"></i>
                                        <?php echo $action === 'add' ? 'Create Article' : 'Update Article'; ?>
                                    </button>
                                    
                                    <?php if ($action === 'edit'): ?>
                                    <button type="button" onclick="deleteArticle(<?php echo $article['id']; ?>)" 
                                            class="mt-2 w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                                        <i class="fas fa-trash mr-2"></i>
                                        Delete Article
                                    </button>
                                    <?php endif; ?>
                                </div>
                            </div>

                            <!-- Category & Tags -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Category & Tags</h2>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select name="category_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                            <option value="">No Category</option>
                                            <?php foreach ($categories as $cat): ?>
                                            <option value="<?php echo $cat['id']; ?>" <?php echo ($article['category_id'] ?? '') == $cat['id'] ? 'selected' : ''; ?>>
                                                <?php echo htmlspecialchars($cat['name']); ?>
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                        <input type="text" name="tags" placeholder="Separate tags with commas"
                                               value="<?php echo $action === 'edit' && isset($article['tags']) ? implode(', ', array_column($article['tags'], 'name')) : ''; ?>"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <p class="text-xs text-gray-500 mt-1">e.g. web development, tutorial, javascript</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Featured Image -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Featured Image</h2>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input type="url" name="featured_image" 
                                           value="<?php echo htmlspecialchars($article['featured_image'] ?? ''); ?>"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    
                                    <?php if (!empty($article['featured_image'])): ?>
                                    <div class="mt-3">
                                        <img src="<?php echo htmlspecialchars($article['featured_image']); ?>" alt="Featured image preview" class="w-full h-32 object-cover rounded-lg">
                                    </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script>
        // Handle status change for scheduled publishing
        document.querySelector('select[name="status"]').addEventListener('change', function() {
            const scheduledDiv = document.getElementById('scheduled_date');
            scheduledDiv.style.display = this.value === 'scheduled' ? 'block' : 'none';
        });

        // Delete article function
        function deleteArticle(id) {
            if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '?action=delete&id=' + id;
                document.body.appendChild(form);
                form.submit();
            }
        }
    </script>
</body>
</html>