document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortBtn');
    
    // Загружаем товары
    const response = await fetch('/data/db.json');
    const data = await response.json();
    const allProducts = data.products;
    
    // 🔑 ПАГИНАЦИЯ: 12 товаров на страницу (3 строки)
    let currentPage = 1;
    const itemsPerPage = 12; // 3 строки × 4 колонки
    
    function renderPage() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = allProducts.slice(start, end);
        
        gridElement.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
        
        // Обновляем кнопки
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= allProducts.length;
    }
    
    // Обработчики
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        currentPage++;
        renderPage();
    });
    
    // Первая отрисовка
    renderPage();
});