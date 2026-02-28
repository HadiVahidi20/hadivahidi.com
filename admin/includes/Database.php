<?php
// /admin/includes/Database.php
// MySQL-only database connection and operations class
// Updated for your specific MySQL credentials and requirements

class Database {
    private static $instance = null;
    private $pdo;
    private $config;
    
    private function __construct() {
        // Your MySQL configuration
        $this->config = [
            'host' => 'localhost',
            'database' => 'hadinerf_portfolio_dashboard',
            'username' => 'hadinerf_portfolio_admin',
            'password' => 'Afg@2043Afg@2043Afg@2043',
            'charset' => 'utf8mb4'
        ];
        
        $this->connect();
    }
    
    /**
     * Get singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Establish MySQL connection
     */
    private function connect() {
        try {
            $dsn = "mysql:host={$this->config['host']};dbname={$this->config['database']};charset={$this->config['charset']}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->config['charset']}"
            ];
            
            $this->pdo = new PDO($dsn, $this->config['username'], $this->config['password'], $options);
            
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            $this->pdo->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    /**
     * Execute a query
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            throw new Exception("Query execution failed: " . $e->getMessage() . " | SQL: " . $sql);
        }
    }
    
    /**
     * Fetch a single row
     */
    public function fetch($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("Fetch failed: " . $e->getMessage());
        }
    }
    
    /**
     * Fetch all rows
     */
    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Fetch all failed: " . $e->getMessage());
        }
    }
    
    /**
     * Insert and return last insert ID
     */
    public function insert($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Insert failed: " . $e->getMessage());
        }
    }
    
    /**
     * Update rows and return affected count
     */
    public function update($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new Exception("Update failed: " . $e->getMessage());
        }
    }
    
    /**
     * Delete rows and return affected count
     */
    public function delete($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new Exception("Delete failed: " . $e->getMessage());
        }
    }
    
    /**
     * Check if table exists
     */
    public function tableExists($tableName) {
        try {
            $sql = "SHOW TABLES LIKE ?";
            $result = $this->fetch($sql, [$tableName]);
            return $result !== false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get table schema information
     */
    public function getTableSchema($tableName) {
        try {
            $sql = "DESCRIBE {$tableName}";
            return $this->fetchAll($sql);
        } catch (Exception $e) {
            throw new Exception("Failed to get table schema: " . $e->getMessage());
        }
    }
    
    /**
     * Execute transaction
     */
    public function transaction($callback) {
        try {
            $this->pdo->beginTransaction();
            $result = $callback($this);
            $this->pdo->commit();
            return $result;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    /**
     * Get PDO instance for advanced operations
     */
    public function getPDO() {
        return $this->pdo;
    }
    
    /**
     * Get database configuration
     */
    public function getConfig() {
        // Return config without password for security
        $config = $this->config;
        unset($config['password']);
        return $config;
    }
    
    /**
     * Close connection
     */
    public function close() {
        $this->pdo = null;
    }
}
?>