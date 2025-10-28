document.addEventListener('DOMContentLoaded', () => {

    // 1. Surandame HTML konteinerį
    const container = document.getElementById('plant-details-container');

    // 2. Gauname augalo ID iš URL adreso
    // Sukuriame objektą, kuris leidžia skaityti URL parametrus
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get('id'); // Gauname reikšmę ?id=...

    // 3. Tikriname, ar ID buvo gautas
    if (!plantId) {
        container.innerHTML = '<p>Klaida: Augalo ID nerastas.</p>';
        return; // Sustabdome tolimesnį vykdymą
    }

    // 4. Kreipiamės į API, kad gautume informaciją apie KONKRETŲ augalą
    fetch(`api/get_plant_details.php?id=${plantId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Serverio atsakymas nebuvo sėkmingas');
            }
            return response.json();
        })
        .then(plant => {
            // 5. Gavome duomenis. Tikriname, ar API negrąžino klidos
            if (plant.error) {
                throw new Error(plant.error);
            }

            // 6. Kuriame HTML ir atvaizduojame duomenis
            container.innerHTML = `
                <h2>${plant.name_lt}</h2>
                <em>(${plant.name_latin})</em>

                <h3>Aprašymas</h3>
                <p>${plant.description}</p>

                <h3>Savybės</h3>
                <p>${plant.properties}</p>

                <h3>Paruošimo būdai</h3>
                <p>${plant.preparation_methods}</p>

                <h3>Įspėjimai</h3>
                <p>${plant.warnings}</p>
            `;
        })
        .catch(error => {
            // 7. Klaidos atveju
            console.error('Klaida gaunant augalo detales:', error);
            container.innerHTML = `<p>Įvyko klaida: ${error.message}</p>`;
        });
});