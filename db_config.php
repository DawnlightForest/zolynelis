<?php
// Failas: zolynelis/db_config.php

// 1. Prisijungimo duomenys
$host = '127.0.0.1'; // localhost
$db   = 'zolynelis'; // DB pavadiimas
$user = 'root';      // vartotojas
$pass = '';          // slapažodis
$charset = 'utf8mb4';// koduotė

// 2. POD DNS (Data Source Name) eilutė
$dns = "mysql:host=$host;dbname=$db;charset=$charset";

// 3. Papildomi nustatymai
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// 4. bandome prisijungti prie DB
try {
    $pdo = new PDO($dns, $user, $pass, $options);
} catch (\PDOException $e) {
    // Jei nepavyksta - metame klaidą
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
