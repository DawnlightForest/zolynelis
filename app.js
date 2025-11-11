// Failas: app.js (ATNAUJINTAS SU PAIEŠKA)

// Surandame konteinerį ir paieškos laukelį iš karto
const container = document.getElementById('plants-container');
const searchBar = document.getElementById('search-bar');

// 1. FUNKCIJA, KURI ATVAIZDUOJA AUGALUS
// Šią funkciją naudosime ir pradiniam užkrovimui, ir paieškai
function renderPlants(plants) {
    // Išvalome konteinerį
    container.innerHTML = '';

    if (plants.length === 0) {
        container.innerHTML = '<p>Pagal jūsų paiešką augalų nerasta.</p>';
        return;
    }

    plants.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'plant-card';

        const title = document.createElement('h3');
        title.textContent = plant.name_lt;

        const latinName = document.createElement('p');
        latinName.textContent = `(${plant.name_latin})`;

        const link = document.createElement('a');
        link.textContent = 'Skaityti daugiau...';
        link.href = `plant.html?id=${plant.id}`;

        card.appendChild(title);
        card.appendChild(latinName);
        card.appendChild(link);
        container.appendChild(card);
    });
}

// 2. FUNKCIJA, KURI GAUNA AUGALUS IŠ API
// Pagal nutylėjimą terminas yra tuščias (grąžins visus augalus)
async function fetchPlants(searchTerm = '') {
    // Nustatome, į kurį API kreiptis
    let apiUrl = '';
    if (searchTerm) {
        // Naudojame naują API su paieškos terminu
        apiUrl = `api/search_plants.php?term=${encodeURIComponent(searchTerm)}`;
    } else {
        // Naudojame seną API visiems augalams gauti
        apiUrl = 'api/get_plants.php';
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Serverio atsakymas nebuvo sėkmingas');
        }
        const plants = await response.json();
        
        // Atvaizduojame gautus augalus
        renderPlants(plants);

    } catch (error) {
        console.error('Klaida gaunant duomenis:', error);
        container.innerHTML = '<p>Įvyko klaida kraunant augalus. Bandykite vėliau.</p>';
    }
}

// 3. PALEIDIMAS

// Kai puslapis užsikrauna, iš karto parodome VISUS augalus
document.addEventListener('DOMContentLoaded', () => {
    container.innerHTML = '<p>Kraunami augalai...</p>';
    fetchPlants(); // Kviečiame be termino

    // Pridedame įvykio klausiklį paieškos laukeliui
    searchBar.addEventListener('input', (e) => {
        const term = e.target.value;
        // Kviečiame tą pačią funkciją, bet jau su paieškos terminu
        fetchPlants(term);
    });
});