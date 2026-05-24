
// Глобальные функции для inline обработчиков
window.cartIncrease = async function(id) {
    console.log('➕ + нажат, ID:', id);
    try {
        const res = await fetch(`${API_URL}/cartItems/${id}`);
        if (!res.ok) throw new Error('Not found');
        const item = await res.json();
        
        await fetch(`${API_URL}/cartItems/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity + 1 })
        });
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }
        location.reload();
    } catch (error) {
        console.error('❌ Ошибка +:', error);
    }
};

window.cartDecrease = async function(id) {
    console.log('➖ - нажат, ID:', id);
    try {
        const res = await fetch(`${API_URL}/cartItems/${id}`);
        if (!res.ok) throw new Error('Not found');
        const item = await res.json();
        const newQty = item.quantity - 1;
        
        if (newQty <= 0) {
            await fetch(`${API_URL}/cartItems/${id}`, { method: 'DELETE' });
        } else {
            await fetch(`${API_URL}/cartItems/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });
        }
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }
        location.reload();
    } catch (error) {
        console.error('❌ Ошибка -:', error);
    }
};

window.cartDelete = async function(id) {
    console.log('🗑️ Удаление, ID:', id);
    try {
        await fetch(`${API_URL}/cartItems/${id}`, { method: 'DELETE' });
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }
        location.reload();
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
    }
};

// Создание карточки
function createCartItemHTML(item) {
    const oldPrice = (item.oldPrice && typeof item.oldPrice === 'number') 
        ? `<span class="prod-price-old">$${item.oldPrice.toFixed(2)}</span>` : '';
    const img = (item.image && typeof item.image === 'string' && !item.image.includes('undefined')) 
        ? item.image : '/pictures/HomepageImages/default-product.png';
    const id = item.id || item.productId || '';
    const quantity = item.quantity || 1;
    
    return `
        <div class="prod-card in-cart" data-id="${id}">
            <div class="prod-card-top">
                <div class="prod-tags"><span class="prod-tag">${item.category || 'Product'}</span></div>
                <div class="cart-qty-group">
                    <span class="cart-qty-value">${quantity} шт</span>
                   <button type="button" onclick="cartDecrease('${id}')">−</button>
                    <button type="button" onclick="cartIncrease('${id}')">+</button>
                    <button type="button" onclick="cartDelete('${id}')">🗑️</button>
                </div>
            </div>
            <div class="prod-image-wrapper">
                <img src="${img}" alt="${item.name || 'Product'}" loading="lazy">
            </div>
            <h3 class="prod-name">${item.name || 'Unknown'}</h3>
            <div class="prod-price-row">
                ${oldPrice}
                <span class="prod-price-new">$${(item.price || 0).toFixed(2)}</span>
                <div class="prod-stars"><img src="/pictures/HomepageImages/Star.svg" alt="rating"></div>
            </div>
        </div>`;
}

// Инициализация
// Инициализация корзины на странице (замени этот кусок в своем файле)
document.addEventListener('DOMContentLoaded', async () => {
    const empty = document.getElementById('emptyCart');
    const list = document.getElementById('cartItems');
    
    // НАХОДИМ КНОПКУ ЗАКАЗА (убедись, что у нее в HTML стоит id="orderBtn")
    const orderBtn = document.getElementById('orderBtn'); 

    if (!list) return;

    // 1. Проверяем авторизацию
    const userJson = localStorage.getItem('currentUser');
    
    if (!userJson) {
        if (empty) {
            empty.style.display = 'flex';
            empty.innerHTML = `
                <h2>Please log in to view your cart</h2>
                <a href="/html/login.html" class="btn-primary" style="margin-top: 20px;">Enter</a>
            `;
        }
        list.style.display = 'none';
        
        // Прячем кнопку заказа!
        if (orderBtn) orderBtn.style.display = 'none'; 
        return;
    }

    const user = JSON.parse(userJson);
    
    try {
        // Запрашиваем товары ИМЕННО ЭТОГО пользователя
        const res = await fetch(`${API_URL}/cartItems?userId=${user.id}`);
        let items = await res.json();
        if (!Array.isArray(items)) items = [];
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }
        
        if (items.length === 0) {
            // Авторизован, но корзина ПУСТАЯ
            if (empty) {
                empty.style.display = 'flex';
                // Текст меняется, кнопку "Войти" не показываем, даем ссылку в магазин
                empty.innerHTML = `
                    <h2>Your cart is empty</h2>
                    <a href="/html/Shop.html" class="btn-primary" style="margin-top: 20px;">Go to Shop</a>
                `;
            }
            list.style.display = 'none';
            
            // Прячем кнопку заказа!
            if (orderBtn) orderBtn.style.display = 'none'; 
            
        } else {
            // СЦЕНАРИЙ В: В корзине ЕСТЬ ТОВАРЫ
            if (empty) empty.style.display = 'none';
            list.style.display = 'grid';
            list.innerHTML = items.map(createCartItemHTML).join('');
            
            // ПОКАЗЫВАЕМ кнопку заказа!
            if (orderBtn) orderBtn.style.display = 'inline-flex'; 
        }
    } catch (e) {
        console.error(' Ошибка:', e);
    }
});