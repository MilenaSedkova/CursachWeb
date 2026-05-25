function createProductCard(product, withCartBtn = true) {
    const oldPriceHtml = product.oldPrice 
        ? `<span class="prod-price-old">$${product.oldPrice.toFixed(2)}</span>` 
        : '';
    
    const starsHtml = `<div class="prod-stars"><img src="/pictures/HomepageImages/Star.svg" alt="rating"></div>`;
    const extraClass = product.customClass ? product.customClass : '';
    
    return `
        <div class="prod-card ${extraClass}" data-id="${product.id}">
            <div class="prod-tags">
                <span class="prod-tag">${product.category || 'Product'}</span>
            </div>
            
            <div class="prod-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            
            <h3 class="prod-name">${product.name}</h3>
            
            <div class="prod-price-row">
                ${oldPriceHtml}
                <span class="prod-price-new">$${product.price.toFixed(2)}</span>
                ${starsHtml}
            </div>
            
            <button class="btn-open-review" data-id="${product.id}">Review</button>

            ${withCartBtn ? `
            <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add to cart">
                <img src="/pictures/HomepageImages/Cart Icon.svg" alt="cart">
            </button>` : ''}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const gridElement = document.getElementById('productsGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sortBtn = document.getElementById('sortPriceBtn');
    const resetBtn = document.getElementById('resetSortBtn');
    
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
        if (!gridElement) {
            return;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = currentProducts.slice(start, end);
        
        gridElement.innerHTML = productsToShow.map(product => createProductCard(product, true)).join('');

        if (typeof applyLanguage === 'function') applyLanguage();
        
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = end >= currentProducts.length;
        
        if (sortBtn) {
            const arrow = sortBtn.querySelector('.sort-arrow');
            if (arrow) {
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        }
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
    updateHeaderCartCount();
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

async function addToCart(productId) {
    console.log(' Добавляем товар:', productId);

    // 1. ПОЛУЧАЕМ ПОЛЬЗОВАТЕЛЯ ИЗ ПАМЯТИ (Исправляет ошибку "user is not defined")
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        alert('Please, log in to view your card!');
        window.location.href = '/html/login.html'; // Или другой путь к странице входа
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
        userId: user.id,       // Теперь скрипт знает, откуда взять user.id!
        name: card.querySelector('.prod-name')?.textContent || 'Product',
        price: parseFloat(card.querySelector('.prod-price-new')?.textContent.replace('$', '')) || 0,
        image: card.querySelector('.prod-image-wrapper img')?.src || '',
        category: card.querySelector('.prod-tag')?.textContent || '',
        quantity: 1
    };

    try {
        // 4. ИЩЕМ ТОВАРЫ ТОЛЬКО ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (Добавлен фильтр ?userId=...)
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