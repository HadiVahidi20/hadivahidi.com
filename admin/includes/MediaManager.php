<?php
// /admin/includes/MediaManager.php
// Business logic class for media operations - keeps main media.php clean

class MediaManager {
    private $db;
    private $uploadPath;
    private $maxFileSize;
    private $allowedTypes;
    
    public function __construct(Database $database) {
        $this->db = $database;
        $this->uploadPath = __DIR__ . '/../../assets/media/';
        $this->maxFileSize = 10 * 1024 * 1024; // 10MB
        $this->allowedTypes = [
            // Images
            'image/jpeg' => 'jpg',
            'image/png' => 'png', 
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
            // Documents
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            // Archives
            'application/zip' => 'zip',
            'application/x-rar-compressed' => 'rar'
        ];
        
        $this->initializeTables();
        $this->ensureDirectoryExists();
    }
    
    /**
     * Initialize media management tables
     */
    private function initializeTables() {
        // Media files table
        $sql = "CREATE TABLE IF NOT EXISTS media_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            original_name VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_type VARCHAR(100) NOT NULL,
            file_size BIGINT NOT NULL,
            folder_id INT DEFAULT NULL,
            alt_text VARCHAR(500) DEFAULT NULL,
            description TEXT DEFAULT NULL,
            usage_count INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_folder (folder_id),
            INDEX idx_type (file_type),
            INDEX idx_active (is_active),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        
        $this->db->execute($sql);
        
        // Media folders table
        $sql = "CREATE TABLE IF NOT EXISTS media_folders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            parent_id INT DEFAULT NULL,
            description TEXT DEFAULT NULL,
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_parent (parent_id),
            INDEX idx_active (is_active),
            INDEX idx_sort (sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        
        $this->db->execute($sql);
    }
    
    /**
     * Ensure upload directory exists
     */
    private function ensureDirectoryExists() {
        if (!is_dir($this->uploadPath)) {
            if (!mkdir($this->uploadPath, 0755, true)) {
                throw new Exception("Cannot create upload directory: {$this->uploadPath}");
            }
        }
        
        // Create subfolders
        $subfolders = ['images', 'documents', 'archives', 'thumbnails'];
        foreach ($subfolders as $folder) {
            $folderPath = $this->uploadPath . $folder . '/';
            if (!is_dir($folderPath)) {
                mkdir($folderPath, 0755, true);
            }
        }
    }
    
    /**
     * Upload multiple files
     */
    public function uploadFiles($files, $folderId = null) {
        if (empty($files['tmp_name'])) {
            return ['success' => false, 'message' => 'No files uploaded'];
        }
        
        $uploadedFiles = [];
        $errors = [];
        
        // Handle both single and multiple files
        if (!is_array($files['tmp_name'])) {
            $files = [
                'name' => [$files['name']],
                'tmp_name' => [$files['tmp_name']],
                'size' => [$files['size']],
                'type' => [$files['type']],
                'error' => [$files['error']]
            ];
        }
        
        for ($i = 0; $i < count($files['tmp_name']); $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                $errors[] = "Upload error for {$files['name'][$i]}";
                continue;
            }
            
            $result = $this->uploadSingleFile([
                'name' => $files['name'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'size' => $files['size'][$i],
                'type' => $files['type'][$i]
            ], $folderId);
            
            if ($result['success']) {
                $uploadedFiles[] = $result['file'];
            } else {
                $errors[] = $result['message'];
            }
        }
        
        if (!empty($uploadedFiles)) {
            $message = count($uploadedFiles) . ' file(s) uploaded successfully';
            if (!empty($errors)) {
                $message .= ', with ' . count($errors) . ' error(s)';
            }
            return ['success' => true, 'message' => $message, 'files' => $uploadedFiles];
        } else {
            return ['success' => false, 'message' => 'No files uploaded: ' . implode(', ', $errors)];
        }
    }
    
    /**
     * Upload single file
     */
    private function uploadSingleFile($file, $folderId = null) {
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['success']) {
            return $validation;
        }
        
        // Generate safe filename
        $originalName = basename($file['name']);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $safeName = $this->generateSafeFilename($originalName);
        
        // Determine subfolder based on type
        $subfolder = $this->getSubfolderForType($file['type']);
        $relativePath = "assets/media/{$subfolder}/";
        $fullPath = $this->uploadPath . $subfolder . '/';
        
        // Create full file paths
        $fileName = $safeName . '.' . $extension;
        $filePath = $fullPath . $fileName;
        $dbPath = $relativePath . $fileName;
        
        // Ensure unique filename
        $counter = 1;
        while (file_exists($filePath)) {
            $fileName = $safeName . '_' . $counter . '.' . $extension;
            $filePath = $fullPath . $fileName;
            $dbPath = $relativePath . $fileName;
            $counter++;
        }
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }
        
        // Optimize image if needed
        if ($this->isImage($file['type'])) {
            $this->optimizeImage($filePath, $file['type']);
            $this->generateThumbnail($filePath, $fileName);
        }
        
        // Save to database
        try {
            $fileId = $this->db->execute(
                "INSERT INTO media_files (original_name, file_name, file_path, file_type, file_size, folder_id) 
                 VALUES (?, ?, ?, ?, ?, ?)",
                [$originalName, $fileName, $dbPath, $file['type'], filesize($filePath), $folderId ?: null]
            );
            
            return [
                'success' => true,
                'message' => 'File uploaded successfully',
                'file' => [
                    'id' => $fileId,
                    'original_name' => $originalName,
                    'file_name' => $fileName,
                    'file_path' => $dbPath,
                    'file_type' => $file['type'],
                    'file_size' => filesize($filePath)
                ]
            ];
        } catch (Exception $e) {
            // Clean up file if database insert fails
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['success' => false, 'message' => 'File size exceeds maximum limit (' . $this->formatFileSize($this->maxFileSize) . ')'];
        }
        
        // Check file type
        if (!in_array($file['type'], array_keys($this->allowedTypes))) {
            return ['success' => false, 'message' => 'File type not allowed: ' . $file['type']];
        }
        
        // Additional security checks
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if ($detectedType !== $file['type']) {
            return ['success' => false, 'message' => 'File type mismatch detected'];
        }
        
        return ['success' => true];
    }
    
    /**
     * Generate safe filename
     */
    private function generateSafeFilename($originalName) {
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $name = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $name);
        $name = preg_replace('/_+/', '_', $name);
        $name = trim($name, '_');
        
        if (empty($name)) {
            $name = 'file_' . time();
        }
        
        return $name;
    }
    
    /**
     * Get subfolder for file type
     */
    private function getSubfolderForType($mimeType) {
        if (strpos($mimeType, 'image/') === 0) {
            return 'images';
        } elseif (in_array($mimeType, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            return 'documents';
        } else {
            return 'archives';
        }
    }
    
    /**
     * Optimize image
     */
    private function optimizeImage($filePath, $mimeType) {
        try {
            $info = getimagesize($filePath);
            if (!$info) return false;
            
            list($width, $height) = $info;
            
            // Only resize if image is too large
            $maxWidth = 1920;
            $maxHeight = 1920;
            
            if ($width <= $maxWidth && $height <= $maxHeight) {
                return true;
            }
            
            // Calculate new dimensions
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = round($width * $ratio);
            $newHeight = round($height * $ratio);
            
            // Create new image
            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Load source image
            switch ($mimeType) {
                case 'image/jpeg':
                    $source = imagecreatefromjpeg($filePath);
                    break;
                case 'image/png':
                    $source = imagecreatefrompng($filePath);
                    imagealphablending($newImage, false);
                    imagesavealpha($newImage, true);
                    break;
                case 'image/gif':
                    $source = imagecreatefromgif($filePath);
                    break;
                default:
                    return false;
            }
            
            if (!$source) return false;
            
            // Resize
            imagecopyresampled($newImage, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            
            // Save optimized image
            switch ($mimeType) {
                case 'image/jpeg':
                    imagejpeg($newImage, $filePath, 85);
                    break;
                case 'image/png':
                    imagepng($newImage, $filePath, 8);
                    break;
                case 'image/gif':
                    imagegif($newImage, $filePath);
                    break;
            }
            
            // Clean up
            imagedestroy($source);
            imagedestroy($newImage);
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Generate thumbnail for images
     */
    private function generateThumbnail($filePath, $fileName) {
        try {
            $info = getimagesize($filePath);
            if (!$info) return false;
            
            list($width, $height, $type) = $info;
            
            // Thumbnail dimensions
            $thumbWidth = 300;
            $thumbHeight = 300;
            
            // Calculate dimensions maintaining aspect ratio
            $ratio = min($thumbWidth / $width, $thumbHeight / $height);
            $newWidth = round($width * $ratio);
            $newHeight = round($height * $ratio);
            
            // Create thumbnail
            $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
            $white = imagecolorallocate($thumb, 255, 255, 255);
            imagefill($thumb, 0, 0, $white);
            
            // Load source
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $source = imagecreatefromjpeg($filePath);
                    break;
                case IMAGETYPE_PNG:
                    $source = imagecreatefrompng($filePath);
                    imagealphablending($thumb, false);
                    imagesavealpha($thumb, true);
                    break;
                case IMAGETYPE_GIF:
                    $source = imagecreatefromgif($filePath);
                    break;
                default:
                    return false;
            }
            
            if (!$source) return false;
            
            // Center the image
            $offsetX = ($thumbWidth - $newWidth) / 2;
            $offsetY = ($thumbHeight - $newHeight) / 2;
            
            imagecopyresampled($thumb, $source, $offsetX, $offsetY, 0, 0, $newWidth, $newHeight, $width, $height);
            
            // Save thumbnail
            $thumbPath = $this->uploadPath . 'thumbnails/' . $fileName;
            switch ($type) {
                case IMAGETYPE_JPEG:
                    imagejpeg($thumb, $thumbPath, 80);
                    break;
                case IMAGETYPE_PNG:
                    imagepng($thumb, $thumbPath, 8);
                    break;
                case IMAGETYPE_GIF:
                    imagegif($thumb, $thumbPath);
                    break;
            }
            
            imagedestroy($source);
            imagedestroy($thumb);
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Create folder
     */
    public function createFolder($name, $parentId = null) {
        if (empty($name)) {
            return ['success' => false, 'message' => 'Folder name is required'];
        }
        
        $slug = $this->generateSlug($name);
        
        try {
            $folderId = $this->db->execute(
                "INSERT INTO media_folders (name, slug, parent_id) VALUES (?, ?, ?)",
                [$name, $slug, $parentId ?: null]
            );
            
            return ['success' => true, 'message' => 'Folder created successfully', 'folder_id' => $folderId];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to create folder: ' . $e->getMessage()];
        }
    }
    
    /**
     * Delete file
     */
    public function deleteFile($fileId) {
        try {
            $file = $this->db->fetch("SELECT * FROM media_files WHERE id = ?", [$fileId]);
            if (!$file) {
                return ['success' => false, 'message' => 'File not found'];
            }
            
            // Delete from database
            $this->db->execute("DELETE FROM media_files WHERE id = ?", [$fileId]);
            
            // Delete physical file
            $fullPath = __DIR__ . '/../../' . $file['file_path'];
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            // Delete thumbnail if exists
            if ($this->isImage($file['file_type'])) {
                $thumbPath = $this->uploadPath . 'thumbnails/' . $file['file_name'];
                if (file_exists($thumbPath)) {
                    unlink($thumbPath);
                }
            }
            
            return ['success' => true, 'message' => 'File deleted successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to delete file: ' . $e->getMessage()];
        }
    }
    
    /**
     * Delete folder and all contents
     */
    public function deleteFolder($folderId) {
        try {
            // Get all files in folder
            $files = $this->db->fetchAll("SELECT id FROM media_files WHERE folder_id = ?", [$folderId]);
            
            // Delete all files
            foreach ($files as $file) {
                $this->deleteFile($file['id']);
            }
            
            // Delete subfolders recursively
            $subfolders = $this->db->fetchAll("SELECT id FROM media_folders WHERE parent_id = ?", [$folderId]);
            foreach ($subfolders as $subfolder) {
                $this->deleteFolder($subfolder['id']);
            }
            
            // Delete folder
            $this->db->execute("DELETE FROM media_folders WHERE id = ?", [$folderId]);
            
            return ['success' => true, 'message' => 'Folder deleted successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to delete folder: ' . $e->getMessage()];
        }
    }
    
    /**
     * Move files to folder
     */
    public function moveFiles($fileIds, $targetFolderId) {
        if (empty($fileIds)) {
            return ['success' => false, 'message' => 'No files selected'];
        }
        
        try {
            $placeholders = str_repeat('?,', count($fileIds) - 1) . '?';
            $this->db->execute(
                "UPDATE media_files SET folder_id = ? WHERE id IN ({$placeholders})",
                array_merge([$targetFolderId ?: null], $fileIds)
            );
            
            return ['success' => true, 'message' => count($fileIds) . ' file(s) moved successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to move files: ' . $e->getMessage()];
        }
    }
    
    /**
     * Rename file
     */
    public function renameFile($fileId, $newName) {
        if (empty($newName)) {
            return ['success' => false, 'message' => 'New name is required'];
        }
        
        try {
            $this->db->execute(
                "UPDATE media_files SET original_name = ? WHERE id = ?",
                [$newName, $fileId]
            );
            
            return ['success' => true, 'message' => 'File renamed successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to rename file: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get file info
     */
    public function getFileInfo($fileId) {
        try {
            $file = $this->db->fetch("SELECT * FROM media_files WHERE id = ?", [$fileId]);
            if (!$file) {
                return ['success' => false, 'message' => 'File not found'];
            }
            
            $file['is_image'] = $this->isImage($file['file_type']);
            $file['formatted_size'] = $this->formatFileSize($file['file_size']);
            
            return ['success' => true, 'file' => $file];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to get file info: ' . $e->getMessage()];
        }
    }
    
    /**
     * Bulk delete files
     */
    public function bulkDelete($fileIds) {
        if (empty($fileIds)) {
            return ['success' => false, 'message' => 'No files selected'];
        }
        
        $deleted = 0;
        $errors = [];
        
        foreach ($fileIds as $fileId) {
            $result = $this->deleteFile($fileId);
            if ($result['success']) {
                $deleted++;
            } else {
                $errors[] = $result['message'];
            }
        }
        
        if ($deleted > 0) {
            $message = $deleted . ' file(s) deleted successfully';
            if (!empty($errors)) {
                $message .= ', with ' . count($errors) . ' error(s)';
            }
            return ['success' => true, 'message' => $message];
        } else {
            return ['success' => false, 'message' => 'No files deleted: ' . implode(', ', $errors)];
        }
    }
    
    /**
     * Get media items in folder
     */
    public function getMediaItems($folderId = null) {
        $whereClause = $folderId ? 'WHERE folder_id = ?' : 'WHERE folder_id IS NULL';
        $params = $folderId ? [$folderId] : [];
        
        return $this->db->fetchAll("
            SELECT * FROM media_files 
            {$whereClause} AND is_active = 1 
            ORDER BY created_at DESC
        ", $params);
    }
    
    /**
     * Get folders in parent folder
     */
    public function getFolders($parentId = null) {
        $whereClause = $parentId ? 'WHERE parent_id = ?' : 'WHERE parent_id IS NULL';
        $params = $parentId ? [$parentId] : [];
        
        $folders = $this->db->fetchAll("
            SELECT f.*, COUNT(mf.id) as file_count
            FROM media_folders f
            LEFT JOIN media_files mf ON f.id = mf.folder_id AND mf.is_active = 1
            {$whereClause} AND f.is_active = 1
            GROUP BY f.id
            ORDER BY f.sort_order, f.name
        ", $params);
        
        return $folders;
    }
    
    /**
     * Get all folders for select options
     */
    public function getAllFolders() {
        return $this->db->fetchAll("
            SELECT id, name, parent_id 
            FROM media_folders 
            WHERE is_active = 1 
            ORDER BY name
        ");
    }
    
    /**
     * Get folder by ID
     */
    public function getFolder($folderId) {
        return $this->db->fetch("SELECT * FROM media_folders WHERE id = ?", [$folderId]);
    }
    
    /**
     * Get breadcrumb path
     */
    public function getBreadcrumb($folderId) {
        $breadcrumb = [['id' => null, 'name' => 'Media Library']];
        
        if ($folderId) {
            $path = [];
            $currentId = $folderId;
            
            while ($currentId) {
                $folder = $this->getFolder($currentId);
                if ($folder) {
                    array_unshift($path, ['id' => $folder['id'], 'name' => $folder['name']]);
                    $currentId = $folder['parent_id'];
                } else {
                    break;
                }
            }
            
            $breadcrumb = array_merge($breadcrumb, $path);
        }
        
        return $breadcrumb;
    }
    
    /**
     * Get statistics
     */
    public function getStatistics() {
        $stats = [
            'total_files' => $this->db->fetch("SELECT COUNT(*) as count FROM media_files WHERE is_active = 1")['count'] ?? 0,
            'total_folders' => $this->db->fetch("SELECT COUNT(*) as count FROM media_folders WHERE is_active = 1")['count'] ?? 0,
            'total_size' => $this->db->fetch("SELECT SUM(file_size) as size FROM media_files WHERE is_active = 1")['size'] ?? 0,
            'images_count' => $this->db->fetch("SELECT COUNT(*) as count FROM media_files WHERE file_type LIKE 'image/%' AND is_active = 1")['count'] ?? 0,
            'documents_count' => $this->db->fetch("SELECT COUNT(*) as count FROM media_files WHERE file_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') AND is_active = 1")['count'] ?? 0
        ];
        
        return $stats;
    }
    
    /**
     * Generate slug from name
     */
    private function generateSlug($name) {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }
    
    /**
     * Check if file is image
     */
    public function isImage($mimeType) {
        return strpos($mimeType, 'image/') === 0;
    }
    
    /**
     * Get file icon based on type
     */
    public function getFileIcon($mimeType) {
        if (strpos($mimeType, 'image/') === 0) {
            return 'image';
        } elseif ($mimeType === 'application/pdf') {
            return 'file-pdf';
        } elseif (in_array($mimeType, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            return 'file-word';
        } elseif (strpos($mimeType, 'application/zip') !== false || strpos($mimeType, 'rar') !== false) {
            return 'file-archive';
        } else {
            return 'file';
        }
    }
    
    /**
     * Format file size
     */
    public function formatFileSize($bytes) {
        if ($bytes == 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
    
    /**
     * Export media data for frontend API
     */
    public function exportForFrontend() {
        $media = $this->db->fetchAll("
            SELECT id, original_name, file_name, file_path, file_type, file_size, alt_text, description
            FROM media_files 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        ");
        
        $formatted = [];
        foreach ($media as $file) {
            $formatted[] = [
                'id' => intval($file['id']),
                'name' => $file['original_name'],
                'path' => $file['file_path'],
                'type' => $file['file_type'],
                'size' => intval($file['file_size']),
                'alt' => $file['alt_text'],
                'description' => $file['description'],
                'is_image' => $this->isImage($file['file_type']),
                'formatted_size' => $this->formatFileSize($file['file_size'])
            ];
        }
        
        return $formatted;
    }
}
?>