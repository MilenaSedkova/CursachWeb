document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortPriceBtn');
    const resetBtn = document.getElementById('resetSortBtn');
    
    const itemsPerPage = 12;
    let currentPage = 1;
    let sortDirection = 'asc';
    
    let originalProducts = [];
    let currentProducts = [];
    
    try {
        const response = await fetch('/data/db.json');
        const data = await response.json();
        originalProducts = data.products;
        currentProducts = [...originalProducts];
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return;
    }
    
    function renderPage() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = currentProducts.slice(start, end);
        
gridElement.innerHTML = productsToShow.map(product => createProductCard(product, true)).join('');
        
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = end >= currentProducts.length;
        
        // Обновляем стрелку
        if (sortBtn) {
            const arrow = sortBtn.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        }
    }
    
    // Сортировка
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            
            currentProducts.sort((a, b) => {
                return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
            });
            
            currentPage = 1;
            renderPage();
        });
    }
    
    // Сброс
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentProducts = [...originalProducts];
            sortDirection = 'asc'; 
            currentPage = 1;
            renderPage();
        });
    }
    
    // Пагинация
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderPage(); }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderPage();
        });
    }
    
    renderPage(); 
});