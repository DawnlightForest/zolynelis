// Failas: blog.js (ATNAUJINTAS DIZAINAS)

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
                // Sutrumpiname tekstą
                const shortContent = article.content.substring(0, 150) + '...';
                const date = new Date(article.created_at).toLocaleDateString('lt-LT');

                const card = document.createElement('div');
                card.className = 'plant-card'; // Naudojame kortelės stilių
                
                // --- ŠTAI PAKEISTA DALIS NUOTRAUKAI ---
                let imageHtml = '';
                if (article.image_url) {
                    // Dedame į "wrapper", kad veiktų CSS stilius
                    imageHtml = `<div class="blog-image-wrapper"><img src="${article.image_url}" alt="${article.title}"></div>`;
                }
                // ---------------------------------------

                // --- PAKEISTA STRUKTŪRA SU KLASĖMIS ---
                card.innerHTML = `
                    ${imageHtml}
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span class="blog-date">📅 ${date}</span>
                        </div>
                        
                        <h3 class="blog-title">
                            <a href="article.html?id=${article.id}">${article.title}</a>
                        </h3>
                        
                        <p class="blog-excerpt">${shortContent}</p>
                        
                        <a href="article.html?id=${article.id}" class="read-more-link">Skaityti toliau &rarr;</a>
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