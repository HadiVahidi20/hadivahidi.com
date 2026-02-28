<?php
// /admin/includes/Migration.php
// Migration runner system for database schema management and updates

require_once __DIR__ . '/Database.php';

class Migration {
    private $db;
    private $migrationPath;
    private $seedPath;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->migrationPath = __DIR__ . '/../database/migrations/';
        $this->seedPath = __DIR__ . '/../database/seeds/';
        
        // Ensure migration directories exist
        $this->ensureDirectoryExists($this->migrationPath);
        $this->ensureDirectoryExists($this->seedPath);
        
        // Initialize migration tracking table
        $this->initializeMigrationTable();
    }
    
    /**
     * Ensure directory exists
     */
    private function ensureDirectoryExists($path) {
        if (!is_dir($path)) {
            if (!mkdir($path, 0755, true)) {
                throw new Exception("Cannot create directory: {$path}");
            }
        }
    }
    
    /**
     * Initialize migration tracking table
     */
    private function initializeMigrationTable() {
        $sql = "CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration_name VARCHAR(255) UNIQUE NOT NULL,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        
        try {
            $this->db->execute($sql);
        } catch (Exception $e) {
            throw new Exception("Failed to initialize migration table: " . $e->getMessage());
        }
    }
    
    /**
     * Get all available migration files
     */
    public function getAvailableMigrations() {
        $migrations = [];
        $files = glob($this->migrationPath . '*.sql');
        
        foreach ($files as $file) {
            $filename = basename($file);
            $migrationName = pathinfo($filename, PATHINFO_FILENAME);
            $migrations[] = [
                'name' => $migrationName,
                'file' => $file,
                'filename' => $filename
            ];
        }
        
        // Sort migrations by name (which should include ordering numbers)
        usort($migrations, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });
        
        return $migrations;
    }
    
    /**
     * Get executed migrations from database
     */
    public function getExecutedMigrations() {
        try {
            $sql = "SELECT migration_name, executed_at FROM migrations ORDER BY executed_at ASC";
            return $this->db->fetchAll($sql);
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get pending migrations
     */
    public function getPendingMigrations() {
        $available = $this->getAvailableMigrations();
        $executed = $this->getExecutedMigrations();
        
        $executedNames = array_column($executed, 'migration_name');
        
        return array_filter($available, function($migration) use ($executedNames) {
            return !in_array($migration['name'], $executedNames);
        });
    }
    
    /**
     * Check if migration has been executed
     */
    public function isMigrationExecuted($migrationName) {
        $sql = "SELECT COUNT(*) as count FROM migrations WHERE migration_name = ?";
        $result = $this->db->fetch($sql, [$migrationName]);
        return $result['count'] > 0;
    }
    
    /**
     * Run all pending migrations
     */
    public function runMigrations($options = []) {
        $verbose = $options['verbose'] ?? false;
        $dryRun = $options['dry_run'] ?? false;
        
        $pending = $this->getPendingMigrations();
        
        if (empty($pending)) {
            return [
                'success' => true,
                'message' => 'No pending migrations to run',
                'migrations' => []
            ];
        }
        
        $results = [];
        $errors = [];
        
        foreach ($pending as $migration) {
            try {
                if ($verbose) {
                    echo "Running migration: {$migration['name']}\n";
                }
                
                if (!$dryRun) {
                    $result = $this->runSingleMigration($migration);
                    $results[] = $result;
                    
                    if ($verbose) {
                        echo "✓ Migration {$migration['name']} completed successfully\n";
                    }
                } else {
                    $results[] = [
                        'migration' => $migration['name'],
                        'status' => 'would_run',
                        'message' => 'Would execute migration (dry run)'
                    ];
                    
                    if ($verbose) {
                        echo "✓ Would run migration: {$migration['name']} (dry run)\n";
                    }
                }
                
            } catch (Exception $e) {
                $error = [
                    'migration' => $migration['name'],
                    'error' => $e->getMessage()
                ];
                $errors[] = $error;
                
                if ($verbose) {
                    echo "✗ Migration {$migration['name']} failed: {$e->getMessage()}\n";
                }
                
                // Stop on first error unless continue_on_error is set
                if (!($options['continue_on_error'] ?? false)) {
                    break;
                }
            }
        }
        
        return [
            'success' => empty($errors),
            'message' => empty($errors) ? 'All migrations completed successfully' : 'Some migrations failed',
            'migrations' => $results,
            'errors' => $errors
        ];
    }
    
    /**
     * Run a single migration
     */
    public function runSingleMigration($migration) {
        if (is_string($migration)) {
            // Find migration by name
            $available = $this->getAvailableMigrations();
            $migration = array_filter($available, function($m) use ($migration) {
                return $m['name'] === $migration;
            });
            
            if (empty($migration)) {
                throw new Exception("Migration not found: {$migration}");
            }
            
            $migration = reset($migration);
        }
        
        // Check if already executed
        if ($this->isMigrationExecuted($migration['name'])) {
            throw new Exception("Migration already executed: {$migration['name']}");
        }
        
        // Read migration file
        $sql = file_get_contents($migration['file']);
        if ($sql === false) {
            throw new Exception("Cannot read migration file: {$migration['file']}");
        }
        
        // Execute migration in transaction
        return $this->db->transaction(function($db) use ($migration, $sql) {
            // Split SQL into individual statements
            $statements = $this->splitSqlStatements($sql);
            
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (empty($statement) || substr($statement, 0, 2) === '--') {
                    continue; // Skip empty lines and comments
                }
                
                try {
                    $db->execute($statement);
                } catch (Exception $e) {
                    throw new Exception("Migration statement failed in {$migration['name']}: " . $e->getMessage() . "\nStatement: " . substr($statement, 0, 200));
                }
            }
            
            // Record migration as executed (only if not already recorded by the migration itself)
            if (!$this->isMigrationExecuted($migration['name'])) {
                $recordSql = "INSERT INTO migrations (migration_name) VALUES (?)";
                $db->execute($recordSql, [$migration['name']]);
            }
            
            return [
                'migration' => $migration['name'],
                'status' => 'completed',
                'message' => 'Migration executed successfully'
            ];
        });
    }
    
    /**
     * Reset database (run fresh migrations)
     */
    public function resetDatabase($options = []) {
        $verbose = $options['verbose'] ?? false;
        $confirm = $options['confirm'] ?? false;
        
        if (!$confirm) {
            throw new Exception("Database reset requires explicit confirmation. Use ['confirm' => true] option.");
        }
        
        if ($verbose) {
            echo "Resetting database...\n";
        }
        
        // Get all user tables (excluding system tables)
        $tables = $this->db->fetchAll("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        // Drop all tables
        $this->db->transaction(function($db) use ($tables, $verbose) {
            // Disable foreign key checks temporarily
            $db->execute('PRAGMA foreign_keys = OFF');
            
            foreach ($tables as $table) {
                $tableName = $table['name'];
                if ($verbose) {
                    echo "Dropping table: {$tableName}\n";
                }
                $db->execute("DROP TABLE IF EXISTS {$tableName}");
            }
            
            // Re-enable foreign key checks
            $db->execute('PRAGMA foreign_keys = ON');
        });
        
        // Run fresh migrations
        if ($verbose) {
            echo "Running fresh migrations...\n";
        }
        
        return $this->runMigrations($options);
    }
    
    /**
     * Run database seeds
     */
    public function runSeeds($seedName = null, $options = []) {
        $verbose = $options['verbose'] ?? false;
        
        if ($seedName) {
            // Run specific seed file
            return $this->runSingleSeed($seedName, $options);
        }
        
        // Run all seed files
        $seedFiles = glob($this->seedPath . '*.sql');
        
        if (empty($seedFiles)) {
            return [
                'success' => true,
                'message' => 'No seed files found',
                'seeds' => []
            ];
        }
        
        sort($seedFiles); // Run in alphabetical order
        
        $results = [];
        $errors = [];
        
        foreach ($seedFiles as $seedFile) {
            $seedName = pathinfo($seedFile, PATHINFO_FILENAME);
            
            try {
                if ($verbose) {
                    echo "Running seed: {$seedName}\n";
                }
                
                $result = $this->runSingleSeed($seedName, $options);
                $results[] = $result;
                
                if ($verbose) {
                    echo "✓ Seed {$seedName} completed successfully\n";
                }
                
            } catch (Exception $e) {
                $error = [
                    'seed' => $seedName,
                    'error' => $e->getMessage()
                ];
                $errors[] = $error;
                
                if ($verbose) {
                    echo "✗ Seed {$seedName} failed: {$e->getMessage()}\n";
                }
                
                // Continue with other seeds unless stop_on_error is set
                if ($options['stop_on_error'] ?? false) {
                    break;
                }
            }
        }
        
        return [
            'success' => empty($errors),
            'message' => empty($errors) ? 'All seeds completed successfully' : 'Some seeds failed',
            'seeds' => $results,
            'errors' => $errors
        ];
    }
    
    /**
     * Run a single seed file
     */
    public function runSingleSeed($seedName, $options = []) {
        $dryRun = $options['dry_run'] ?? false;
        
        $seedFile = $this->seedPath . $seedName . '.sql';
        
        if (!file_exists($seedFile)) {
            throw new Exception("Seed file not found: {$seedFile}");
        }
        
        $sql = file_get_contents($seedFile);
        if ($sql === false) {
            throw new Exception("Cannot read seed file: {$seedFile}");
        }
        
        if ($dryRun) {
            return [
                'seed' => $seedName,
                'status' => 'would_run',
                'message' => 'Would execute seed (dry run)'
            ];
        }
        
        // Execute seed in transaction
        return $this->db->transaction(function($db) use ($seedName, $sql) {
            $statements = $this->splitSqlStatements($sql);
            
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (empty($statement) || substr($statement, 0, 2) === '--') {
                    continue;
                }
                
                try {
                    $db->execute($statement);
                } catch (Exception $e) {
                    throw new Exception("Seed statement failed in {$seedName}: " . $e->getMessage());
                }
            }
            
            return [
                'seed' => $seedName,
                'status' => 'completed',
                'message' => 'Seed executed successfully'
            ];
        });
    }
    
    /**
     * Get migration status
     */
    public function getStatus() {
        $available = $this->getAvailableMigrations();
        $executed = $this->getExecutedMigrations();
        $pending = $this->getPendingMigrations();
        
        return [
            'database_exists' => $this->db->testConnection(),
            'total_migrations' => count($available),
            'executed_migrations' => count($executed),
            'pending_migrations' => count($pending),
            'migrations' => [
                'available' => $available,
                'executed' => $executed,
                'pending' => $pending
            ]
        ];
    }
    
    /**
     * Install fresh database (migrations + seeds)
     */
    public function install($options = []) {
        $verbose = $options['verbose'] ?? false;
        
        if ($verbose) {
            echo "Installing fresh database...\n";
        }
        
        // Run migrations
        $migrationResult = $this->runMigrations($options);
        
        if (!$migrationResult['success']) {
            return [
                'success' => false,
                'message' => 'Migration failed during installation',
                'details' => $migrationResult
            ];
        }
        
        // Run seeds
        $seedResult = $this->runSeeds(null, $options);
        
        return [
            'success' => $migrationResult['success'] && $seedResult['success'],
            'message' => 'Database installation completed',
            'migrations' => $migrationResult,
            'seeds' => $seedResult
        ];
    }
    
    /**
     * Split SQL content into individual statements
     */
    private function splitSqlStatements($sql) {
        // Remove SQL comments
        $sql = preg_replace('/--.*$/m', '', $sql);
        
        // Split by semicolon, but be careful with strings and functions
        $statements = [];
        $current = '';
        $inString = false;
        $stringChar = '';
        
        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];
            
            if (!$inString && ($char === '"' || $char === "'")) {
                $inString = true;
                $stringChar = $char;
            } elseif ($inString && $char === $stringChar) {
                // Check if it's escaped
                if ($i > 0 && $sql[$i-1] !== '\\') {
                    $inString = false;
                }
            } elseif (!$inString && $char === ';') {
                $statements[] = $current;
                $current = '';
                continue;
            }
            
            $current .= $char;
        }
        
        // Add remaining content
        if (!empty(trim($current))) {
            $statements[] = $current;
        }
        
        return array_filter($statements, function($stmt) {
            return !empty(trim($stmt));
        });
    }
}