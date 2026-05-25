// === ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ТОВАРАМИ ===
const productForm = document.getElementById('productForm');
const prodId = document.getElementById('prodId');
const prodName = document.getElementById('prodName');
const prodPrice = document.getElementById('prodPrice');
const prodCategory = document.getElementById('prodCategory');
const adminAction = document.getElementById('adminAction');
const submitProductBtn = document.getElementById('submitProductBtn');

const idGroup = document.getElementById('idGroup');
const nameGroup = document.getElementById('nameGroup');
const priceGroup = document.getElementById('priceGroup');

// ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ 
const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userIdInput');
const userEmail = document.getElementById('userEmail');
const userPassword = document.getElementById('userPassword');
const userFirstName = document.getElementById('userFirstName');
const userAction = document.getElementById('userAction');
const submitUserBtn = document.getElementById('submitUserBtn');

const userIdGroup = document.getElementById('userIdGroup');
const userEmailGroup = document.getElementById('userEmailGroup');
const userPassGroup = document.getElementById('userPassGroup');
const userNameGroup = document.getElementById('userNameGroup');

//ФУНКЦИЯ ДИНАМИЧЕСКОГО ПЕРЕВОДА СТРОК
function getTxt(enText, elementId = '') {
    // 1. Проверяем, какой язык сейчас выбран (обычно хранится в localStorage или на body)
    const currentLang = localStorage.getItem('language') || document.documentElement.lang || 'en';
    
    if (currentLang === 'ru' && typeof dictionary !== 'undefined') {
        // Если передан ID элемента, пробуем найти перевод специального сообщения с ID
        if (elementId && dictionary[elementId]) {
            return dictionary[elementId];
        }
        // Иначе ищем прямой перевод английского текста в словаре
        if (dictionary[enText]) {
            return dictionary[enText];
        }
    }
    return enText; // Возвращаем исходный текст, если язык английский
}

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ВЫВОДА УВЕДОМЛЕНИЙ С ЗАЩИТОЙ ОТ ПЕРЕЗАГРУЗКИ
function showStatus(elementId, message, isSuccess) {
    const statusEl = document.getElementById(elementId);
    if (!statusEl) return;

    // Переводим сообщение перед выводом на экран
    const translatedMessage = getTxt(message);

    statusEl.textContent = translatedMessage;
    statusEl.className = 'form-status-message ' + (isSuccess ? 'success' : 'error');

    // Сохраняем ОРИГИНАЛЬНЫЙ английский текст в sessionStorage,
    // чтобы после перезагрузки он перевелся актуально выбранному языку
    sessionStorage.setItem(elementId + '_msg', message);
    sessionStorage.setItem(elementId + '_success', isSuccess);

    // Автоматически скрываем уведомление через 15 секунд
    setTimeout(() => {
        statusEl.className = 'form-status-message';
        sessionStorage.removeItem(elementId + '_msg');
        sessionStorage.removeItem(elementId + '_success');
    }, 15000);
}

// ПРОВЕРКА СОХРАНЕННЫХ СООБЩЕНИЙ ДЛЯ ОБЕИХ ФОРМ ПОСЛЕ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ
['productFormStatus', 'userFormStatus'].forEach(elementId => {
    const savedMessage = sessionStorage.getItem(elementId + '_msg');
    const savedSuccess = sessionStorage.getItem(elementId + '_success');

    if (savedMessage) {
        const statusEl = document.getElementById(elementId);
        if (statusEl) {
            // Переводим сохраненный текст под текущий язык
            statusEl.textContent = getTxt(savedMessage);
            statusEl.className = 'form-status-message ' + (savedSuccess === 'true' ? 'success' : 'error');
            
            // Оставляем плашку гореть на 15 секунд после перезагрузки
            setTimeout(() => {
                statusEl.className = 'form-status-message';
            }, 15000);
        }
        // Стираем ключи, чтобы сообщение не всплывало повторно при обычном F5
        sessionStorage.removeItem(elementId + '_msg');
        sessionStorage.removeItem(elementId + '_success');
    }
});


// 1. ВАЛИДАЦИЯ ФОРМЫ ТОВАРОВ
function validateForm() {
    const action = adminAction.value;
    const nameValue = prodName.value ? prodName.value.trim() : '';
    const priceValue = prodPrice.value ? prodPrice.value.trim() : '';
    const idValue = prodId.value ? prodId.value.trim() : '';

    const isNameValid = nameValue.length >= 3;
    const isPriceValid = priceValue !== '' && !isNaN(parseFloat(priceValue)) && parseFloat(priceValue) > 0;
    const isIdValid = idValue !== '';

    if (nameValue.length > 0 && !isNameValid) nameGroup.classList.add('error');
    else nameGroup.classList.remove('error');

    if (priceValue.length > 0 && !isPriceValid) priceGroup.classList.add('error');
    else priceGroup.classList.remove('error');

    if ((action === 'PUT' || action === 'DELETE') && !isIdValid) idGroup.classList.add('error');
    else idGroup.classList.remove('error');

    if (action === 'POST') {
        submitProductBtn.disabled = !(isNameValid && isPriceValid);
    } else if (action === 'PUT') {
        submitProductBtn.disabled = !(isIdValid && isNameValid && isPriceValid);
    } else if (action === 'DELETE') {
        submitProductBtn.disabled = !isIdValid;
    }
}

// 2. ВАЛИДАЦИЯ ФОРМЫ ПОЛЬЗОВАТЕЛЕЙ
function validateUserForm() {
    const action = userAction.value;
    const idValue = userIdInput.value.trim();
    const emailValue = userEmail.value.trim();
    const passValue = userPassword.value.trim();
    const nameValue = userFirstName.value.trim();

    const isIdValid = idValue !== '';
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const isPassValid = passValue.length >= 6;
    const isNameValid = nameValue.length >= 2;

    if (idValue.length > 0 && !isIdValid) userIdGroup.classList.add('error');
    else userIdGroup.classList.remove('error');

    if (emailValue.length > 0 && !isEmailValid) userEmailGroup.classList.add('error');
    else userEmailGroup.classList.remove('error');

    if (passValue.length > 0 && !isPassValid) userPassGroup.classList.add('error');
    else userPassGroup.classList.remove('error');

    if (nameValue.length > 0 && !isNameValid) userNameGroup.classList.add('error');
    else userNameGroup.classList.remove('error');

    if ((action === 'DELETE' || action === 'BLOCK' || action === 'UNBLOCK') && !isIdValid) {
        userIdGroup.classList.add('error');
    }

    if (action === 'POST') {
        submitUserBtn.disabled = !(isEmailValid && isPassValid && isNameValid);
    } else {
        submitUserBtn.disabled = !isIdValid;
    }
}

// Привязка живых обработчиков событий
[prodId, prodName, prodPrice, adminAction].forEach(el => {
    if (el) { el.addEventListener('input', validateForm); el.addEventListener('change', validateForm); }
});

[userIdInput, userEmail, userPassword, userFirstName, userAction].forEach(el => {
    if (el) { el.addEventListener('input', validateUserForm); el.addEventListener('change', validateUserForm); }
});

validateForm();
validateUserForm();


// 3. ОТПРАВКА ЗАПРОСОВ ДЛЯ ТОВАРОВ
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const action = adminAction.value;
        const id = prodId.value.trim();
        const productData = {
            name: prodName.value.trim(),
            price: parseFloat(prodPrice.value),
            category: prodCategory.value,
            image: '/pictures/HomepageImages/default-product.png'
        };

        try {
            if (action === 'POST') {
                const res = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (res.ok) showStatus('productFormStatus', 'Product added successfully!', true);
            } else if (action === 'PUT') {
                const res = await fetch(`${API_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (res.ok) showStatus('productFormStatus', 'Product updated successfully!', true); // 👈 Убрали динамический ID из строки для простоты перевода
                else showStatus('productFormStatus', 'Product ID not found!', false);
            } else if (action === 'DELETE') {
                const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
                if (res.ok) showStatus('productFormStatus', 'Product deleted successfully!', true); // 👈 Убрали динамический ID
                else showStatus('productFormStatus', 'Product ID not found!', false);
            }
            productForm.reset();
            validateForm();
        } catch (err) {
            showStatus('productFormStatus', 'Server error.', false);
        }
    });
}


// 4. ОТПРАВКА ЗАПРОСОВ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const action = userAction.value;
        const id = userIdInput.value.trim();

        const userData = {
            email: userEmail.value.trim(),
            password: userPassword.value.trim(),
            firstName: userFirstName.value.trim(),
            role: 'customer',
            isBlocked: false,
            createdAt: new Date().toISOString()
        };

        try {
            if (action === 'POST') {
                const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (res.ok) showStatus('userFormStatus', 'User registered successfully!', true);
            } 
            else if (action === 'DELETE') {
                const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
                if (res.ok) showStatus('userFormStatus', 'User deleted successfully!', true); // 👈 Убрали динамический ID
                else showStatus('userFormStatus', 'User ID not found!', false);
            } 
            else if (action === 'BLOCK') {
                const res = await fetch(`${API_URL}/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isBlocked: true })
                });
                if (res.ok) showStatus('userFormStatus', 'User has been blocked!', true); // 👈 Убрали динамический ID
                else showStatus('userFormStatus', 'User ID not found!', false);
            } 
            else if (action === 'UNBLOCK') {
                const res = await fetch(`${API_URL}/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isBlocked: false })
                });
                if (res.ok) showStatus('userFormStatus', 'User unblocked successfully!', true); // 👈 Убрали динамический ID
                else showStatus('userFormStatus', 'User ID not found!', false);
            }
            userForm.reset();
            validateUserForm();
        } catch (err) {
            showStatus('userFormStatus', 'Server communication error.', false);
        }
    });
}


// 5. УПРАВЛЕНИЕ ОТЗЫВАМИ 
const filterType = document.getElementById('filterType');
const filterValGroup = document.getElementById('filterValGroup');
const filterLabel = document.getElementById('filterLabel');
const filterValue = document.getElementById('filterValue');
const loadReviewsBtn = document.getElementById('loadReviewsBtn');
const reviewsContainer = document.getElementById('reviewsContainer');

if (filterType) {
    filterType.addEventListener('change', () => {
        const val = filterType.value;
        if (val === 'all') {
            filterValGroup.style.display = 'none';
        } else {
            filterValGroup.style.display = 'block';
            filterLabel.textContent = val === 'product' ? 'Enter Product ID' : 'Enter User ID';
            filterValue.placeholder = val === 'product' ? 'e.g., 2' : 'e.g., us_3';
        }
    });
}

if (loadReviewsBtn) {
    loadReviewsBtn.addEventListener('click', async () => {
        const type = filterType.value;
        const query = filterValue.value.trim();
        let url = `${API_URL}/reviews`;

        if (type === 'product' && query) url += `?productId=${query}`;
        if (type === 'user' && query) url += `?userId=${query}`;

        try {
            const res = await fetch(url);
            const reviews = await res.json();

            if (!Array.isArray(reviews) || reviews.length === 0) {
                // Выводим сообщение об отсутствии отзывов через функцию динамического перевода
                reviewsContainer.innerHTML = `<p class="reviews-placeholder">${getTxt("No reviews found.")}</p>`;
                return;
            }

            reviewsContainer.innerHTML = reviews.map(rev => `
                <div class="review-item" data-id="${rev.id}">
                    <div>
                        <strong>User ID: ${rev.userId}</strong> (Prod ID: ${rev.productId})
                        <p style="margin: 5px 0 0 0; color: #555;">"${rev.text || rev.comment || 'No text'}"</p>
                    </div>
                    <button class="btn-delete-review" onclick="deleteReview('${rev.id}')">🗑️</button>
                </div>
            `).join('');
        } catch (e) {
            console.error(e);
            reviewsContainer.innerHTML = `<p style="color: #dc3545; text-align: center;">${getTxt("Failed to load reviews.")}</p>`;
        }
    });
}

window.deleteReview = async function(id) {
    // Перевод сообщения в окне подтверждения удаления (confirm)
    if (!confirm(getTxt('Are you sure you want to delete this review?'))) return;
    try {
        const res = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
        if (res.ok) {
            document.querySelector(`.review-item[data-id="${id}"]`)?.remove();
            
            // Если после удаления карточки список стал пустым, выводим заглушку "Отзывы не найдены"
            if (document.querySelectorAll('.review-item').length === 0) {
                reviewsContainer.innerHTML = `<p class="reviews-placeholder">${getTxt("No reviews found.")}</p>`;
            }
        }
    } catch (e) {
        console.error(e);
    }
};