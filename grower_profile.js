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

            loadReviews(growerId); 
            setupReviewForm(growerId);

        })
        .catch(error => {
            console.error('Klaida gaunant augintojo duomenis:', error);
            profileContainer.innerHTML = `<p class="error">Klaida: ${error.message}</p>`;
            productsContainer.style.display = 'none';
        });
});


// FUNKCIJA: Įkelia ir parodo visus atsiliepimus
function loadReviews(growerId) {
    const container = document.getElementById('reviews-list-container');
    container.innerHTML = '<p>Kraunami atsiliepimai...</p>';

    fetch(`api/get_reviews.php?grower_profile_id=${growerId}`)
        .then(response => response.json())
        .then(reviews => {
            if (reviews.error) {
                throw new Error(reviews.error);
            }
            
            if (reviews.length === 0) {
                container.innerHTML = '<p>Šis augintojas kol kas neturi atsiliepimų.</p>';
                return;
            }

            let html = '';
            reviews.forEach(review => {
                // Sukuriame žvaigždutes
                let stars = '⭐'.repeat(review.rating);
                
                html += `
                    <div style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                        <strong>${review.reviewer_name}</strong> - ${stars}
                        <p style="margin-top: 5px;">${review.comment}</p>
                        <small style="color: #777;">${new Date(review.created_at).toLocaleDateString('lt-LT')}</small>
                    </div>
                `;
            });
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Klaida gaunant atsiliepimus:', error);
            container.innerHTML = '<p class="error">Klaida kraunant atsiliepimus.</p>';
        });
}

// FUNKCIJA: Nustato atsiliepimo formos siuntimą
function setupReviewForm(growerId) {
    const form = document.getElementById('review-form');
    const messageBox = document.getElementById('review-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageBox.textContent = 'Siunčiama...';

        const reviewData = {
            grower_profile_id: growerId,
            rating: document.getElementById('rating').value,
            comment: document.getElementById('comment').value,
            reviewer_name: document.getElementById('reviewer_name').value
        };

        try {
            const response = await fetch('api/add_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            const result = await response.json();

            if (response.ok) {
                messageBox.textContent = result.message;
                messageBox.style.color = 'green';
                form.reset(); // Išvalome formą
                loadReviews(growerId); // Atnaujiname atsiliepimų sąrašą
            } else {
                throw new Error(result.error || 'Nežinoma klaida.');
            }
        } catch (error) {
            messageBox.textContent = error.message;
            messageBox.style.color = 'red';
        }
    });
}