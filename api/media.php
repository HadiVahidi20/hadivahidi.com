<?php
// /api/media.php
// Media API for frontend integration

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

try {
    // Include required files
    require_once __DIR__ . '/../admin/includes/Database.php';
    require_once __DIR__ . '/../admin/includes/MediaManager.php';
    
    // Get database instance
    $db = Database::getInstance();
    $mediaManager = new MediaManager($db);
    
    // Get query parameters
    $type = $_GET['type'] ?? 'all'; // all, images, documents, archives
    $folder = $_GET['folder'] ?? null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
    $search = $_GET['search'] ?? '';
    
    // Build query conditions
    $whereConditions = ['is_active = 1'];
    $params = [];
    
    // Filter by type
    switch ($type) {
        case 'images':
            $whereConditions[] = 'file_type LIKE ?';
            $params[] = 'image/%';
            break;
        case 'documents':
            $whereConditions[] = 'file_type IN (?, ?, ?)';
            $params[] = 'application/pdf';
            $params[] = 'application/msword';
            $params[] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        case 'archives':
            $whereConditions[] = '(file_type LIKE ? OR file_type LIKE ?)';
            $params[] = '%zip%';
            $params[] = '%rar%';
            break;
    }
    
    // Filter by folder
    if ($folder) {
        $whereConditions[] = 'folder_id = ?';
        $params[] = $folder;
    }
    
    // Search filter
    if (!empty($search)) {
        $whereConditions[] = '(original_name LIKE ? OR alt_text LIKE ? OR description LIKE ?)';
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }
    
    // Build final query
    $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
    $limitClause = $limit ? "LIMIT {$limit}" : '';
    
    $sql = "
        SELECT 
            id,
            original_name,
            file_name,
            file_path,
            file_type,
            file_size,
            folder_id,
            alt_text,
            description,
            usage_count,
            created_at,
            updated_at
        FROM media_files 
        {$whereClause} 
        ORDER BY created_at DESC 
        {$limitClause}
    ";
    
    $mediaFiles = $db->fetchAll($sql, $params);
    
    // Get folder information if requested
    $folderInfo = null;
    if ($folder) {
        $folderInfo = $mediaManager->getFolder($folder);
    }
    
    // Format data for frontend
    $formattedFiles = [];
    foreach ($mediaFiles as $file) {
        // Determine thumbnail path for images
        $thumbnailPath = null;
        if ($mediaManager->isImage($file['file_type'])) {
            $thumbnailPath = 'assets/media/thumbnails/' . $file['file_name'];
            // Check if thumbnail exists
            if (!file_exists(__DIR__ . '/../' . $thumbnailPath)) {
                $thumbnailPath = $file['file_path']; // Fallback to original
            }
        }
        
        $formattedFile = [
            'id' => intval($file['id']),
            'name' => $file['original_name'],
            'filename' => $file['file_name'],
            'path' => $file['file_path'],
            'url' => '/' . $file['file_path'], // Full URL for frontend use
            'type' => $file['file_type'],
            'size' => intval($file['file_size']),
            'formatted_size' => $mediaManager->formatFileSize($file['file_size']),
            'folder_id' => $file['folder_id'] ? intval($file['folder_id']) : null,
            'alt_text' => $file['alt_text'] ?: '',
            'description' => $file['description'] ?: '',
            'usage_count' => intval($file['usage_count']),
            'is_image' => $mediaManager->isImage($file['file_type']),
            'thumbnail' => $thumbnailPath ? '/' . $thumbnailPath : null,
            'icon' => $mediaManager->getFileIcon($file['file_type']),
            'created_at' => $file['created_at'],
            'updated_at' => $file['updated_at'],
            // Additional metadata for different file types
            'metadata' => [
                'category' => $mediaManager->isImage($file['file_type']) ? 'image' : 
                            (strpos($file['file_type'], 'pdf') !== false ? 'document' : 'archive'),
                'extension' => strtolower(pathinfo($file['original_name'], PATHINFO_EXTENSION))
            ]
        ];
        
        $formattedFiles[] = $formattedFile;
    }
    
    // Get statistics
    $stats = $mediaManager->getStatistics();
    
    // Get available folders for navigation
    $folders = $db->fetchAll("
        SELECT id, name, parent_id, 
               (SELECT COUNT(*) FROM media_files WHERE folder_id = media_folders.id AND is_active = 1) as file_count
        FROM media_folders 
        WHERE is_active = 1 
        ORDER BY name
    ");
    
    $formattedFolders = [];
    foreach ($folders as $folder) {
        $formattedFolders[] = [
            'id' => intval($folder['id']),
            'name' => $folder['name'],
            'parent_id' => $folder['parent_id'] ? intval($folder['parent_id']) : null,
            'file_count' => intval($folder['file_count'])
        ];
    }
    
    // Build response
    $response = [
        'success' => true,
        'data' => [
            'files' => $formattedFiles,
            'folders' => $formattedFolders,
            'current_folder' => $folderInfo ? [
                'id' => intval($folderInfo['id']),
                'name' => $folderInfo['name'],
                'description' => $folderInfo['description'] ?: '',
                'parent_id' => $folderInfo['parent_id'] ? intval($folderInfo['parent_id']) : null
            ] : null,
            'statistics' => [
                'total_files' => intval($stats['total_files']),
                'total_folders' => intval($stats['total_folders']),
                'total_size' => intval($stats['total_size']),
                'formatted_size' => $mediaManager->formatFileSize($stats['total_size']),
                'images_count' => intval($stats['images_count']),
                'documents_count' => intval($stats['documents_count'])
            ],
            'pagination' => [
                'total' => count($formattedFiles),
                'limit' => $limit,
                'has_more' => $limit && count($formattedFiles) === $limit
            ]
        ],
        'filters' => [
            'type' => $type,
            'folder' => $folder ? intval($folder) : null,
            'search' => $search,
            'limit' => $limit
        ],
        'meta' => [
            'api_version' => '1.0',
            'generated_at' => date('c'),
            'endpoint' => 'media'
        ]
    ];
    
    // Add specific endpoints for common use cases
    if (isset($_GET['gallery']) && $_GET['gallery'] === 'true') {
        // Gallery format - only images with thumbnails
        $response['gallery'] = [];
        foreach ($formattedFiles as $file) {
            if ($file['is_image']) {
                $response['gallery'][] = [
                    'id' => $file['id'],
                    'name' => $file['name'],
                    'url' => $file['url'],
                    'thumbnail' => $file['thumbnail'],
                    'alt_text' => $file['alt_text']
                ];
            }
        }
    }
    
    if (isset($_GET['selector']) && $_GET['selector'] === 'true') {
        // Selector format - simplified for file pickers
        $response['selector'] = [];
        foreach ($formattedFiles as $file) {
            $response['selector'][] = [
                'id' => $file['id'],
                'name' => $file['name'],
                'path' => $file['url'],
                'type' => $file['metadata']['category'],
                'icon' => $file['icon'],
                'size' => $file['formatted_size']
            ];
        }
    }
    
    // Output JSON response
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    // Handle errors gracefully
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'API Error',
        'message' => 'Failed to retrieve media data',
        'debug' => isset($_GET['debug']) && $_GET['debug'] === 'true' ? $e->getMessage() : null,
        'meta' => [
            'api_version' => '1.0',
            'generated_at' => date('c'),
            'endpoint' => 'media'
        ]
    ], JSON_PRETTY_PRINT);
    
    // Log error for debugging
    error_log("Media API Error: " . $e->getMessage());
}
?>