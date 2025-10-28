<?php
// Failas: api/register.php
require_once '../db_config.php';
header('Content-Type: application/json');

// Leidžiame tik POST metodą (kad būtų gauti duomenys iš formos)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Metodas neleidžiamas
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

// Gauname duomenis iš POST užklausos
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password =$data['password'] ?? '';
$farm_name = $data['farm_name'] ?? '';

// 1. Validacija
if (empty($email) || empty($password) || empty($farm_name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Užpildykite visus privalomus laukus.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Neteisingas el. pašto formatas.']);
    exit;
}

try {
    // 2. Patikriname, ar el. paštas jau užimtas
    $stmt = $pdo->prepare("SELECT id FROM vartotojai WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Vartotojas su šiuo el. paštu jau egzistuoja.']);
        exit;
    }

    // 3. Sllaptažodžio hash'inimas
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Pradedame transakciją
    $pdo->beginTransaction();

    // 4. Įrašymas į VARTOTOJAI lentelę
    $stmt = $pdo->prepare("INSERT INTO vartotojai (email, password_hash, role) VALUES (?, ?, 'grower')");
    $stmt->execute([$email, $passwordHash]);

    // Gauname k1 tik sukurto vartotojo ID
    $newUserId = $pdo->lastInsertId();

    // 5. Įrašymas į AUGALUPROFILIAI lentelę
    // Nustatote is_approved ž 0, kad administratorius turėtų patvirtinti
    $stmt = $pdo->prepare("INSERT INTO augaluprofiliai (user_id, farm_name, is_approved) VALUES (?, ?, 0)");
    $stmt->execute([$newUserId, $farm_name]);

    // Patvirtiname transakciją
    $pdo->commit();

    // 6. Sėkmės pranešimas
    http_response_code(201); // Sukurta
    echo json_encode(['success' => true, 'message' => 'Registracija sėkminga. Jūsų paskyra bus aktyvuota po administratoriaus patvirtinimo.']);

} catch (PDOException $e) {
    // 7. Klaidos atveju atšaukiame transakciją
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida registruojos metu: ' . $e->getMessage()]);
} 

?>
