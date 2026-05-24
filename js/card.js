
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
document.addEventListener('DOMContentLoaded', async () => {
    const empty = document.getElementById('emptyCart');
    const list = document.getElementById('cartItems');
    if (!list) return;

    // 1. Проверка авторизации
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        if (empty) {
            empty.style.display = 'flex';
            empty.innerHTML = '<h2>Please, log in for viewing a card</h2><a href="/login.html" class="btn-primary">Войти</a>';
        }
        list.style.display = 'none';
        return;
    }

    const user = JSON.parse(userJson);
    
    try {
        const res = await fetch(`${API_URL}/cartItems?userId=${user.id}`);
        let items = await res.json();
        if (!Array.isArray(items)) items = [];
        
        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }
        
        if (items.length === 0) {
            if (empty) empty.style.display = 'flex';
            list.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            list.style.display = 'grid';
            list.innerHTML = items.map(createCartItemHTML).join('');
            console.log(`Корзина пользователя ${user.firstName} отрисована`);
        }
    } catch (e) {
        console.error('Ошибка:', e);
    }
});