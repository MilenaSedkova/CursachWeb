let activeCategory = 'all';
// ИДЕАЛЬНАЯ ВЕРСИЯ: Возвращаем правильную обертку для тега
// ВОЗВРАТ К ОРИГИНАЛЬНОЙ ВЕРСТКЕ (БЕЗ ЛОМАЮЩИХ ДИВОВ)
// ==========================================
// 1. ФУНКЦИЯ СТРОГО ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
// ==========================================
function createHomeCard(product, withCartBtn = true) {
    const oldPriceHtml = product.oldPrice ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` : '';
    const extraClass = product.customClass ? product.customClass : '';
    const productName = product.name || 'Organic Product';
    
    return `
        <div class="prod-card ${extraClass}" data-id="${product.id}">
            
            <div class="prod-tags" style="padding-top: 20px; padding-left: 5px;">
                <span class="prod-tag">${product.category || 'Product'}</span>
            </div>
            
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${productName}" loading="lazy">
            </div>
            
            <div class="prod-info">
                <h3 class="prod-name">${productName}</h3>
                <div class="prod-price-row">
                    ${oldPriceHtml}
                    <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                    <div class="prod-stars">
                        <img src="/pictures/HomepageImages/Star.svg" alt="rating">
                    </div>
                </div>
            </div>

            ${withCartBtn ? `
            <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add to cart">
                <img src="/pictures/HomepageImages/Cart Icon.svg" alt="cart">
            </button>` : ''}
        </div>
    `;
}

// ==========================================
// 2. ФУНКЦИЯ СТРОГО ДЛЯ МАГАЗИНА (SHOP)
// ==========================================
function createShopCard(product, withCartBtn = true) {
    const oldPriceHtml = product.oldPrice ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` : '';
    const extraClass = product.customClass ? product.customClass : '';
    const productName = product.name || 'Organic Product';
    
    return `
        <div class="prod-card ${extraClass}" data-id="${product.id}">
            
            <span class="prod-tag">${product.category || 'Product'}</span>
            
            ${withCartBtn ? `
            <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add to cart">
                <img src="/pictures/HomepageImages/Cart Icon.svg" alt="cart">
            </button>` : ''}

            <button class="calc-calories-btn" data-name="${productName}" data-calories="${product.calories || 100}" data-unit="${product.unit || 'units'}" title="Calculate Calories">
                kcal
            </button>
            
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${productName}" loading="lazy">
            </div>
            
            <div class="prod-info">
                <h3 class="prod-name">${productName}</h3>
                <div class="prod-price-row">
                    ${oldPriceHtml}
                    <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                    <div class="prod-stars">
                        <img src="/pictures/HomepageImages/Star.svg" alt="rating">
                    </div>
                </div>
            </div>

            <button class="btn-open-review" data-id="${product.id}">Review</button>
        </div>
    `;
}

// ==========================================
// 3. ГЛАВНЫЙ РАСПРЕДЕЛИТЕЛЬ
// ==========================================
function createProductCard(product, withCartBtn = true) {
    // Узнаем, где мы находимся
    const isShopPage = window.location.pathname.toLowerCase().includes('shop');
    
    // Вызываем нужную функцию в зависимости от страницы
    if (isShopPage) {
        return createShopCard(product, withCartBtn);
    } else {
        return createHomeCard(product, withCartBtn);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortPriceBtn');
    const resetBtn = document.getElementById('resetSortBtn');
    const categorySelect = document.getElementById('shopCategorySelect'); //Перенесли сюда
    
    const itemsPerPage = 12;
    let currentPage = 1;
    let sortDirection = 'asc';
    let originalProducts = [];
    let currentProducts = [];
    
    try {
        const response = await fetch('/data/db.json');
        const data = await response.json();
        originalProducts = data.products;
        currentProducts = [...originalProducts];
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return;
    }
    
    function renderPage() {
        if (!gridElement) return;

        // 1. Фильтруем массив по выбранной категории
        let filteredProducts = currentProducts;
        if (activeCategory !== 'all') {
            filteredProducts = currentProducts.filter(product => {
                return (product.category || '').toLowerCase() === activeCategory.toLowerCase();
            });
        }

        // 2. Берем нужный срез для текущей страницы
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = filteredProducts.slice(start, end);
        
        gridElement.innerHTML = productsToShow.map(product => createProductCard(product, true)).join('');

        if (typeof applyLanguage === 'function') applyLanguage();
        
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = end >= filteredProducts.length;
        
        if (sortBtn) {
            const arrow = sortBtn.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        }
    }

    // Слушатель изменения категорий (теперь он видит renderPage!)
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            activeCategory = e.target.value; 
            currentPage = 1;                  
            renderPage();                     
        });
    }

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
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentProducts = [...originalProducts];
            sortDirection = 'asc'; 
            currentPage = 1;
            activeCategory = 'all'; // 👈 Сбрасываем категорию при общем сбросе
            if (categorySelect) categorySelect.value = 'all'; // Сбрасываем визуально селект
            renderPage();
        });
    }
    
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
    if (typeof updateHeaderCartCount === 'function') updateHeaderCartCount();
});

// Глобальный обработчик кликов по кнопкам корзины
document.addEventListener('click', async (e) => {
    const cartBtn = e.target.closest('.add-to-cart-btn');
    
    if (cartBtn && cartBtn.dataset.id) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = parseInt(cartBtn.dataset.id);
        console.log('🖱️ Клик по корзине, ID:', productId);
        
        // Визуальный эффект
        cartBtn.style.transform = 'scale(0.9)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 150);
        
        // Вызов функции добавления
        await addToCart(productId);
    }
});

function getModalTxt(enText) {
    const currentLang = localStorage.getItem('language') || document.documentElement.lang || 'en';
    const dict = window.AppI18n ? window.AppI18n.dictionary : undefined;
    if (currentLang === 'ru' && dict && dict[enText]) {
        return dict[enText];
    }
    return enText;
}

function openAuthModal() {
    let modal = document.getElementById('authAlertModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'authAlertModal';
        modal.className = 'app-modal-overlay';
        modal.innerHTML = `
            <div class="app-modal">
                <div class="app-modal-header">
                    <h3 class="app-modal-title">${getModalTxt('Authorization')}</h3>
                    <button class="app-modal-close" onclick="closeAuthModalOnly()">&times;</button>
                </div>
                <div class="app-modal-body">
                    <p style="font-size: 16px; margin-bottom: 25px; color: #1F263E;">
                        ${getModalTxt('Please log in to view your cart')}
                    </p>
                    <div style="display: flex; justify-content: flex-end; gap: 12px; align-items: center;">
                        <button class="control-btn" onclick="closeAuthModalOnly()">
                            ${getModalTxt('Close')}
                        </button>
                        <a href="/html/Login.html" class="btn-primary" style="text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                            <span>${getModalTxt('Log in')}</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Клик по темному фону просто закрывает окно
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModalOnly();
        });
    }

    setTimeout(() => modal.classList.add('active'), 10);
}

// Новая функция: ПРОСТО закрывает окно, никуда не перемещая пользователя
function closeAuthModalOnly() {
    const modal = document.getElementById('authAlertModal');
    if (modal) {
        modal.classList.remove('active');
    }
}


function closeAuthModal() {
    const modal = document.getElementById('authAlertModal');
    if (modal) {
        modal.classList.remove('active');
    }
}


// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ В КОРЗИНУ ===
async function addToCart(productId) {
    console.log('Добавляем товар:', productId);

    // 1. ПОЛУЧАЕМ ПОЛЬЗОВАТЕЛЯ ИЗ ПАМЯТИ
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        // Вместо alert() вызываем кастомное красивое окно!
        openAuthModal();
        return; 
    }
    const user = JSON.parse(userJson);

    // 2. Ищем карточку
    const card = document.querySelector(`.prod-card[data-id="${productId}"]`);
    if (!card) {
        console.error('Карточка не найдена!');
        return;
    }

    // 3. Формируем данные для корзины
    const productData = {
        productId: parseInt(productId),
        userId: user.id,
        name: card.querySelector('.prod-name')?.textContent || 'Product',
        price: parseFloat(card.querySelector('.prod-price-new')?.textContent.replace('$', '')) || 0,
        image: card.querySelector('.prod-image-wrapper img')?.src || '',
        category: card.querySelector('.prod-tag')?.textContent || '',
        quantity: 1
    };

    try {
        // 4. ИЩЕМ ТТОВАРЫ ТОЛЬКО ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
        const res = await fetch(`http://localhost:3000/cartItems?userId=${user.id}`);
        let cartItems = await res.json();
        if (!Array.isArray(cartItems)) cartItems = [];

        // Проверяем, есть ли уже этот товар в корзине ЭТОГО пользователя
        const existing = cartItems.find(item => item.productId === productData.productId);

        if (existing) {
            await fetch(`http://localhost:3000/cartItems/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: existing.quantity + 1 })
            });
        } else {
            await fetch('http://localhost:3000/cartItems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (typeof window.updateHeaderCartCount === 'function') {
            await window.updateHeaderCartCount();
        }

        if (typeof showNotification === 'function') {
            showNotification(`${productData.name} добавлен в корзину`);
        }

    } catch (error) {
        console.error('Ошибка:', error);
    }
}
function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #669C61;
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        z-index: 10000;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

document.addEventListener('click', async (e) => {
    // Проверяем клик по кнопке отзыва
    if (e.target.classList.contains('btn-open-review')) {
        const productId = e.target.getAttribute('data-id');
        const userJson = localStorage.getItem('currentUser');
        
        const modal = document.getElementById('reviewModal');
        const reviewForm = document.getElementById('leaveReviewForm');
        const statusEl = document.getElementById('reviewSubmitStatus');

        if (!modal || !reviewForm || !statusEl) return;

        // Открываем модальное окно
        modal.style.display = 'flex';
        // По умолчанию показываем форму и очищаем старые сообщения
        reviewForm.style.display = 'block';
        statusEl.className = 'form-status-message';
        statusEl.textContent = '';

        // 1. ПРОВЕРКА: Авторизован ли пользователь?
        if (!userJson) {
            reviewForm.style.display = 'none'; // Прячем форму
            statusEl.textContent = 'Only logged-in customers can leave a review. Please log in to your account.';
            statusEl.className = 'form-status-message error'; // Показываем красную плашку ошибки

            if (typeof applyLanguage === 'function') applyLanguage();
            return;
        }

        const user = JSON.parse(userJson);

        try {
            // 1. Запрашиваем заказы с сервера строго для текущего юзера
            const res = await fetch(`${API_URL}/orders?userId=${user.id}`);
            const orders = await res.json();

            // 2. Идеально точная проверка под твою структуру базы данных
            const hasPurchased = orders.some(order => {
                return order.items && Array.isArray(order.items) && order.items.some(item => {
                    // Сравниваем строго productId товара из заказа с productId кнопки
                    return item.productId && item.productId.toString() === productId.toString();
                });
            });

            // Если товар так и не найден в покупках этого аккаунта
            if (!hasPurchased) {
                reviewForm.style.display = 'none'; // Скрываем форму ввода
                statusEl.textContent = 'Oops, You can only leave a review for products you have actually purchased.';
                statusEl.className = 'form-status-message error'; // Показываем ошибку в модалке
                return;
            }

            // Если всё супер — передаем ID товара в скрытое поле и открываем форму
            document.getElementById('reviewProductId').value = productId;
            setupModalValidation(user.id);

        } catch (error) {
            console.error('Purchase check error:', error);
            reviewForm.style.display = 'none';
            statusEl.textContent = ' Error checking purchase history. Try again later.';
            statusEl.className = 'form-status-message error';
        }
    }

    // Закрытие модального окна по крестику
    if (e.target.id === 'closeReviewModal') {
        document.getElementById('reviewModal').style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('calorieModal');
    const closeBtn = document.getElementById('closeCalorieModal');
    const input = document.getElementById('dailyCalorieInput');
    const resultSpan = document.getElementById('calcResult');
    const grid = document.getElementById('productsGrid');
    
    // Новые элементы продвинутого калькулятора
    const togglePanelBtn = document.getElementById('toggleMacroCalc');
    const macroPanel = document.getElementById('macroCalcPanel');
    const genderSel = document.getElementById('calcGender');
    const ageInp = document.getElementById('calcAge');
    const weightInp = document.getElementById('calcWeight');
    const heightInp = document.getElementById('calcHeight');
    const activitySel = document.getElementById('calcActivity');
    
    let currentCalories = 0;

    // 1. Открытие модалки при клике по кнопке "kcal" на товаре
    if (grid) {
        grid.addEventListener('click', (e) => {
            const calcBtn = e.target.closest('.calc-calories-btn');
            if (calcBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const name = calcBtn.dataset.name;
                currentCalories = parseInt(calcBtn.dataset.calories) || 100;

                const productUnit = calcBtn.dataset.unit || 'units'; 
    
                document.getElementById('calcProductName').textContent = name;
                document.getElementById('calcProductCalories').textContent = currentCalories
                
                document.getElementById('calcProductName').textContent = name;
                document.getElementById('calcProductCalories').textContent = currentCalories;
                
                resultSpan.dataset.unit = productUnit;
                
                calculateUnits();
                if (modal) modal.style.display = 'flex';
            }
        });
    }

    // 2. Закрытие модального окна
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // 3. Переключатель панели персонального расчёта
    if (togglePanelBtn && macroPanel) {
        togglePanelBtn.addEventListener('click', () => {
            if (macroPanel.style.display === 'none') {
                macroPanel.style.display = 'block';
                togglePanelBtn.textContent = '▲ Hide Personal Calculator';
                calculateDailyNorm(); // Считаем норму сразу при раскрытии
            } else {
                macroPanel.style.display = 'none';
                togglePanelBtn.textContent = '\ Calculate My Daily Goal';
            }
        });
    }

    // 4. Функция автоматического расчёта суточной нормы (Формула Миффлина - Сан Жеора)
    function calculateDailyNorm() {
        if (!macroPanel || macroPanel.style.display === 'none') return;

        const gender = genderSel.value;
        const age = parseFloat(ageInp.value) || 0;
        const weight = parseFloat(weightInp.value) || 0;
        const height = parseFloat(heightInp.value) || 0;
        const activity = parseFloat(activitySel.value) || 1.2;

        if (age > 0 && weight > 0 && height > 0) {
            // Базовый метаболизм (BMR)
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            if (gender === 'male') {
                bmr += 5;
            } else {
                bmr -= 161;
            }
            // Итоговая норма с учётом нагрузок
            const totalKcal = Math.round(bmr * activity);
            
            // Записываем результат в главный инпут целей
            input.value = totalKcal;
            calculateUnits();
        }
    }

    // Вешаем пересчёт нормы при изменении любого фитнес-параметра
    [genderSel, ageInp, weightInp, heightInp, activitySel].forEach(elem => {
        if (elem) elem.addEventListener('input', calculateDailyNorm);
    });

    // 5. Функция финального подсчёта количества штук/упаковок продукта
    function calculateUnits() {
        if (!input || !resultSpan) return;
        const goal = parseInt(input.value) || 0;
        
        if (currentCalories > 0 && goal > 0) {
            const units = (goal / currentCalories).toFixed(1);
            resultSpan.textContent = units;
        } else {
            resultSpan.textContent = "0";
        }
    }

    // Если пользователь меняет итоговые калории вручную
    if (input) {
        input.addEventListener('input', calculateUnits);
    }
});

// Живая валидация и обработка формы внутри модального окна
function setupModalValidation(userId) {
    const reviewForm = document.getElementById('leaveReviewForm');
    const reviewText = document.getElementById('reviewText');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const reviewTextGroup = document.getElementById('reviewTextGroup');
    
    // Элементы интерактивного звездного рейтинга
    const starsContainer = document.getElementById('ratingStarsContainer');
    const hiddenRatingInput = document.getElementById('reviewRating');

    // Сбрасываем рейтинг и визуальное состояние звезд в дефолт (5 звезд) при открытии модалки
    if (hiddenRatingInput) hiddenRatingInput.value = "5";
    if (starsContainer) {
        const stars = starsContainer.querySelectorAll('.star-icon');
        stars.forEach(star => star.classList.remove('inactive'));
    }

    // Функция живой проверки текста отзыва
    function validate() {
        const isTextValid = reviewText.value.trim().length >= 10;
        
        if (reviewText.value.trim().length > 0 && !isTextValid) {
            reviewTextGroup.classList.add('error');
        } else {
            reviewTextGroup.classList.remove('error');
        }
        submitReviewBtn.disabled = !isTextValid;
    }

    // Перезаписываем событие ввода, защищая память браузера от утечек и дубликатов
    reviewText.oninput = validate;

    // ОБРАБОТКА КЛИКОВ ПО КАРТИНКАМ-ЗВЕЗДАМ
    if (starsContainer) {
        starsContainer.onclick = (e) => {
            // Проверяем, что кликнули именно по картинке звезды
            if (e.target.classList.contains('star-icon')) {
                const selectedValue = parseInt(e.target.getAttribute('data-value'));
                
                // Сохраняем выбранную цифру в скрытый инпут
                hiddenRatingInput.value = selectedValue;

                // Подсвечиваем выбранные звезды, а остальные делаем серыми через CSS-класс
                const stars = starsContainer.querySelectorAll('.star-icon');
                stars.forEach(star => {
                    const starValue = parseInt(star.getAttribute('data-value'));
                    if (starValue <= selectedValue) {
                        star.classList.remove('inactive');
                    } else {
                        star.classList.add('inactive');
                    }
                });
            }
        };
    }

    // Отправка POST запроса с отзывом на бэкенд
    reviewForm.onsubmit = async (submitEvent) => {
        submitEvent.preventDefault();

        const reviewData = {
            productId: document.getElementById('reviewProductId').value,
            userId: userId,
            text: reviewText.value.trim(),
            rating: parseInt(hiddenRatingInput.value), // Передаем цифру из нашего скрытого поля звезд
            date: new Date().toLocaleDateString()
        };

        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                const statusEl = document.getElementById('reviewSubmitStatus');
                statusEl.textContent = 'Review added successfully!';
                statusEl.className = 'form-status-message success';
                
                // Очищаем текстовые поля формы
                reviewForm.reset();
                submitReviewBtn.disabled = true;

                // Возвращаем звездам дефолтный вид после успешной отправки
                if (starsContainer) {
                    const stars = starsContainer.querySelectorAll('.star-icon');
                    stars.forEach(star => star.classList.remove('inactive'));
                }

                // Закрываем окошко через 2 секунды красоты на экране
                setTimeout(() => {
                    document.getElementById('reviewModal').style.display = 'none';
                    statusEl.className = 'form-status-message';
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to submit review:', err);
        }
    };
}


// ==========================================
// ВОССТАНОВЛЕННЫЙ КОД ДЛЯ ОФФЕРОВ И ОТЗЫВОВ
// ==========================================

const API_URL_FALLBACK = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

function createOfferVegetableCard(vegetable) {
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
                        <img src="/pictures/HomepageImages/Star.svg" alt="stars">
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadOfferVegetables() {
    try {
        const response = await fetch(`${API_URL_FALLBACK}/offerVegetables`);
        const vegetables = await response.json();
        
        const grid = document.getElementById('offerVegetablesGrid');
        if (grid) {
            grid.innerHTML = vegetables.map(createOfferVegetableCard).join('');
            if (typeof applyLanguage === 'function') applyLanguage();
        }
    } catch (error) {
        console.error('Ошибка загрузки овощей:', error);
    }
}

async function loadOfferProducts() {
    try {
        const response = await fetch(`${API_URL_FALLBACK}/offerProducts`);
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

// ========== TESTIMONIAL SECTION JS ==========
const TESTI_API = 'http://localhost:3000';
let testiCurrentIndex = 0;
let testiTotalSlides = 0;
let testiAutoPlay;

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

function createTestiStat(stat) {
    return `
        <div class="testi-stat-circle">
            <span class="testi-stat-value">${stat.value}</span>
            <span class="testi-stat-label">${stat.label}</span>
        </div>
    `;
}

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

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.testi-slider-viewport');
    if (slider) {
        slider.addEventListener('mouseenter', stopTestiAutoPlay);
        slider.addEventListener('mouseleave', startTestiAutoPlay);
    }
    
    // Запускаем отрисовку пропавших секций
    loadOfferVegetables();
    loadOfferProducts();
    loadTestimonials();
    loadTestiStats();
});