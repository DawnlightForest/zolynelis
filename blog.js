// Failas: blog.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('articles-container');

    fetch('api/get_articles.php')
        .then(response => response.json())
        .then(articles => {
            container.innerHTML = '';

            if (articles.length === 0) {
                container.innerHTML = '<p>Straipsnių kol kas nėra.</p>';
                return;
            }

            articles.forEach(article => {
                // Sutrumpiname tekstą, jei jis labai ilgas
                const shortContent = article.content.substring(0, 150) + '...';
                const date = new Date(article.created_at).toLocaleDateString('lt-LT');

                const card = document.createElement('div');
                card.className = 'plant-card'; // Naudojame tą patį stilių kaip augalų kortelės
                card.style.marginBottom = '20px';

                let imageHtml = '';
                if (article.image_url) {
                    imageHtml = `<img src="${article.image_url}" alt="${article.title}" style="height: 200px; object-fit: cover;">`;
                }

                card.innerHTML = `
                    ${imageHtml}
                    <div style="padding: 15px;">
                        <h3 style="margin-top: 0;">${article.title}</h3>
                        <small style="color: #777;">${date}</small>
                        <p>${shortContent}</p>
                        </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Klaida:', error);
            container.innerHTML = '<p class="error">Nepavyko įkelti straipsnių.</p>';
        });
});