// Failas: map.js (SU FILTRAVIMO LOGIKA)

document.addEventListener('DOMContentLoaded', () => {

    const map = L.map('map-container').setView([55.1694, 23.8813], 7);
    map.invalidateSize(); // Būtina Leaflet

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const plantFilter = document.getElementById('plant-filter');
    let markersLayer = L.layerGroup().addTo(map); // Sukuriame sluoksnį smeigtukams valdyti

    // 1. FUNKCIJA: Įkelia augalus į filtruojamą sąrašą
    function loadPlantOptions() {
        fetch('api/get_plants.php')
            .then(response => response.json())
            .then(plants => {
                plants.forEach(plant => {
                    const option = document.createElement('option');
                    option.value = plant.id;
                    option.textContent = plant.name_lt;
                    plantFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Klaida kraunant augalų sąrašą:', error));
    }

    // 2. FUNKCIJA: Atnaujina žemėlapį pagal pasirinktą filtrą
    function updateMap(plantId = 0) {
        markersLayer.clearLayers(); // Ištriname visus senus smeigtukus

        let apiUrl = '';
        
        if (plantId == 0) {
            // Rodo VISUS augintojus
            apiUrl = 'api/get_growers.php';
        } else {
            // Rodo FILTRUOTUS augintojus
            apiUrl = `api/get_growers_by_plant.php?plant_id=${plantId}`;
        }
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('API klaida.');
                return response.json();
            })
            .then(growers => {
                growers.forEach(grower => {
                    if (grower.latitude && grower.longitude) {
                        
                        const lat = parseFloat(grower.latitude);
                        const lon = parseFloat(grower.longitude);

                        // --- NAUJAS KODAS PRASIDEDA ČIA ---
                        
                        // Sukuriame turinį popup'ui
                        let popupContent = '';

                        // 1. Pridedame logotipą, jei jis yra
                        if (grower.logo_url) {
                            popupContent += `<img src="${grower.logo_url}" alt="${grower.farm_name}" style="width:100px; height:auto; display:block; margin-bottom:5px;">`;
                        }

                        // 2. Pridedame pavadinimą ir aprašymą
                        popupContent += `<b>${grower.farm_name}</b><br>${grower.description}`;
                        
                        // 3. Pridėsime nuorodą į pilną profilį vėliau (kitam žingsny)
                        // popupContent += `<br><a href="grower_profile.html?id=${grower.id}">Žiūrėti profilį...</a>`;
                        popupContent += `<br><br><a href="grower_profile.html?id=${grower.id}" style="font-weight:bold;">Žiūrėti pilną profilį...</a>`;
                        // --- NAUJAS KODAS BAIGIASI ČIA ---

                        L.marker([lat, lon])
                            .addTo(markersLayer) // Dedame į sluoksnį
                            .bindPopup(popupContent); // Naudojame naują turinį
                    }
                });
                
                // Centruojame žemėlapį, jei rasta bent viena lokacija
                if (growers.length > 0) {
                    const firstGrower = growers[0];
                    map.setView([parseFloat(firstGrower.latitude), parseFloat(firstGrower.longitude)], 9); // Priartiname šiek tiek
                } else if (plantId != 0) {
                     alert("Pagal pasirinktą augalą augintojų nerasta.");
                     map.setView([55.1694, 23.8813], 7); // Grįžtame į pradinį centrą
                }
            })
            .catch(error => console.error('Klaida gaunant augintojų duomenis:', error));
    }

    // 3. ĮVYKIS: Kai pasirenkama nauja reikšmė filtre
    plantFilter.addEventListener('change', (e) => {
        updateMap(e.target.value);
    });

    // PALEIDIMAS:
    loadPlantOptions(); // Įkeliame augalus į filtrą
    updateMap();        // Iš karto parodome VISUS augintojus
});