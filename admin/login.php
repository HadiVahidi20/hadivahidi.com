<?php
// /admin/login.php
// Updated login page using the new Database class and modern design

session_start();

// Redirect if already logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/includes/Database.php';

$error = '';
$success = '';
$message = '';

// Handle logout message
if (isset($_GET['message']) && $_GET['message'] === 'logged_out') {
    $success = 'You have been successfully logged out.';
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password.';
    } else {
        try {
            $db = Database::getInstance();
            
            // Get user from database
            $user = $db->fetch(
                "SELECT id, username, email, password_hash, first_name, last_name, role, last_login_at 
                 FROM users 
                 WHERE (username = ? OR email = ?) AND role = 'admin'", 
                [$username, $username]
            );
            
            if ($user && password_verify($password, $user['password_hash'])) {
                // Login successful - set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['full_name'] = trim(($user['first_name'] ?: '') . ' ' . ($user['last_name'] ?: ''));
                $_SESSION['logged_in'] = true;
                $_SESSION['login_time'] = time();
                
                // Update last login time
                $db->execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [$user['id']]);
                
                // Redirect to dashboard
                header('Location: index.php');
                exit;
                
            } else {
                $error = 'Invalid username or password.';
                
                // Optional: Log failed login attempts
                error_log("Failed login attempt for username: " . $username . " from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
            }
            
        } catch (Exception $e) {
            $error = 'Login system error. Please try again.';
            error_log("Login error: " . $e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Portfolio Admin</title>
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
<body class="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-primary-500 rounded-xl flex items-center justify-center">
                <i class="fas fa-layer-group text-white text-2xl"></i>
            </div>
            <h2 class="mt-6 text-3xl font-bold text-gray-900">
                Portfolio Admin
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Sign in to manage your portfolio
            </p>
        </div>
        
        <!-- Messages -->
        <?php if ($success): ?>
        <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <?php echo htmlspecialchars($success); ?>
            </div>
        </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <?php echo htmlspecialchars($error); ?>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Login Form -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-lg">
            <form class="px-8 py-8 space-y-6" method="POST">
                <div class="space-y-4">
                    <!-- Username/Email Field -->
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-user text-gray-400"></i>
                            </div>
                            <input 
                                id="username" 
                                name="username" 
                                type="text" 
                                autocomplete="username" 
                                required 
                                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Enter your username or email"
                                value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                            >
                        </div>
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-gray-400"></i>
                            </div>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                autocomplete="current-password" 
                                required 
                                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Enter your password"
                            >
                            <button type="button" onclick="togglePassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <i id="password-toggle-icon" class="fas fa-eye text-gray-400 hover:text-gray-600 transition-colors"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input 
                            id="remember_me" 
                            name="remember_me" 
                            type="checkbox" 
                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        >
                        <label for="remember_me" class="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                    
                    <!-- Future: Add forgot password link when implemented -->
                    <!--
                    <div class="text-sm">
                        <a href="forgot-password.php" class="font-medium text-primary-600 hover:text-primary-500">
                            Forgot your password?
                        </a>
                    </div>
                    -->
                </div>
                
                <!-- Submit Button -->
                <div>
                    <button 
                        type="submit" 
                        name="login"
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-sign-in-alt text-primary-500 group-hover:text-primary-400"></i>
                        </span>
                        Sign in to Dashboard
                    </button>
                </div>
            </form>
        </div>
        
        <!-- Additional Info -->
        <div class="text-center">
            <div class="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <a href="../index.php" class="hover:text-primary-600 transition-colors">
                    <i class="fas fa-home mr-1"></i>
                    View Portfolio
                </a>
                <span>•</span>
                <span>Admin Access Only</span>
            </div>
        </div>
        
        <!-- System Status (for debugging) -->
        <?php if (isset($_GET['debug']) && $_GET['debug'] === '1'): ?>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">System Status (Debug Mode)</h4>
            <div class="text-xs text-gray-600 space-y-1">
                <?php
                try {
                    $db = Database::getInstance();
                    echo "<div class='text-green-600'><i class='fas fa-check mr-1'></i> Database connection: OK</div>";
                    
                    $userCount = $db->fetch("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")['count'] ?? 0;
                    echo "<div class='text-green-600'><i class='fas fa-check mr-1'></i> Admin users found: {$userCount}</div>";
                    
                } catch (Exception $e) {
                    echo "<div class='text-red-600'><i class='fas fa-times mr-1'></i> Database error: " . htmlspecialchars($e->getMessage()) . "</div>";
                }
                ?>
                <div class="text-gray-600"><i class="fas fa-info mr-1"></i> Session ID: <?php echo session_id(); ?></div>
            </div>
        </div>
        <?php endif; ?>
    </div>
    
    <!-- JavaScript for password toggle -->
    <script>
        function togglePassword() {
            const passwordField = document.getElementById('password');
            const toggleIcon = document.getElementById('password-toggle-icon');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
        
        // Auto-focus username field
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('username').focus();
        });
        
        // Simple form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                e.preventDefault();
                alert('Please fill in all fields.');
                return false;
            }
        });
    </script>
</body>
</html>