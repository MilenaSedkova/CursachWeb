// Конфигурация
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
        return '<img src="/pictures/HomepageImages/Star.svg" alt="5 stars" class="stars-image">'
}

// Создание карточки товара (ТОЧНО ТАКАЯ ЖЕ СТРУКТУРА как в вашем HTML)
function createProductCard(product, showCart = false) {
    const extraClass = product.customClass ? ` ${product.customClass}` : '';

    //  Условная отрисовка кнопки корзины
    const cartHTML = showCart ? `
        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}">
            <img src="/pictures/HomepageImages/Cart Icon.svg" alt="Add to cart">
        </button>` : '';

    return `
        <div class="prod-card${extraClass}" data-id="${product.id}">
            <span class="prod-tag">${product.category}</span>
            ${cartHTML}
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="prod-info">
                <h3 class="prod-name">${product.name}</h3>
                <div class="prod-price-row">
                    <span class="prod-price-old">$${product.oldPrice?.toFixed(2)}</span>
                    <span class="prod-price-new">$${product.price?.toFixed(2)}</span>
                    <div class="prod-stars">
                        ${generateStars(product.rating)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Загрузка товаров
// Загрузка товаров с гарантированным поиском на стороне клиента
async function loadProducts(searchTerm = '') {
    try {
        // 1. Всегда запрашиваем чистый список товаров с сервера
        const url = `${API_URL}/products`;
        const response = await fetch(url);
        let products = await response.json();
        
        // Сохраняем полный массив в глобальную переменную (для работы корзины)
        allProducts = products;

        // 2. ГАРАНТИРОВАННАЯ ФИЛЬТРАЦИЯ НА КЛИЕНТЕ (без учета регистра)
        if (searchTerm) {
            const cleanSearch = searchTerm.trim().toLowerCase();
            products = products.filter(product => {
                return product.name && product.name.toLowerCase().includes(cleanSearch);
            });
        }
        
        if (productsGrid) {
            if (products.length > 0) {
                // Если что-то нашли — отрисовываем карточки товаров
                productsGrid.innerHTML = products.map(createProductCard).join('');
            } else {
                // Если массив пустой — выводим наше сообщение об отсутствии
                productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; font-size: 1.2rem; color: #525C60;">
                        ${typeof appSettings !== 'undefined' && appSettings.lang === 'ru' 
                            ? `Продукты по запросу "${searchTerm}" не найдены.` 
                            : `No products found for "${searchTerm}".`}
                    </div>
                `;
            }

            if (typeof applyLanguage === 'function') applyLanguage();
        }
        
        // Добавляем обработчики на кнопки "Добавить в корзину"
       if (productsGrid) {
            // Удаляем старый слушатель перед добавлением нового, чтобы они не копились
            productsGrid.onclick = null; 
            
            productsGrid.onclick = function(e) {
                // Ищем, кликнул ли пользователь на кнопку корзины или на картинку внутри неё
                const cartBtn = e.target.closest('.add-to-cart-btn');
                
                if (cartBtn) {
                    e.preventDefault();
                    e.stopPropagation(); // Жестко запрещаем клику ломать карточку
                    
                    // Берем ID товара прямо из кнопки
                    const id = parseInt(cartBtn.dataset.id);
                    if (id) {
                        addToCart(id);
                    }
                }
            };
        }
        
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


// Поиск
function handleSearch() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.trim();
    loadProducts(searchTerm);
}

// Запускаем поиск при вводе каждой буквы (Живой поиск в реальном времени)
if (searchInput) {
    searchInput.addEventListener('input', () => {
        handleSearch();
    });
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});



if (loadMoreBtn) {  // Добавь проверку!
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Загрузка дополнительных товаров...');
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    /*loadCartFromServer();*/
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

            if (typeof applyLanguage === 'function') applyLanguage();
            
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
        
        const grid = document.getElementById('offerProductsGrid'); 
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

if (typeof applyLanguage === 'function') applyLanguage();
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
    /*loadCartFromServer();*/
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

            if (typeof applyLanguage === 'function') applyLanguage();
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

            if (typeof applyLanguage === 'function') applyLanguage();
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
// 🔽 1. Сначала получаем элемент и ПРОВЕРЯЕМ его
const newsletterForm = document.getElementById('newsletterForm');

// 🔽 2. Если формы нет на странице — выходим, не выполняем код ниже
if (newsletterForm) {
    
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[name="email"]');
        const btn = this.querySelector('.newsletter-btn');
        const status = document.getElementById('newsletterStatus');

        // Простая валидация
        if (!emailInput || !emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            if (status) showStatus('Please enter a valid email address.', 'error');
            else alert('Please enter a valid email address.');
            return;
        }

        const email = emailInput.value.trim();

        // Состояние загрузки
        if (btn) {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
        }
        if (status) status.textContent = '';

        try {
            await fetch('http://localhost:3000/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    subscribedAt: new Date().toISOString() 
                })
            });

            if (status) {
                showStatus('Thanks! You\'re successfully subscribed.', 'success');
            } else {
                alert('Thanks! You\'re successfully subscribed.');
            }
            if (emailInput) emailInput.value = '';
            
        } catch (error) {
            if (status) {
                showStatus('Something went wrong. Please try again.', 'error');
            } else {
                alert('Something went wrong. Please try again.');
            }
            console.error('Newsletter error:', error);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    });
    
} else {
    // 🔽 Форма не найдена — это нормально, просто выходим
    console.log('Форма newsletter не найдена на этой странице (это нормально)');
}

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


// ============================================
// SHOP API - Методы для работы с товарами
// ============================================

class ShopAPI {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 8;
        this.sortAscending = true;
    }

    // Загрузка данных из JSON
    async fetchProducts() {
        try {
            const response = await fetch(this.dbPath);
            const data = await response.json();
            this.products = data.products;
            return this.products;
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            return [];
        }
    }

    // Сортировка товаров по цене
    sortProducts() {
        return [...this.products].sort((a, b) => {
            return this.sortAscending ? a.price - b.price : b.price - a.price;
        });
    }

    // Переключение порядка сортировки
    toggleSortOrder() {
        this.sortAscending = !this.sortAscending;
        return this.sortAscending;
    }

    // Получение товаров для текущей страницы
    getPaginatedProducts() {
        const sorted = this.sortProducts();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return sorted.slice(start, end);
    }

    // Переход на следующую страницу
    nextPage() {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    // Переход на предыдущую страницу
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    // Проверка, есть ли следующая страница
    hasNextPage() {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        return this.currentPage < totalPages;
    }

    // Проверка, есть ли предыдущая страница
    hasPrevPage() {
        return this.currentPage > 1;
    }

    // Сброс на первую страницу
    resetPage() {
        this.currentPage = 1;
    }
}

// ============================================
// ОТРИСОВКА ТОВАРОВ
// ============================================

// ============================================
// ОТРИСОВКА ТОВАРОВ (ИСПРАВЛЕННАЯ СИНХРОННАЯ ВЕРСИЯ)
// ============================================

class ShopRenderer {
    constructor(api, gridElement, prevBtn, nextBtn, sortBtn) {
        this.api = api;
        this.gridElement = gridElement;
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.sortBtn = sortBtn;
    }

    // Создание HTML карточки товара (СИНХРОНИЗИРОВАНО ПО КЛАССАМ И КНОПКАМ)
    createCardHTML(product) {
    // Подстраховка на случай, если id равен 0 или не пришел
    const productId = product.id !== undefined ? product.id : 1;
    const productName = product.name || 'Organic Product';

    return `
        <div class="product-card prod-card" data-id="${productId}">
            <div class="card-top">
                <span class="card-tag prod-tag">${product.category || 'Organic'}</span>
                
                <button class="add-to-cart-btn" data-id="${productId}" data-name="${productName}" style="background: none; border: none; padding: 0; cursor: pointer; display: block !important;">
                    <div class="cart-icon-small">
                        <img src="/pictures/HomepageImages/Cart Icon.svg" alt="Add to cart">
                    </div>
                </button>
            </div>
            <div class="card-image-box">
                <img src="${product.image}" alt="${productName}">
            </div>
            <div class="card-info">
                <h3 class="card-title prod-name">${productName}</h3>
                <div class="card-price prod-price-row">
                    <span class="price-old prod-price-old">$${product.oldPrice ? product.oldPrice.toFixed(2) : '0.00'}</span>
                    <span class="price-new prod-price-new">$${product.price ? product.price.toFixed(2) : '0.00'}</span>
                </div>
                <div class="card-stars prod-stars">
                    <img src="/pictures/HomepageImages/Star.svg" alt="5 stars" class="stars-image">
                </div>
            </div>
        </div>
    `;
}

    render() {
        if (!this.gridElement) {
            console.log('gridElement не найден, пропускаем отрисовку');
            return;
        }

        const products = this.api.getPaginatedProducts();
        this.gridElement.innerHTML = products.map(product => this.createCardHTML(product)).join('');

        if (typeof applyLanguage === 'function') applyLanguage();
        
        // Обновление состояния кнопок пагинации
        if (this.prevBtn) this.prevBtn.disabled = !this.api.hasPrevPage();
        if (this.nextBtn) this.nextBtn.disabled = !this.api.hasNextPage();
        
        if (this.sortBtn) {
            const arrow = this.sortBtn.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = this.api.sortAscending 
                    ? "Sort by price (Low-High)" 
                    : "Sort by price (High-Low)";
            }
        }
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ И КОРЗИНЫ ДЛЯ КЛАССОВ
document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortBtn');

    const shopAPI = new ShopAPI('/data/db.json');
    await shopAPI.fetchProducts();

    // Сохраняем продукты в общую переменную, чтобы функция addToCart() видела их при клике
    if (shopAPI.products && shopAPI.products.length > 0) {
        allProducts = shopAPI.products;
    }

    const renderer = new ShopRenderer(shopAPI, gridElement, prevBtn, nextBtn, sortBtn);
    renderer.render();

    // Навешиваем безопасный делегированный клик на корзину для новой разметки пагинации
    if (gridElement) {
        gridElement.addEventListener('click', function(e) {
            const cartBtn = e.target.closest('.add-to-cart-btn');
            if (cartBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const id = parseInt(cartBtn.dataset.id, 10);
                if (id) {
                    addToCart(id);
                }
            }
        });
    }

    // Обработчики событий для кнопок пагинации
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (shopAPI.prevPage()) {
                renderer.render();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (shopAPI.nextPage()) {
                renderer.render();
            }
        });
    }   
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            shopAPI.toggleSortOrder();
            shopAPI.resetPage();
            renderer.render();
        });
    }
});