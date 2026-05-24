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
        if (!gridElement) {
            return;
        }

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

// Глобальный обработчик кликов по кнопкам корзины
document.addEventListener('click', async (e) => {
    const cartBtn = e.target.closest('.add-to-cart-btn');
    
    if (cartBtn && cartBtn.dataset.id) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = parseInt(cartBtn.dataset.id);
        console.log('🖱️ Клик по корзине, ID:', productId);
        
        // Визуальный эффект
        cartBtn.style.transform = 'scale(0.9)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 150);
        
        // Вызов функции добавления
        await addToCart(productId);
    }
});

async function addToCart(productId) {
    console.log(' Добавляем товар:', productId);

    // 1. ПОЛУЧАЕМ ПОЛЬЗОВАТЕЛЯ ИЗ ПАМЯТИ (Исправляет ошибку "user is not defined")
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        alert('Please, log in to view your card!');
        window.location.href = '/html/login.html'; // Или другой путь к странице входа
        return; 
    }
    const user = JSON.parse(userJson);

    // 2. Ищем карточку
    const card = document.querySelector(`.prod-card[data-id="${productId}"]`);
    if (!card) {
        console.error('Карточка не найдена!');
        return;
    }

    // 3. Формируем данные для корзины
    const productData = {
        productId: parseInt(productId),
        userId: user.id,       // Теперь скрипт знает, откуда взять user.id!
        name: card.querySelector('.prod-name')?.textContent || 'Product',
        price: parseFloat(card.querySelector('.prod-price-new')?.textContent.replace('$', '')) || 0,
        image: card.querySelector('.prod-image-wrapper img')?.src || '',
        category: card.querySelector('.prod-tag')?.textContent || '',
        quantity: 1
    };

    try {
        // 4. ИЩЕМ ТОВАРЫ ТОЛЬКО ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (Добавлен фильтр ?userId=...)
        const res = await fetch(`http://localhost:3000/cartItems?userId=${user.id}`);
        let cartItems = await res.json();
        if (!Array.isArray(cartItems)) cartItems = [];

        // Проверяем, есть ли уже этот товар в корзине ЭТОГО пользователя
        const existing = cartItems.find(item => item.productId === productData.productId);

        if (existing) {
            await fetch(`http://localhost:3000/cartItems/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: existing.quantity + 1 })
            });
        } else {
            await fetch('http://localhost:3000/cartItems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }

        if (typeof showNotification === 'function') {
            showNotification(`${productData.name} добавлен в корзину`);
        }

    } catch (error) {
        console.error('Ошибка:', error);
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
        z-index: 10000;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}