<?php
// Failas: api/logout.php
session_start();

// Išvalome ir sunaikiname sesiją
session_unset();
session_destroy();

// Grąžiname sėkmės pranešimą (nors Frontend jo nelauks)
header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>