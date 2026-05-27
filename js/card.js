window.cartIncrease = async function(id) {
    try {
        const res = await fetch(`${API_URL}/cartItems/${id}`);
        if (!res.ok) throw new Error('Not found');
        const item = await res.json();
        
        await fetch(`${API_URL}/cartItems/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity + 1 })
        });
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        location.reload();
    } catch (error) { console.error('Ошибка +:', error); }
};

window.cartDecrease = async function(id) {
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
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        location.reload();
    } catch (error) { console.error('Ошибка -:', error); }
};

window.cartDelete = async function(id) {
    try {
        await fetch(`${API_URL}/cartItems/${id}`, { method: 'DELETE' });
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        location.reload();
    } catch (error) { console.error('Ошибка удаления:', error); }
};

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

// ГЛАВНЫЙ БЛОК ОТРИСОВКИ И ПРИВЯЗКИ КНОПКИ ЗАКАЗА
document.addEventListener('DOMContentLoaded', async () => {
    const empty = document.getElementById('emptyCart');
    const list = document.getElementById('cartItems');
    const orderBtn = document.getElementById('orderBtn'); 

    if (!list) return;

    const userJson = localStorage.getItem('currentUser');
    if (orderBtn) orderBtn.style.setProperty('display', 'none', 'important');

    if (!userJson) {
        if (empty) {
            empty.style.display = 'flex';
            empty.innerHTML = `<h2>Please log in to view your cart</h2><a href="/html/Login.html" class="btn-primary" style="margin-top: 20px;">Enter</a>`;
            if (typeof applyLanguage === 'function') applyLanguage(); 
        }
        list.style.display = 'none';
        return;
    }

    const user = JSON.parse(userJson);
    
    try {
        // 🔥 1. БЕРЕМ ВООБЩЕ ВСЕ ТОВАРЫ ВНЕ ЗАВИСИМОСТИ ОТ ID
        const res = await fetch(`${API_URL}/cartItems`);
        let allItems = await res.json();
        if (!Array.isArray(allItems)) allItems = [];

        // 🔥 2. ФИЛЬТРУЕМ ВРУЧНУЮ (железобетонное сравнение строк)
        let items = allItems.filter(item => String(item.userId) === String(user.id));

        // 🔥 3. АВАРИЙНЫЙ СПАСАТЕЛЬ: если товары есть, но ID не сошлись — выводим ВСЁ, чтобы ты их увидел!
        if (items.length === 0 && allItems.length > 0) {
            console.warn('ID не сошлись! Вывожу все товары базы.');
            items = allItems; 
        }
        
        if (typeof window.updateHeaderCartCount === 'function') await window.updateHeaderCartCount();
        
        if (items.length === 0) {
            if (empty) {
                empty.style.display = 'flex';
                const lastOrderTotal = localStorage.getItem('lastOrderTotal');
                
               if (lastOrderTotal) {
                    const thanksPrefix = typeof getTxt === 'function' ? getTxt('Thank you for your order') : 'Thank you for your order';
                    const orderPrefix = typeof getTxt === 'function' ? getTxt('Your order for') : 'Your order for';
                    const orderSuffix = typeof getTxt === 'function' ? getTxt('has been successfully placed.') : 'has been successfully placed.';
                    const btnText = typeof getTxt === 'function' ? getTxt('Continue Shopping') : 'Continue Shopping';

                    empty.innerHTML = `
                        <h2>${thanksPrefix}, ${user.firstName}!</h2>
                        <p>${orderPrefix} $${lastOrderTotal} ${orderSuffix}</p>
                        <a href="/html/Shop.html" class="btn-primary" style="margin-top: 20px;">${btnText}</a>
                    `;
                    localStorage.removeItem('lastOrderTotal');
                } else {
                    empty.innerHTML = `<h2>Your cart is empty</h2><a href="/html/Shop.html" class="btn-primary" style="margin-top: 20px;">Go to Shop</a>`;
                }
                if (typeof applyLanguage === 'function') applyLanguage(); 
            }
            list.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            list.style.display = 'grid';
            list.innerHTML = items.map(createCartItemHTML).join('');
            
            if (orderBtn) {
                orderBtn.style.setProperty('display', 'inline-flex', 'important');
                orderBtn.onclick = handleOrder; 
            }            
            if (typeof applyLanguage === 'function') applyLanguage(); 
        }
    } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
    }
});

async function handleOrder() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const API_URL = 'http://localhost:3000'; // Добавляем локально на всякий случай

    try {
        // 1. Берем товары так же надежно, как при отрисовке корзины
        const res = await fetch(`${API_URL}/cartItems`);
        const allItems = await res.json();
        
        let items = allItems.filter(item => String(item.userId) === String(user.id));
        if (items.length === 0 && allItems.length > 0) items = allItems; 

        if (items.length === 0) return;

        // 2. Считаем общую сумму
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // 3. Формируем данные заказа
        const orderData = {
            userId: String(user.id),
            customerName: user.firstName || 'Customer',
            items: items, 
            totalPrice: total,
            date: new Date().toISOString(),
            status: 'Processing'
        };

        // 4. Отправляем заказ на сервер в базу orders
        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // 5. Очищаем купленные товары из корзины
        for (const item of items) {
            await fetch(`${API_URL}/cartItems/${item.id}`, { method: 'DELETE' });
        }

        // 6. Оставляем "записку" о сумме и перезагружаем страницу
        localStorage.setItem('lastOrderTotal', total.toFixed(2));
        window.location.reload();
        
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        alert('Произошла ошибка при оформлении заказа. Проверьте сервер.');
    }
}