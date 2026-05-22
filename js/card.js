const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    const emptyCartEl = document.getElementById('emptyCart');
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');

    try {

        const cartRes = await fetch(`${API_URL}/cart`);
        let cart = await cartRes.json();

        console.log('Корзина:', cart);
        console.log('Длина корзины:', cart.length);

        updateCartCount(cart);

        if (cart.length === 0) {

            emptyCartEl.style.display = 'flex';
            cartItemsEl.style.display = 'none';
            console.log('Показываем пустую корзину');
        } else {

            emptyCartEl.style.display = 'none';
            cartItemsEl.style.display = 'block';
            renderCartItems(cart);
            console.log('Показываем товары из корзины');
        }

    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
});

// Отрисовка товаров в корзине
function renderCartItems(cart) {
    const cartItemsEl = document.getElementById('cartItems');
    
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus" data-id="${item.id}">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}">🗑️</button>
        </div>
    `).join('');

    // Добавляем обработчики
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
    });
}

// Обновление количества
async function updateQuantity(productId, change) {
    const cartRes = await fetch(`${API_URL}/cart`);
    let cart = await cartRes.json();

    const item = cart.find(item => item.id === parseInt(productId));
    if (!item) return;

    item.quantity += change;

    // Удаляем, если количество 0 или меньше
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== item.id);
    }

    await fetch(`${API_URL}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    });

    location.reload();
}

async function removeFromCart(productId) {
    const cartRes = await fetch(`${API_URL}/cart`);
    let cart = await cartRes.json();

    cart = cart.filter(item => item.id !== parseInt(productId));

    await fetch(`${API_URL}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    });

    location.reload();
}

function updateCartCount(cart) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = `Cart(${total})`;
    }
}
