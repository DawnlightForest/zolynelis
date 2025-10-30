<?php
// Failas: api/approve_grower.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// GRIEŽTA PATIKRA: Leidžiame prieigą tik administratoriui
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta. Reikalingos administratoriaus teisės.']);
    exit;
}

// Tikimės gauti duomenis per POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$profileId = $data['profile_id'] ?? null;

if (empty($profileId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta profilio ID.']);
    exit;
}

try {
    // Atnaujiname profilio būseną į "patvirtintas" (1)
    $stmt = $pdo->prepare("UPDATE augaluprofiliai SET is_approved = 1 WHERE id = ?");
    $stmt->execute([$profileId]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Augintojas sėkmingai patvirtintas.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Augintojo profilis nerastas arba jau buvo patvirtintas.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>