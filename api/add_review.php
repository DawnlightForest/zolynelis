<?php
// Failas: api/add_review.php
require_once '../db_config.php';
header('Content-Type: application/json');

// Leidžiame tik POST metodą
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// 1. Gauname ir validuojame duomenis
$grower_profile_id = $data['grower_profile_id'] ?? null;
$rating = $data['rating'] ?? null;
$comment = $data['comment'] ?? '';
$reviewer_name = $data['reviewer_name'] ?? 'Anonimas';

// Minimali validacija
if (empty($grower_profile_id) || empty($rating)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta augintojo ID arba reitingo.']);
    exit;
}
if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'Reitingas turi būti skaičius nuo 1 iki 5.']);
    exit;
}
// Apribojame vardo ilgį
if (empty(trim($reviewer_name))) {
    $reviewer_name = 'Anonimas';
}

try {
    // 2. Įrašome atsiliepimą į DB
    $sql = "INSERT INTO reviews (grower_profile_id, rating, comment, reviewer_name) 
            VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$grower_profile_id, $rating, $comment, $reviewer_name]);

    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Ačiū už jūsų atsiliepimą!']);

} catch (PDOException $e) {
    http_response_code(500);
    // Tikriname, ar klaida nėra dėl neegzistuojančio augintojo ID
    if ($e->getCode() == '23000') {
        echo json_encode(['error' => 'Nurodytas augintojas neegzistuoja.']);
    } else {
        echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
    }
}
?>