// Конфигурация
const API_URL = 'http://localhost:3000';
let cart = [];
let allProducts = [];

// DOM элементы
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Генерация звёзд рейтинга
function generateStars(rating) {
        return '<img src="pictures/HomepageImages/Star.svg" alt="5 stars" class="stars-image">'
}

// Создание карточки товара (ТОЧНО ТАКАЯ ЖЕ СТРУКТУРА как в вашем HTML)
function createProductCard(product) {
    return `
        <div class="prod-card" data-id="${product.id}">
            <span class="prod-tag">${product.category}</span>
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="prod-info">
                <h3 class="prod-name">${product.name}</h3>
                <div class="prod-price-row">
                    <span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>
                    <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                    <div class="prod-stars">
                        ${generateStars(product.rating)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Загрузка товаров
async function loadProducts(searchTerm = '') {
    try {
        let url = `${API_URL}/products`;
        if (searchTerm) {
            url += `?name_like=${searchTerm}`;
        }
        
        const response = await fetch(url);
        const products = await response.json();
        allProducts = products;
        
        productsGrid.innerHTML = products.map(createProductCard).join('');
        
        // Добавляем обработчики на кнопки "Добавить в корзину"
        document.querySelectorAll('.prod-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                addToCart(id);
            });
            card.style.cursor = 'pointer';
        });
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

// Добавление в корзину
async function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    await saveCartToServer();
    
    // Визуальная обратная связь
    alert(`${product.name} добавлен в корзину!`);
}

// Обновление счётчика корзины
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `Cart(${totalItems})`;
}

// Сохранение корзины на сервер
async function saveCartToServer() {
    try {
        await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cart)
        });
    } catch (error) {
        console.error('Ошибка сохранения корзины:', error);
    }
}

// Загрузка корзины с сервера
async function loadCartFromServer() {
    try {
        const response = await fetch(`${API_URL}/cart`);
        const data = await response.json();
        if (data && data.length > 0) {
            cart = data;
            updateCartCount();
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

// Поиск
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    loadProducts(searchTerm);
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

cartBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста');
    } else {
        const cartItems = cart.map(item => 
            `${item.name} - $${item.price} x ${item.quantity}`
        ).join('\n');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Корзина:\n\n${cartItems}\n\nИтого: $${total.toFixed(2)}`);
    }
});

loadMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Загрузка дополнительных товаров...');
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromServer();
});