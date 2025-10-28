// Laukia, kol HTML dokumentas bus pilnai įkeltas
document.addEventListener('DOMContentLoaded', () => {

    // 1. Surandame HTML elementą, į kurį dėsime duomenis
    const container = document.getElementById('plants-container');

    //2. Kreipiamės į savo sukurtą API
    fetch('api/get_plants.php')
        .then(response => {
            // Tikriname, ar serveris atsakė sėkmingai
            if (!response.ok) {
                throw new Error('Serverio atsakymas nebuvo sėkmingas');
            }
            // Konvertuojame JSON atsakymą į JavaScript objektą
            return response.json();
        })
        .then(plants => {
            // 3. Gavome duomenis 

            // Išvalome pranešimą "Kraunami augalai..."
            container.innerHTML = '';

            // 4. Einame per kiekvieną augalą gautame masyve
            plants.forEach(plant => {
                // Kuriame HTML elementus kiekvienam augalui
                const card = document.createElement('div');
                card.className = 'plant-card'; // Pridedame klasę stiliui

                const title = document.createElement('h3');
                title.textContent = plant.name_lt; // Paimame pavadinimą API
                
                const latinName = document.createElement('p');
                latinName.textContent = `(${plant.name_latin})`; // Paimame lotynišką pavadinimą
                
                // Sukureme nuorodą į detalų puslapį
                const link = document.createElement('a');
                link.textContent = 'Skaityti daugiau...';
                link.href = `plant.html?id=${plant.id}`; // Pvz.: plant.html?id=1

                // Dedame elementus į kortelę
                card.appendChild(title);
                card.appendChild(latinName);
                card.appendChild(link);

                // Dedame kortelę į pagrindinį konteinerį
                container.appendChild(card);
            });
        })
        .catch(error => {
            // 5. Klaidos atveju
            console.error('Klaida gaunant augalus:', error);
            container.innerHTML = '<p>Įvyko klaida kraunant augalus. Bandykite vėliau.</p>';
});
});