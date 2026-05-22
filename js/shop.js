function createProductCard(product, withCartBtn = false) {
    const oldPriceHtml = product.oldPrice 
        ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` 
        : '';
    
    const starsHtml = product.rating 
        ? `<div class="prod-stars">${'★'.repeat(product.rating)}</div>` 
        : '';
    
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
        // Загружаем товары из локального файла (как у тебя)
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
    
    // 🔽 Обновляем счётчик корзины при загрузке
    updateHeaderCartCount();
});

// ============================================
// 🔽 КОРЗИНА (добавление товаров)
// ============================================
const API_URL = 'http://localhost:3000';

async function addToCart(productId) {
    try {
        const cartRes = await fetch(`${API_URL}/cart`);
        let cart = await cartRes.json();

        const card = document.querySelector(`.prod-card[data-id="${productId}"]`);
        if (!card) return;

        const productData = {
            id: parseInt(productId),
            name: card.querySelector('.prod-name')?.textContent || 'Product',
            price: parseFloat(card.querySelector('.prod-price-new')?.textContent.replace('$', '')) || 0,
            image: card.querySelector('img')?.src || '',
            category: card.querySelector('.prod-tag')?.textContent || '',
            quantity: 1
        };

        const existingItem = cart.find(item => item.id === productData.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(productData);
        }

        await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cart)
        });

        updateHeaderCartCount();
        
    } catch (error) {
        console.error('Ошибка корзины:', error);
    }
}

function updateHeaderCartCount() {
    const cartCountEl = document.getElementById('cartCount');
    if (!cartCountEl) return;
    
    fetch(`${API_URL}/cart`)
        .then(res => res.json())
        .then(cart => {
            const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountEl.textContent = `Cart(${total})`;
        })
        .catch(error => console.error('Ошибка обновления счётчика:', error));
}

// Обработчик кликов по кнопкам корзины (делегирование)
document.addEventListener('click', async (e) => {
    const cartBtn = e.target.closest('.add-to-cart-btn');
    if (cartBtn && cartBtn.dataset.id) {
        e.preventDefault();
        e.stopPropagation();
        
        await addToCart(cartBtn.dataset.id);
        
        // Анимация
        cartBtn.style.transform = 'scale(0.9)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 150);
    }
});