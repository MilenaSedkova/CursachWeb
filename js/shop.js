document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortPriceBtn'); // Твоя новая кнопка
    
    const response = await fetch('/data/db.json');
    const data = await response.json();
    const allProducts = data.products;
    
    let currentPage = 1;
    const itemsPerPage = 12;
    let sortDirection = 'asc'; // 'asc' или 'desc'
    
    function renderPage() {
        // 1. Сортируем массив перед отрисовкой
        let sortedProducts = [...allProducts].sort((a, b) => {
            return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        });
        
        // 2. Пагинация
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = sortedProducts.slice(start, end);
        
        // 3. Рендер карточек
        gridElement.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
        
        // 4. Состояние кнопок пагинации
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= sortedProducts.length;
        
        // 5. Обновляем текст кнопки сортировки
        if (sortBtn) {
            const textSpan = sortBtn.querySelector('.btn-text-offset');
            textSpan.textContent = sortDirection === 'asc' ? 'Sort by price ↑' : 'Sort by price ↓';
        }
    }
    
    // Обработчик сортировки
    if (sortBtn) {
        sortBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Чтобы ссылка не прыгала вверх
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            currentPage = 1; // Сброс на первую страницу при смене сортировки
            renderPage();
        });
    }
    
    // Обработчики пагинации
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderPage(); }
    });
    
    nextBtn.addEventListener('click', () => {
        currentPage++; renderPage();
    });
    
    // Первичная отрисовка
    renderPage();
});