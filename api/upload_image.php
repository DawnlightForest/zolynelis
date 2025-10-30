<?php
// Failas: api/upload_image.php
session_start();
header('Content-Type: application/json');

// 1. Saugumo patikra (leidžiame įkelti tik prisijungusiems adminams arba augintojams)
if (!isset($_SESSION['logged_in'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}

// 2. Patikriname, ar failas buvo atsiųstas
if (!isset($_FILES['imageFile'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Failas nebuvo atsiųstas.']);
    exit;
}

$file = $_FILES['imageFile'];

// 3. Patikriname įkėlimo klaidas
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo json_encode(['error' => 'Failo įkėlimo klaida.']);
    exit;
}

// 4. Tikriname failo tipą (leidžiame tik paveikslėlius)
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Netinkamas failo tipas. Leidžiama tik JPG, PNG, GIF.']);
    exit;
}

// 5. Sukuriame unikalų failo pavadinimą, kad išvengtume perrašymo
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$uniqueName = uniqid('plant_', true) . '.' . $extension;

// 6. Nustatome, kur failas bus išsaugotas (vienu lygiu aukščiau iš 'api' į 'uploads')
$uploadDir = '../uploads/';
$destination = $uploadDir . $uniqueName;

// 7. Perkeliame failą iš laikinos vietos į galutinę
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Sėkmė! Grąžiname viešą nuorodą į failą
    $publicUrl = 'uploads/' . $uniqueName; // Tai yra kelias, kurį saugosime DB
    http_response_code(200);
    echo json_encode(['success' => true, 'filePath' => $publicUrl]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Nepavyko išsaugoti failo serveryje.']);
}
?>