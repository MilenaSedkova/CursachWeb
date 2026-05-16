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
        
        if (productsGrid) {
            productsGrid.innerHTML = products.map(createProductCard).join('');
        }
        
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

if (loadMoreBtn) {  // 👈 Добавь проверку!
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Загрузка дополнительных товаров...');
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromServer();
});



function createOfferVegetableCard(vegetable) {
    // 1. Если цены НЕТ (товары 5-8) -> рисуем простую карточку для секции "What We Offer"
    if (!vegetable.price) {
        return `
            <div class="offer-card-simple">
                <div class="offer-img-box">
                    <img src="${vegetable.image}" alt="${vegetable.name}">
                </div>
                <h3 class="offer-card-name">${vegetable.name}</h3>
                <p class="offer-card-cat">${vegetable.category}</p>
            </div>
        `;
    }

    // 2. Если цена ЕСТЬ (товары 1-4) -> рисуем полную карточку с ценой
    return `
        <div class="prod-card" data-id="${vegetable.id}">
            <span class="prod-tag">${vegetable.category}</span>
            <div class="prod-image-wrapper">
                <img src="${vegetable.image}" alt="${vegetable.name}">
            </div>
            <div class="prod-info">
                <h3 class="prod-name">${vegetable.name}</h3>
                <div class="prod-price-row">
                    <span class="prod-price-old">$${vegetable.oldPrice.toFixed(2)}</span>
                    <span class="prod-price-new">$${vegetable.price.toFixed(2)}</span>
                    <div class="prod-stars">
                        ${generateStars(vegetable.rating)}
                    </div>
                </div>
            </div>
        </div>
    `;
}
// Загрузка из JSON файла

// Загрузка овощей из Offer секции
async function loadOfferVegetables() {
    try {
        const response = await fetch(`${API_URL}/offerVegetables`);
        const vegetables = await response.json();
        
        const grid = document.getElementById('offerVegetablesGrid');
        if (grid) {
            grid.innerHTML = vegetables.map(createOfferVegetableCard).join('');
            
            // Добавляем обработчики кликов (как в основных товарах)
            document.querySelectorAll('.offer-vegetables-grid .prod-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = parseInt(card.dataset.id);
                    addToCartFromOffer(id);
                });
                card.style.cursor = 'pointer';
            });
        }
        
    } catch (error) {
        console.error('Ошибка загрузки овощей:', error);
    }
}

// Загрузка offerProducts (БЕЗ цен) - для секции "What We Offer for You"
async function loadOfferProducts() {
    try {
        const response = await fetch(`${API_URL}/offerProducts`);
        const products = await response.json();
        
        const grid = document.getElementById('offerProductsGrid'); // 👈 НОВЫЙ ID в HTML
        if (grid) {
           grid.innerHTML = products.map(product => `
    <div class="offer-wrapper">
        <div class="offer-card-simple">
            <div class="offer-img-box">
                <img src="${product.image}" alt="${product.name}">
            </div>
        </div>
        <h3 class="offer-card-name">${product.name}</h3>
        <p class="offer-card-cat">${product.category}</p>
    </div>
`).join('');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

// Добавление в корзину из Offer секции
async function addToCartFromOffer(productId) {
    // Ищем в offerVegetables
    try {
        const response = await fetch(`${API_URL}/offerVegetables`);
        const offerVegetables = await response.json();
        const product = offerVegetables.find(v => v.id === productId);
        
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
        
    } catch (error) {
        console.error('Ошибка добавления товара:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();              // Основные товары
    loadOfferVegetables();       // Товары С ценами (в другой секции)
    loadOfferProducts();         // Товары БЕЗ цен (What We Offer)
    loadCartFromServer();
});

// ========== TESTIMONIAL SECTION JS ==========
const TESTI_API = 'http://localhost:3000';
let testiCurrentIndex = 0;
let testiTotalSlides = 0;
let testiAutoPlay;

// Создание карточки отзыва (под новые классы)
function createTestiCard(item) {
    return `
        <div class="testi-slide">
            <div class="testi-avatar">
                <img src="${item.avatar}" alt="${item.name}">
            </div>
            <div class="testi-stars">
                <img src="${item.starsImage}" alt="5 stars">
            </div>
            <p class="testi-text">${item.text}</p>
            <h4 class="testi-name">${item.name}</h4>
            <p class="testi-role">${item.role}</p>
        </div>
    `;
}

// Создание кружка статистики
function createTestiStat(stat) {
    return `
        <div class="testi-stat-circle">
            <span class="testi-stat-value">${stat.value}</span>
            <span class="testi-stat-label">${stat.label}</span>
        </div>
    `;
}

// Создание точек навигации
function createTestiDots(count) {
    const container = document.getElementById('testiDots');
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = `testi-dot ${i === 0 ? 'is-active' : ''}`;
        dot.addEventListener('click', () => goToTestiSlide(i));
        container.appendChild(dot);
    }
}

// Переключение слайда
function goToTestiSlide(index) {
    testiCurrentIndex = index;
    const track = document.getElementById('testiSliderTrack');
    if (track) {
        track.style.transform = `translateX(-${index * 100}%)`;
    }
    
    document.querySelectorAll('.testi-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
    });
}

// Автопрокрутка
function startTestiAutoPlay() {
    clearInterval(testiAutoPlay);
    testiAutoPlay = setInterval(() => {
        if (testiTotalSlides > 0) {
            const next = (testiCurrentIndex + 1) % testiTotalSlides;
            goToTestiSlide(next);
        }
    }, 5000);
}

function stopTestiAutoPlay() {
    clearInterval(testiAutoPlay);
}

// Загрузка отзывов
async function loadTestimonials() {
    try {
        const res = await fetch(`${TESTI_API}/testimonials`);
        const data = await res.json();
        testiTotalSlides = data.length;
        
        const track = document.getElementById('testiSliderTrack');
        if (track) {
            track.innerHTML = data.map(createTestiCard).join('');
        }
        
        createTestiDots(testiTotalSlides);
        startTestiAutoPlay();
        
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

// Загрузка статистики
async function loadTestiStats() {
    try {
        const res = await fetch(`${TESTI_API}/stats`);
        const data = await res.json();
        
        const container = document.getElementById('testiStatsRow');
        if (container) {
            container.innerHTML = data.map(createTestiStat).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Пауза при наведении
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.testi-slider-viewport');
    if (slider) {
        slider.addEventListener('mouseenter', stopTestiAutoPlay);
        slider.addEventListener('mouseleave', startTestiAutoPlay);
    }
});

// Инициализация (добавьте к существующему DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
    loadTestiStats();
});

// ========== NEWSLETTER FORM HANDLER ==========
document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Отменяем стандартную отправку формы
    
    const emailInput = this.querySelector('input[name="email"]');
    const email = emailInput.value.trim();
    const btn = this.querySelector('.newsletter-btn');
    const status = document.getElementById('newsletterStatus');

    // Простая валидация
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
    }

    // Состояние загрузки
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';

    try {
        // 🔹 ВАРИАНТ 1: Отправка на json-server (для демо)
        await fetch('http://localhost:3000/subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                subscribedAt: new Date().toISOString() 
            })
        });

        // 🔹 ВАРИАНТ 2: Раскомментируй для реальной отправки (см. ниже)
        // await sendToRealService(email);

        // Успех
        showStatus('Thanks! You\'re successfully subscribed.', 'success');
        emailInput.value = ''; // Очистить поле
        
    } catch (error) {
        showStatus('Something went wrong. Please try again.', 'error');
        console.error('Newsletter error:', error);
    } finally {
        // Вернуть кнопку в исходное состояние
        btn.disabled = false;
        btn.textContent = 'Subscribe';
    }
});

// Вспомогательная функция для показа статуса
function showStatus(message, type) {
    const status = document.getElementById('newsletterStatus');
    status.textContent = message;
    status.className = `newsletter-status ${type}`;
    
    // Автоматически скрыть через 4 секунды
    setTimeout(() => {
        status.textContent = '';
        status.className = 'newsletter-status';
    }, 4000);
}