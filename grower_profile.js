// Failas: grower_profile.js

document.addEventListener('DOMContentLoaded', () => {
    
    const profileContainer = document.getElementById('grower-profile-container');
    const productsContainer = document.getElementById('grower-products-container');

    // 1. Gauname augintojo ID iš URL adreso
    const params = new URLSearchParams(window.location.search);
    const growerId = params.get('id');

    if (!growerId) {
        profileContainer.innerHTML = '<p class="error">Klaida: Augintojo ID nerastas.</p>';
        productsContainer.style.display = 'none'; // Paslepiame produktų skiltį
        return;
    }

    // 2. Kreipiamės į naująjį API
    fetch(`api/get_grower_details.php?id=${growerId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Serverio klaida'); });
            }
            return response.json();
        })
        .then(data => {
            // 3. Atvaizduojame profilio informaciją
            const profile = data.profile;
            let profileHtml = `
                <h2>${profile.farm_name}</h2>
            `;
            
            if (profile.logo_url) {
                profileHtml += `<img src="${profile.logo_url}" alt="${profile.farm_name}" style="max-width: 200px; height: auto; border: 1px solid #ddd; margin-bottom: 15px;">`;
            }
            
            profileHtml += `
                <p><strong>Aprašymas:</strong> ${profile.description || 'Nenurodyta'}</p>
                <p><strong>Adresas:</strong> ${profile.address || 'Nenurodyta'}</p>
                <p><strong>Telefonas:</strong> ${profile.phone || 'Nenurodyta'}</p>
            `;
            profileContainer.innerHTML = profileHtml;

            // 4. Atvaizduojame produktų sąrašą
            const products = data.products;
            if (products.length > 0) {
                let productsHtml = '<ul>';
                products.forEach(product => {
                    productsHtml += `
                        <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            <strong>${product.name}</strong> (${product.status})<br>
                            <small>${product.description || ''}</small>
                        </li>
                    `;
                });
                productsHtml += '</ul>';
                productsContainer.innerHTML = productsHtml;
            } else {
                productsContainer.innerHTML = '<p>Šis augintojas šiuo metu neturi aktyvių produktų.</p>';
            }
        })
        .catch(error => {
            console.error('Klaida gaunant augintojo duomenis:', error);
            profileContainer.innerHTML = `<p class="error">Klaida: ${error.message}</p>`;
            productsContainer.style.display = 'none';
        });
});