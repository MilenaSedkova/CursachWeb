// 🛒 card.js - Страница корзины

// Твоя функция createProductCard (такая же, как в shop.js)
function createProductCard(product, withCartBtn = true) {
    const oldPrice = product.oldPrice ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` : '';
    return `
        <div class="prod-card ${product.customClass || ''}" data-id="${product.id}">
            <div class="prod-tags"><span class="prod-tag">${product.category || 'Product'}</span></div>
            <div class="prod-image-wrapper"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
            <h3 class="prod-name">${product.name}</h3>
            <div class="prod-price-row">
                ${oldPrice}
                <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                <div class="prod-stars"><img src="/pictures/HomepageImages/Star.svg" alt="rating"></div>
            </div>
            ${withCartBtn ? `<button class="add-to-cart-btn" data-id="${product.id}"><img src="/pictures/HomepageImages/Cart Icon.svg" alt="cart"></button>` : ''}
        </div>`;
}

// Карточка для корзины (ТА ЖЕ структура + кнопки управления)
function createCartItemHTML(item) {
    const oldPrice = (item.oldPrice && typeof item.oldPrice === 'number') 
        ? `<span class="prod-price-old">$${item.oldPrice.toFixed(2)}</span>` : '';
    const img = (item.image && typeof item.image === 'string' && !item.image.includes('undefined')) 
        ? item.image : '/pictures/HomepageImages/default-product.png';
    const id = item.id || item.productId || '';
    
    return `
        <div class="prod-card in-cart" data-id="${id}">
            <div class="prod-card-top">
                <div class="prod-tags"><span class="prod-tag">${item.category || 'Product'}</span></div>
                <div class="cart-qty-group">
    <span class="cart-qty-value">${item.quantity || 1} шт</span>
    <button class="cart-qty-dec" data-id="${item.id || item.productId || ''}">−</button>
    <button class="cart-qty-inc" data-id="${item.id || item.productId || ''}">+</button>
    <button class="cart-qty-del" data-id="${item.id || item.productId || ''}">🗑️</button>
</div>
            </div>
            <div class="prod-image-wrapper"><img src="${img}" alt="${item.name || 'Product'}" loading="lazy"></div>
            <h3 class="prod-name">${item.name || 'Unknown'}</h3>
            <div class="prod-price-row">
                ${oldPrice}
                <span class="prod-price-new">$${(item.price || 0).toFixed(2)}</span>
                <div class="prod-stars"><img src="/pictures/HomepageImages/Star.svg" alt="rating"></div>
            </div>
        </div>`;
}

// Загрузка и отрисовка корзины
document.addEventListener('DOMContentLoaded', async () => {
    const empty = document.getElementById('emptyCart');
    const list = document.getElementById('cartItems');
    if (!list) return; // не на странице корзины
    
    try {
        const res = await fetch(`${API_URL}/cartItems`);
        let items = await res.json();
        if (!Array.isArray(items)) items = [];
        
        // Обновляем счётчик в хедере
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        
        if (items.length === 0) {
            if (empty) empty.style.display = 'flex';
            list.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            list.style.display = 'grid';
            list.innerHTML = items.map(createCartItemHTML).join('');
            
            // Обработчики кнопок
            list.querySelectorAll('.cart-btn.plus').forEach(btn => 
                btn.onclick = () => changeQty(parseInt(btn.dataset.id), 1));
            list.querySelectorAll('.cart-btn.minus').forEach(btn => 
                btn.onclick = () => changeQty(parseInt(btn.dataset.id), -1));
            list.querySelectorAll('.cart-btn.delete').forEach(btn => 
                btn.onclick = () => removeItem(parseInt(btn.dataset.id)));
        }
    } catch (e) { console.error('Ошибка корзины:', e); }
});

// Изменение количества
async function changeQty(id, delta) {
    try {
        const r = await fetch(`${API_URL}/cartItems/${id}`);
        const item = await r.json();
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            await fetch(`${API_URL}/cartItems/${id}`, {method: 'DELETE'});
        } else {
            await fetch(`${API_URL}/cartItems/${id}`, {
                method: 'PATCH',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({quantity: newQty})
            });
        }
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        location.reload();
    } catch (e) { console.error('Ошибка изменения количества:', e); }
}

// Удаление товара
async function removeItem(id) {
    try {
        await fetch(`${API_URL}/cartItems/${id}`, {method: 'DELETE'});
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        location.reload();
    } catch (e) { console.error('Ошибка удаления:', e); }
}