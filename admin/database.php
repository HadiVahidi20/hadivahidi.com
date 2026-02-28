<?php
// /admin/config/database.php
// Database configuration with your specific MySQL credentials

return [
    'type' => 'mysql',
    'host' => 'localhost',
    'database' => 'hadinerf_portfolio_dashboard',
    'username' => 'hadinerf_portfolio_admin',
    'password' => 'Afg@2043Afg@2043Afg@2043',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]
];