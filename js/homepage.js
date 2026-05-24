document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Загружаем товары
    const response = await fetch('/data/db.json');
    const data = await response.json();
    const allProducts = data.products;
    
    const productsToShow = allProducts.slice(0, 8);
    
    // Отрисовка
    gridElement.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    
    // Кнопка "Load More" ведёт на страницу Shop
    if (loadMoreBtn) {
        loadMoreBtn.href = 'html/Shop.html';
    }
});