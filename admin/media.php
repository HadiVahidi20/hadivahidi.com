<?php
// /admin/media.php
// Complete Media Management Interface

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/MediaManager.php';

$db = Database::getInstance();
$mediaManager = new MediaManager($db);
$message = '';
$error = '';
$action = $_GET['action'] ?? 'list';
$fileId = $_GET['id'] ?? null;
$folderId = $_GET['folder'] ?? null;

// Handle AJAX requests
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['ajax_action']) {
        case 'upload_files':
            $result = $mediaManager->uploadFiles($_FILES['files'] ?? [], $folderId);
            echo json_encode($result);
            exit;
            
        case 'create_folder':
            $name = $_POST['folder_name'] ?? '';
            $parentId = $_POST['parent_id'] ?? null;
            $result = $mediaManager->createFolder($name, $parentId);
            echo json_encode($result);
            exit;
            
        case 'delete_file':
            $id = $_POST['file_id'] ?? 0;
            $result = $mediaManager->deleteFile($id);
            echo json_encode($result);
            exit;
            
        case 'delete_folder':
            $id = $_POST['folder_id'] ?? 0;
            $result = $mediaManager->deleteFolder($id);
            echo json_encode($result);
            exit;
            
        case 'move_files':
            $fileIds = $_POST['file_ids'] ?? [];
            $targetFolderId = $_POST['target_folder_id'] ?? null;
            $result = $mediaManager->moveFiles($fileIds, $targetFolderId);
            echo json_encode($result);
            exit;
            
        case 'rename_file':
            $id = $_POST['file_id'] ?? 0;
            $newName = $_POST['new_name'] ?? '';
            $result = $mediaManager->renameFile($id, $newName);
            echo json_encode($result);
            exit;
            
        case 'get_file_info':
            $id = $_POST['file_id'] ?? 0;
            $result = $mediaManager->getFileInfo($id);
            echo json_encode($result);
            exit;
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['ajax_action'])) {
    try {
        if (isset($_POST['bulk_action']) && !empty($_POST['selected_files'])) {
            $fileIds = $_POST['selected_files'];
            $bulkAction = $_POST['bulk_action'];
            
            switch ($bulkAction) {
                case 'delete':
                    $result = $mediaManager->bulkDelete($fileIds);
                    $message = $result['success'] ? $result['message'] : '';
                    $error = $result['success'] ? '' : $result['message'];
                    break;
                    
                case 'move':
                    $targetFolder = $_POST['target_folder'] ?? null;
                    $result = $mediaManager->moveFiles($fileIds, $targetFolder);
                    $message = $result['success'] ? $result['message'] : '';
                    $error = $result['success'] ? '' : $result['message'];
                    break;
            }
        }
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}

// Get current folder info
$currentFolder = null;
if ($folderId) {
    $currentFolder = $mediaManager->getFolder($folderId);
}

// Get media files and folders
$mediaItems = $mediaManager->getMediaItems($folderId);
$folders = $mediaManager->getFolders($folderId);
$stats = $mediaManager->getStatistics();

// Get breadcrumb path
$breadcrumb = $mediaManager->getBreadcrumb($folderId);

// Handle messages
if (isset($_GET['message'])) {
    $message = $_GET['message'];
}
if (isset($_GET['error'])) {
    $error = $_GET['error'];
}

$pageTitle = 'Media Management';
$currentPage = "media";

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
    <style>
        .file-drag-over {
            border-color: #3b82f6 !important;
            background-color: #eff6ff !important;
        }
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
        }
    </style>
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
                    <a href="profile.php" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-user mr-3"></i>
                        Profile
                    </a>
                    <a href="media.php" class="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                        <i class="fas fa-images mr-3"></i>
                        Media
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
                <?php echo htmlspecialchars($error); ?>
            </div>
            <?php endif; ?>

            <!-- Header with Stats and Actions -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Media Library</h2>
                        <div class="flex items-center space-x-6 text-sm text-gray-600">
                            <span><i class="fas fa-file mr-1"></i> <?php echo $stats['total_files']; ?> Files</span>
                            <span><i class="fas fa-folder mr-1"></i> <?php echo $stats['total_folders']; ?> Folders</span>
                            <span><i class="fas fa-hdd mr-1"></i> <?php echo $mediaManager->formatFileSize($stats['total_size']); ?> Used</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                        <button onclick="createFolder()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                            <i class="fas fa-folder-plus mr-2"></i>
                            New Folder
                        </button>
                        <button onclick="document.getElementById('file-upload').click()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                            <i class="fas fa-upload mr-2"></i>
                            Upload Files
                        </button>
                    </div>
                </div>
            </div>

            <!-- Breadcrumb Navigation -->
            <?php if (!empty($breadcrumb)): ?>
            <div class="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <?php foreach ($breadcrumb as $index => $item): ?>
                    <?php if ($index > 0): ?>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                    <?php endif; ?>
                    
                    <?php if ($item['id'] === $folderId): ?>
                    <span class="text-gray-900 font-medium"><?php echo htmlspecialchars($item['name']); ?></span>
                    <?php else: ?>
                    <a href="media.php<?php echo $item['id'] ? '?folder=' . $item['id'] : ''; ?>" class="hover:text-primary-600">
                        <?php echo htmlspecialchars($item['name']); ?>
                    </a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <!-- File Upload Zone -->
            <div id="upload-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Drop files here to upload</h3>
                <p class="text-gray-600 mb-4">or <button onclick="document.getElementById('file-upload').click()" class="text-primary-600 hover:text-primary-700 font-medium">browse files</button></p>
                <p class="text-sm text-gray-500">Supports: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX), Archives (ZIP)</p>
                <input type="file" id="file-upload" multiple class="hidden" accept="image/*,.pdf,.doc,.docx,.zip">
            </div>

            <!-- Bulk Actions -->
            <form method="POST" id="bulk-form" class="mb-6">
                <div class="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input type="checkbox" id="select-all" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                            <span class="ml-2 text-sm text-gray-600">Select All</span>
                        </label>
                        <span id="selected-count" class="text-sm text-gray-500">0 selected</span>
                    </div>
                    
                    <div class="flex items-center space-x-2" id="bulk-actions" style="display: none;">
                        <select name="bulk_action" class="text-sm border-gray-300 rounded-md">
                            <option value="">Bulk Actions</option>
                            <option value="delete">Delete</option>
                            <option value="move">Move to Folder</option>
                        </select>
                        <select name="target_folder" class="text-sm border-gray-300 rounded-md" style="display: none;">
                            <option value="">Select Folder</option>
                            <option value="0">Root Folder</option>
                            <?php foreach ($mediaManager->getAllFolders() as $folder): ?>
                            <option value="<?php echo $folder['id']; ?>"><?php echo htmlspecialchars($folder['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            Apply
                        </button>
                    </div>
                </div>
            </form>

            <!-- Media Grid -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <!-- Folders Section -->
                <?php if (!empty($folders)): ?>
                <div class="mb-8">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Folders</h3>
                    <div class="media-grid">
                        <?php foreach ($folders as $folder): ?>
                        <div class="group relative">
                            <div class="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center p-4 border-2 border-transparent hover:border-blue-300 transition-colors cursor-pointer" 
                                 onclick="location.href='media.php?folder=<?php echo $folder['id']; ?>'">
                                <i class="fas fa-folder text-4xl text-blue-500 mb-2"></i>
                                <p class="text-sm font-medium text-gray-900 text-center truncate w-full"><?php echo htmlspecialchars($folder['name']); ?></p>
                                <p class="text-xs text-gray-500"><?php echo $folder['file_count']; ?> files</p>
                            </div>
                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="deleteFolder(<?php echo $folder['id']; ?>)" class="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Files Section -->
                <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Files</h3>
                    <?php if (!empty($mediaItems)): ?>
                    <div class="media-grid">
                        <?php foreach ($mediaItems as $file): ?>
                        <div class="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <input type="checkbox" name="selected_files[]" value="<?php echo $file['id']; ?>" 
                                   class="file-checkbox absolute top-2 left-2 z-10 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                            
                            <div class="aspect-square bg-gray-100 flex items-center justify-center relative">
                                <?php if ($mediaManager->isImage($file['file_type'])): ?>
                                <img src="../<?php echo htmlspecialchars($file['file_path']); ?>" 
                                     alt="<?php echo htmlspecialchars($file['original_name']); ?>" 
                                     class="w-full h-full object-cover">
                                <?php else: ?>
                                <i class="fas fa-<?php echo $mediaManager->getFileIcon($file['file_type']); ?> text-4xl text-gray-400"></i>
                                <?php endif; ?>
                                
                                <!-- File actions overlay -->
                                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div class="flex space-x-2">
                                        <button onclick="viewFile(<?php echo $file['id']; ?>)" class="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100">
                                            <i class="fas fa-eye text-xs"></i>
                                        </button>
                                        <button onclick="renameFile(<?php echo $file['id']; ?>)" class="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100">
                                            <i class="fas fa-edit text-xs"></i>
                                        </button>
                                        <button onclick="deleteFile(<?php echo $file['id']; ?>)" class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600">
                                            <i class="fas fa-trash text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="p-3">
                                <p class="text-sm font-medium text-gray-900 truncate" title="<?php echo htmlspecialchars($file['original_name']); ?>">
                                    <?php echo htmlspecialchars($file['original_name']); ?>
                                </p>
                                <div class="flex items-center justify-between mt-1">
                                    <span class="text-xs text-gray-500">
                                        <?php echo $mediaManager->formatFileSize($file['file_size']); ?>
                                    </span>
                                    <span class="text-xs text-gray-500">
                                        <?php echo date('M j, Y', strtotime($file['created_at'])); ?>
                                    </span>
                                </div>
                                <?php if (!empty($file['alt_text'])): ?>
                                <p class="text-xs text-gray-400 mt-1 truncate"><?php echo htmlspecialchars($file['alt_text']); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php else: ?>
                    <div class="text-center py-12">
                        <i class="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No files in this folder</h3>
                        <p class="text-gray-600 mb-6">Upload some files to get started</p>
                        <button onclick="document.getElementById('file-upload').click()" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium">
                            <i class="fas fa-upload mr-2"></i>
                            Upload Files
                        </button>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>

    <!-- File Info Modal -->
    <div id="file-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">File Details</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div id="modal-content" class="p-6">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>

    <script>
    // File upload handling
    const fileUpload = document.getElementById('file-upload');
    const uploadZone = document.getElementById('upload-zone');

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('file-drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('file-drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('file-drag-over');
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });

    fileUpload.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });

    function handleFileUpload(files) {
        if (files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        formData.append('ajax_action', 'upload_files');
        formData.append('folder_id', '<?php echo $folderId ?? ''; ?>');

        // Show upload progress
        const uploadStatus = document.createElement('div');
        uploadStatus.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50';
        uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading files...';
        document.body.appendChild(uploadStatus);

        fetch('media.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.body.removeChild(uploadStatus);
            if (data.success) {
                location.reload();
            } else {
                alert('Upload failed: ' + data.message);
            }
        })
        .catch(error => {
            document.body.removeChild(uploadStatus);
            alert('Upload failed: ' + error);
        });
    }

    // Bulk actions
    const selectAll = document.getElementById('select-all');
    const fileCheckboxes = document.querySelectorAll('.file-checkbox');
    const selectedCount = document.getElementById('selected-count');
    const bulkActions = document.getElementById('bulk-actions');

    selectAll.addEventListener('change', function() {
        fileCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkActions();
    });

    fileCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });

    function updateBulkActions() {
        const selected = document.querySelectorAll('.file-checkbox:checked').length;
        selectedCount.textContent = selected + ' selected';
        bulkActions.style.display = selected > 0 ? 'flex' : 'none';
        selectAll.checked = selected === fileCheckboxes.length && selected > 0;
    }

    // Modal functions
    function viewFile(fileId) {
        fetch('media.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'ajax_action=get_file_info&file_id=' + fileId
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showFileModal(data.file);
            } else {
                alert('Failed to load file info');
            }
        });
    }

    function showFileModal(file) {
        const modal = document.getElementById('file-modal');
        const content = document.getElementById('modal-content');
        
        let imagePreview = '';
        if (file.is_image) {
            imagePreview = `<img src="../${file.file_path}" alt="${file.original_name}" class="max-w-full h-auto rounded-lg mb-4">`;
        }
        
        content.innerHTML = `
            ${imagePreview}
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">File Name</label>
                    <p class="text-sm text-gray-900">${file.original_name}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">File Size</label>
                    <p class="text-sm text-gray-900">${file.formatted_size}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">File Type</label>
                    <p class="text-sm text-gray-900">${file.file_type}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Upload Date</label>
                    <p class="text-sm text-gray-900">${new Date(file.created_at).toLocaleDateString()}</p>
                </div>
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700">File Path</label>
                    <p class="text-sm text-gray-500 font-mono">${file.file_path}</p>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <a href="../${file.file_path}" target="_blank" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <i class="fas fa-external-link-alt mr-2"></i>View Full Size
                </a>
                <button onclick="copyToClipboard('${file.file_path}')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                    <i class="fas fa-copy mr-2"></i>Copy Path
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeModal() {
        const modal = document.getElementById('file-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('File path copied to clipboard!');
        });
    }

    // Action functions
    function createFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            fetch('media.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=create_folder&folder_name=${encodeURIComponent(name)}&parent_id=<?php echo $folderId ?? ''; ?>`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to create folder: ' + data.message);
                }
            });
        }
    }

    function deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            fetch('media.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'ajax_action=delete_file&file_id=' + fileId
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to delete file: ' + data.message);
                }
            });
        }
    }

    function deleteFolder(folderId) {
        if (confirm('Are you sure you want to delete this folder and all its contents?')) {
            fetch('media.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'ajax_action=delete_folder&folder_id=' + folderId
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to delete folder: ' + data.message);
                }
            });
        }
    }

    function renameFile(fileId) {
        const newName = prompt('Enter new file name:');
        if (newName) {
            fetch('media.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=rename_file&file_id=${fileId}&new_name=${encodeURIComponent(newName)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to rename file: ' + data.message);
                }
            });
        }
    }

    // Handle bulk action changes
    document.querySelector('select[name="bulk_action"]').addEventListener('change', function() {
        const targetFolderSelect = document.querySelector('select[name="target_folder"]');
        targetFolderSelect.style.display = this.value === 'move' ? 'block' : 'none';
    });
    </script>
</body>
</html>