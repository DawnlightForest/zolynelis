<?php
// Failas: api/get_pending_growers.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// GRIEŽTA PATIKRA: Leidžiame prieigą tik administratoriui
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'Prieiga uždrausta. Reikalingos administratoriaus teisės.']);
    exit;
}

try {
    // Gauname visus profilius, kurie nėra patvirtinti (is_approved = 0)
    // Taip pat sujungiame (JOIN) su 'vartotojai' lentele, kad gautume el. paštą
    $stmt = $pdo->prepare("
        SELECT p.id, p.farm_name, p.user_id, v.email, v.created_at
        FROM augaluprofiliai p
        JOIN vartotojai v ON p.user_id = v.id
        WHERE p.is_approved = 0
    ");
    $stmt->execute();
    $pending_growers = $stmt->fetchAll();

    echo json_encode($pending_growers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>