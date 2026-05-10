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



// Создание карточки для Offer секции (ИДЕНТИЧНАЯ структура)
function createOfferVegetableCard(vegetable) {
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
    loadProducts();
    loadOfferVegetables(); // Загружаем Offer секцию
    loadCartFromServer();
});

// Переменная для текущего слайда
let currentTestimonialIndex = 0;
let testimonialCount = 0;

// Создание карточки отзыва
function createTestimonialCard(testimonial) {
    return `
        <div class="testimonial-card">
            <div class="testimonial-avatar">
                <img src="${testimonial.avatar}" alt="${testimonial.name}">
            </div>
            <div class="testimonial-stars">
                <img src="${testimonial.starsImage}" alt="5 stars">
                <img src="${testimonial.starsImage}" alt="5 stars">
                <img src="${testimonial.starsImage}" alt="5 stars">
                <img src="${testimonial.starsImage}" alt="5 stars">
                <img src="${testimonial.starsImage}" alt="5 stars">
            </div>
            <p class="testimonial-text">${testimonial.text}</p>
            <h4 class="testimonial-author-name">${testimonial.name}</h4>
            <p class="testimonial-author-role">${testimonial.role}</p>
        </div>
    `;
}

// Создание кружка статистики
function createStatCircle(stat) {
    return `
        <div class="stat-circle">
            <h3 class="stat-value">${stat.value}</h3>
            <p class="stat-label">${stat.label}</p>
        </div>
    `;
}

// Создание точек навигации
function createDots(count) {
    const dotsContainer = document.getElementById('testimonialDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = `testimonial-dot ${i === 0 ? 'active' : ''}`;
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Переключение на конкретный слайд
function goToSlide(index) {
    currentTestimonialIndex = index;
    const track = document.getElementById('testimonialTrack');
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // Обновляем активную точку
    document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Автопрокрутка
let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        let nextIndex = (currentTestimonialIndex + 1) % testimonialCount;
        goToSlide(nextIndex);
    }, 5000); // Каждые 5 секунд
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Загрузка отзывов
async function loadTestimonials() {
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();
        
        testimonialCount = testimonials.length;
        
        const track = document.getElementById('testimonialTrack');
        track.innerHTML = testimonials.map(createTestimonialCard).join('');
        
        // Создаём точки навигации
        createDots(testimonialCount);
        
        // Запускаем автопрокрутку
        startAutoSlide();
        
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        const statsContainer = document.getElementById('testimonialStats');
        statsContainer.innerHTML = stats.map(createStatCircle).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Пауза автопрокрутки при наведении
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }
});

// Инициализация (обнови существующий DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadOfferVegetables();
    loadTestimonials();
    loadStats();
    loadCartFromServer();
});