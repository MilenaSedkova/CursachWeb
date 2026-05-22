function createProductCard(product, withCartBtn = true) {
    const oldPriceHtml = product.oldPrice 
        ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` 
        : '';
    
    const starsHtml = `<div class="prod-stars"><img src="/pictures/HomepageImages/Star.svg" alt="rating"></div>`;
    const extraClass = product.customClass ? product.customClass : '';
    
    return `
        <div class="prod-card ${extraClass}" data-id="${product.id}">
            <div class="prod-tags">
                <span class="prod-tag">${product.category || 'Product'}</span>
            </div>
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <h3 class="prod-name">${product.name}</h3>
            <div class="prod-price-row">
                ${oldPriceHtml}
                <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                ${starsHtml}
            </div>
            ${withCartBtn ? `
            <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add to cart">
                <img src="/pictures/HomepageImages/Cart Icon.svg" alt="cart">
            </button>` : ''}
        </div>
    `;
}

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
        
        if (sortBtn) {
            const arrow = sortBtn.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        }
    }
    
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
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentProducts = [...originalProducts];
            sortDirection = 'asc'; 
            currentPage = 1;
            renderPage();
        });
    }
    
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
    updateHeaderCartCount();
});

// ============================================
// 🔽 КОРЗИНА С localStorage (РАБОТАЕТ БЕЗ JSON SERVER)
// ============================================

async function addToCart(productId) {
    console.log('🛒 [1] addToCart вызван, ID:', productId);
    
    const card = document.querySelector(`.prod-card[data-id="${productId}"]`);
    if (!card) {
        console.error('❌ [2] Карточка не найдена!');
        return;
    }
    console.log('✅ [2] Карточка найдена');
    
    const productData = {
        productId: parseInt(productId),
        name: card.querySelector('.prod-name')?.textContent || 'Product',
        price: parseFloat(card.querySelector('.prod-price-new')?.textContent.replace('$', '')) || 0,
        image: card.querySelector('.prod-image-wrapper img')?.src || '',
        category: card.querySelector('.prod-tag')?.textContent || '',
        quantity: 1
    };
    
    console.log('📦 [3] Данные товара:', productData);
    
    try {
        console.log('🌐 [4] Запрашиваю сервер...');
        const res = await fetch('http://localhost:3000/cartItems');
        let cartItems = await res.json();
        console.log('✅ [4] На сервере сейчас:', cartItems.length, 'товаров');
        
        if (!Array.isArray(cartItems)) cartItems = [];
        
        const existing = cartItems.find(item => item.productId === productData.productId);
        
        if (existing) {
            console.log('🔄 [5] Товар уже есть, увеличиваю количество');
            await fetch(`http://localhost:3000/cartItems/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: existing.quantity + 1 })
            });
        } else {
            console.log('➕ [5] Добавляю новый товар');
            await fetch('http://localhost:3000/cartItems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        console.log('✅ [6] Товар сохранён на сервере');
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
            console.log('✅ [7] Счётчик обновлён');
        }
        
        alert('✅ Товар добавлен!');
        
    } catch (error) {
        console.error('❌ ОШИБКА:', error);
        alert('❌ Ошибка: ' + error.message);
    }
}

function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #669C61;
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        font-family: 'Inter', sans-serif;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}