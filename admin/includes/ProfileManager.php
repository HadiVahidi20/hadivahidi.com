<?php
// /admin/includes/ProfileManager.php
// Business logic class for profile operations - keeps main profile.php clean

class ProfileManager {
    private $db;
    
    public function __construct(Database $database) {
        $this->db = $database;
        $this->initializeProfileTable();
    }
    
    /**
     * Initialize profile_data table if it doesn't exist
     */
    private function initializeProfileTable() {
        $sql = "CREATE TABLE IF NOT EXISTS profile_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) DEFAULT NULL,
            last_name VARCHAR(100) DEFAULT NULL,
            professional_title VARCHAR(255) DEFAULT NULL,
            location VARCHAR(255) DEFAULT NULL,
            email VARCHAR(255) DEFAULT NULL,
            phone VARCHAR(50) DEFAULT NULL,
            website VARCHAR(500) DEFAULT NULL,
            bio TEXT DEFAULT NULL,
            about TEXT DEFAULT NULL,
            profile_image VARCHAR(500) DEFAULT NULL,
            social_links JSON DEFAULT NULL COMMENT 'JSON object of social media links',
            skills_highlights JSON DEFAULT NULL COMMENT 'JSON array of key skills',
            meta_title VARCHAR(255) DEFAULT NULL,
            meta_description TEXT DEFAULT NULL,
            meta_keywords TEXT DEFAULT NULL,
            is_available TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        
        try {
            $this->db->execute($sql);
        } catch (Exception $e) {
            throw new Exception("Failed to initialize profile table: " . $e->getMessage());
        }
    }
    
    /**
     * Get profile data (creates default if doesn't exist)
     */
    public function getProfile() {
        $profile = $this->db->fetch("SELECT * FROM profile_data ORDER BY id ASC LIMIT 1");
        
        if (!$profile) {
            // Create default profile entry
            $this->db->execute("INSERT INTO profile_data () VALUES ()");
            $profile = $this->db->fetch("SELECT * FROM profile_data ORDER BY id ASC LIMIT 1");
        }
        
        return $profile ?: [];
    }
    
    /**
     * Validate profile data
     */
    public function validateProfileData($data) {
        $errors = [];
        
        // Basic validation
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format';
        }
        
        if (!empty($data['website']) && !filter_var($data['website'], FILTER_VALIDATE_URL)) {
            $errors[] = 'Invalid website URL format';
        }
        
        if (!empty($data['phone']) && !preg_match('/^[\+]?[0-9\-\s\(\)]+$/', $data['phone'])) {
            $errors[] = 'Invalid phone number format';
        }
        
        // Length validations
        if (!empty($data['first_name']) && strlen($data['first_name']) > 100) {
            $errors[] = 'First name is too long (maximum 100 characters)';
        }
        
        if (!empty($data['last_name']) && strlen($data['last_name']) > 100) {
            $errors[] = 'Last name is too long (maximum 100 characters)';
        }
        
        if (!empty($data['professional_title']) && strlen($data['professional_title']) > 255) {
            $errors[] = 'Professional title is too long (maximum 255 characters)';
        }
        
        if (!empty($data['meta_title']) && strlen($data['meta_title']) > 255) {
            $errors[] = 'Meta title is too long (maximum 255 characters)';
        }
        
        if (!empty($data['bio']) && strlen($data['bio']) > 500) {
            $errors[] = 'Bio is too long (maximum 500 characters)';
        }
        
        // Social links validation
        if (!empty($data['social_links'])) {
            $socialLinks = json_decode($data['social_links'], true);
            if ($socialLinks) {
                foreach ($socialLinks as $platform => $url) {
                    if (!filter_var($url, FILTER_VALIDATE_URL)) {
                        $errors[] = "Invalid URL for {$platform}";
                    }
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Update profile data
     */
    public function updateProfile($data) {
        $errors = $this->validateProfileData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }
        
        try {
            $profile = $this->getProfile();
            
            if ($profile) {
                // Update existing profile
                $sql = "UPDATE profile_data SET 
                    first_name = ?, 
                    last_name = ?, 
                    professional_title = ?, 
                    location = ?, 
                    email = ?, 
                    phone = ?, 
                    website = ?, 
                    bio = ?, 
                    about = ?, 
                    social_links = ?, 
                    skills_highlights = ?, 
                    meta_title = ?, 
                    meta_description = ?, 
                    meta_keywords = ?, 
                    is_available = ? 
                WHERE id = ?";
                
                $params = [
                    $data['first_name'] ?: null,
                    $data['last_name'] ?: null,
                    $data['professional_title'] ?: null,
                    $data['location'] ?: null,
                    $data['email'] ?: null,
                    $data['phone'] ?: null,
                    $data['website'] ?: null,
                    $data['bio'] ?: null,
                    $data['about'] ?: null,
                    $data['social_links'] ?: null,
                    $data['skills_highlights'] ?: null,
                    $data['meta_title'] ?: null,
                    $data['meta_description'] ?: null,
                    $data['meta_keywords'] ?: null,
                    $data['is_available'] ?? 0,
                    $profile['id']
                ];
            } else {
                // Insert new profile
                $sql = "INSERT INTO profile_data (
                    first_name, last_name, professional_title, location, email, phone, website, 
                    bio, about, social_links, skills_highlights, meta_title, meta_description, 
                    meta_keywords, is_available
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $params = [
                    $data['first_name'] ?: null,
                    $data['last_name'] ?: null,
                    $data['professional_title'] ?: null,
                    $data['location'] ?: null,
                    $data['email'] ?: null,
                    $data['phone'] ?: null,
                    $data['website'] ?: null,
                    $data['bio'] ?: null,
                    $data['about'] ?: null,
                    $data['social_links'] ?: null,
                    $data['skills_highlights'] ?: null,
                    $data['meta_title'] ?: null,
                    $data['meta_description'] ?: null,
                    $data['meta_keywords'] ?: null,
                    $data['is_available'] ?? 0
                ];
            }
            
            $this->db->execute($sql, $params);
            
            return ['success' => true];
            
        } catch (Exception $e) {
            return ['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]];
        }
    }
    
    /**
     * Handle profile image upload
     */
    public function handleImageUpload($file) {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'No file uploaded or upload error'];
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            return ['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'];
        }
        
        // Validate file size (2MB max)
        if ($file['size'] > 2 * 1024 * 1024) {
            return ['success' => false, 'message' => 'File size too large. Maximum 2MB allowed'];
        }
        
        // Create uploads directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../assets/images/profile/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return ['success' => false, 'message' => 'Failed to create upload directory'];
            }
        }
        
        // Generate unique filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = 'profile_' . time() . '_' . uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        $relativePath = 'assets/images/profile/' . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }
        
        // Resize image if needed (optional - you can implement this)
        $this->resizeImage($filepath, 400, 400);
        
        // Update database
        try {
            $profile = $this->getProfile();
            
            // Remove old image if exists
            if (!empty($profile['profile_image'])) {
                $oldImagePath = __DIR__ . '/../../' . $profile['profile_image'];
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            
            $this->db->execute(
                "UPDATE profile_data SET profile_image = ? WHERE id = ?",
                [$relativePath, $profile['id']]
            );
            
            return ['success' => true, 'image_path' => $relativePath];
            
        } catch (Exception $e) {
            // Clean up uploaded file on database error
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Remove profile image
     */
    public function removeProfileImage() {
        try {
            $profile = $this->getProfile();
            
            if (!empty($profile['profile_image'])) {
                $imagePath = __DIR__ . '/../../' . $profile['profile_image'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
                
                $this->db->execute(
                    "UPDATE profile_data SET profile_image = NULL WHERE id = ?",
                    [$profile['id']]
                );
            }
            
            return ['success' => true];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to remove image: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update social media link
     */
    public function updateSocialLink($platform, $url) {
        if (empty($platform)) {
            return ['success' => false, 'message' => 'Platform is required'];
        }
        
        if (!empty($url) && !filter_var($url, FILTER_VALIDATE_URL)) {
            return ['success' => false, 'message' => 'Invalid URL format'];
        }
        
        try {
            $profile = $this->getProfile();
            $socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
            
            if (empty($url)) {
                // Remove the social link
                unset($socialLinks[$platform]);
            } else {
                // Update/add the social link
                $socialLinks[$platform] = $url;
            }
            
            $this->db->execute(
                "UPDATE profile_data SET social_links = ? WHERE id = ?",
                [json_encode($socialLinks), $profile['id']]
            );
            
            return ['success' => true];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get profile statistics
     */
    public function getStatistics() {
        $profile = $this->getProfile();
        $socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
        $skillsHighlights = json_decode($profile['skills_highlights'] ?? '[]', true) ?: [];
        
        return [
            'profile_completed' => $this->calculateCompletionPercentage($profile),
            'social_links_count' => count($socialLinks),
            'skills_highlights_count' => count($skillsHighlights),
            'has_profile_image' => !empty($profile['profile_image']),
            'last_updated' => $profile['updated_at'] ?? null
        ];
    }
    
    /**
     * Calculate profile completion percentage
     */
    private function calculateCompletionPercentage($profile) {
        $fields = [
            'first_name', 'last_name', 'professional_title', 'location', 
            'email', 'phone', 'bio', 'about', 'profile_image'
        ];
        
        $completed = 0;
        $total = count($fields);
        
        foreach ($fields as $field) {
            if (!empty($profile[$field])) {
                $completed++;
            }
        }
        
        // Add bonus for social links and skills
        if (!empty($profile['social_links'])) {
            $socialLinks = json_decode($profile['social_links'], true);
            if (!empty($socialLinks)) {
                $completed += 0.5;
                $total += 0.5;
            }
        }
        
        if (!empty($profile['skills_highlights'])) {
            $skillsHighlights = json_decode($profile['skills_highlights'], true);
            if (!empty($skillsHighlights)) {
                $completed += 0.5;
                $total += 0.5;
            }
        }
        
        return round(($completed / $total) * 100);
    }
    
    /**
     * Export profile data for frontend
     */
    public function exportForFrontend() {
        $profile = $this->getProfile();
        
        // Parse JSON fields
        $socialLinks = json_decode($profile['social_links'] ?? '{}', true) ?: [];
        $skillsHighlights = json_decode($profile['skills_highlights'] ?? '[]', true) ?: [];
        
        return [
            'personal_info' => [
                'first_name' => $profile['first_name'] ?? '',
                'last_name' => $profile['last_name'] ?? '',
                'full_name' => trim(($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? '')),
                'professional_title' => $profile['professional_title'] ?? '',
                'location' => $profile['location'] ?? '',
                'email' => $profile['email'] ?? '',
                'phone' => $profile['phone'] ?? '',
                'website' => $profile['website'] ?? '',
                'profile_image' => $profile['profile_image'] ?? null,
                'is_available' => boolval($profile['is_available'] ?? 1)
            ],
            'bio' => [
                'short_bio' => $profile['bio'] ?? '',
                'about' => $profile['about'] ?? '',
                'skills_highlights' => $skillsHighlights
            ],
            'social_links' => $socialLinks,
            'seo' => [
                'meta_title' => $profile['meta_title'] ?? '',
                'meta_description' => $profile['meta_description'] ?? '',
                'meta_keywords' => $profile['meta_keywords'] ?? ''
            ],
            'updated_at' => $profile['updated_at'] ?? null
        ];
    }
    
    /**
     * Simple image resize function
     */
    private function resizeImage($filepath, $maxWidth, $maxHeight) {
        try {
            $imageInfo = getimagesize($filepath);
            if (!$imageInfo) return false;
            
            list($width, $height, $type) = $imageInfo;
            
            // Check if resize is needed
            if ($width <= $maxWidth && $height <= $maxHeight) {
                return true;
            }
            
            // Calculate new dimensions
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = round($width * $ratio);
            $newHeight = round($height * $ratio);
            
            // Create image resource based on type
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $source = imagecreatefromjpeg($filepath);
                    break;
                case IMAGETYPE_PNG:
                    $source = imagecreatefrompng($filepath);
                    break;
                case IMAGETYPE_GIF:
                    $source = imagecreatefromgif($filepath);
                    break;
                default:
                    return false;
            }
            
            if (!$source) return false;
            
            // Create new image
            $destination = imagecreatetruecolor($newWidth, $newHeight);
            
            // Handle transparency for PNG and GIF
            if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
                imagealphablending($destination, false);
                imagesavealpha($destination, true);
            }
            
            // Resize
            imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            
            // Save resized image
            switch ($type) {
                case IMAGETYPE_JPEG:
                    imagejpeg($destination, $filepath, 85);
                    break;
                case IMAGETYPE_PNG:
                    imagepng($destination, $filepath, 8);
                    break;
                case IMAGETYPE_GIF:
                    imagegif($destination, $filepath);
                    break;
            }
            
            // Clean up
            imagedestroy($source);
            imagedestroy($destination);
            
            return true;
            
        } catch (Exception $e) {
            return false;
        }
    }
}
?>