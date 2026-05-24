// Находим элементы формы товаров
const productForm = document.getElementById('productForm');
const prodId = document.getElementById('prodId');
const prodName = document.getElementById('prodName');
const prodPrice = document.getElementById('prodPrice');
const prodCategory = document.getElementById('prodCategory');
const adminAction = document.getElementById('adminAction');
const submitProductBtn = document.getElementById('submitProductBtn');

// Находим контейнеры групп для вывода ошибок валидации инпутов
const idGroup = document.getElementById('idGroup');
const nameGroup = document.getElementById('nameGroup');
const priceGroup = document.getElementById('priceGroup');

// ФУНКЦИЯ ВЫВОДА УВЕДОМЛЕНИЙ НА СТРАНИЦЕ 
function showFormStatus(message, isSuccess) {
    const statusEl = document.getElementById('productFormStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'form-status-message ' + (isSuccess ? 'success' : 'error');

    // Сохраняем статус в sessionStorage на случай, если Live Server сейчас перезагрузит страницу
    sessionStorage.setItem('adminStatusMessage', message);
    sessionStorage.setItem('adminStatusSuccess', isSuccess);

    // Автоматически скрываем уведомление через 15 секунд
    setTimeout(() => {
        statusEl.className = 'form-status-message';
        sessionStorage.removeItem('adminStatusMessage');
        sessionStorage.removeItem('adminStatusSuccess');
    }, 15000);
}

// 1. ФУНКЦИЯ ЖИВОЙ ВАЛИДАЦИИ ФОРМЫ
function validateForm() {
    const action = adminAction.value;
    
    const nameValue = prodName.value ? prodName.value.trim() : '';
    const priceValue = prodPrice.value ? prodPrice.value.trim() : '';
    const idValue = prodId.value ? prodId.value.trim() : '';

    const isNameValid = nameValue.length >= 3;
    const isPriceValid = priceValue !== '' && !isNaN(parseFloat(priceValue)) && parseFloat(priceValue) > 0;
    const isIdValid = idValue !== '';

    if (nameValue.length > 0 && !isNameValid) {
        nameGroup.classList.add('error');
    } else {
        nameGroup.classList.remove('error');
    }

    if (priceValue.length > 0 && !isPriceValid) {
        priceGroup.classList.add('error');
    } else {
        priceGroup.classList.remove('error');
    }

    if ((action === 'PUT' || action === 'DELETE') && !isIdValid) {
        idGroup.classList.add('error');
    } else {
        idGroup.classList.remove('error');
    }

    if (action === 'POST') {
        submitProductBtn.disabled = !(isNameValid && isPriceValid);
    } else if (action === 'PUT') {
        submitProductBtn.disabled = !(isIdValid && isNameValid && isPriceValid);
    } else if (action === 'DELETE') {
        submitProductBtn.disabled = !isIdValid;
    }
}

window.validateForm = validateForm;

// Вешаем слушатели событий через JS
[prodId, prodName, prodPrice, adminAction].forEach(element => {
    if (element) {
        element.addEventListener('input', validateForm);
        element.addEventListener('change', validateForm);
    }
});

// Запускаем проверку один раз при старте
validateForm();

//ПРОВЕРКА СОХРАНЕННОГО СТАТУСА ПОСЛЕ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ 
const savedMessage = sessionStorage.getItem('adminStatusMessage');
const savedSuccess = sessionStorage.getItem('adminStatusSuccess');

if (savedMessage) {
    const statusEl = document.getElementById('productFormStatus');
    if (statusEl) {
        statusEl.textContent = savedMessage;
        statusEl.className = 'form-status-message ' + (savedSuccess === 'true' ? 'success' : 'error');
        
        // Оставляем висеть на 15 секунд после перезагрузки
        setTimeout(() => {
            statusEl.className = 'form-status-message';
        }, 15000);
    }
    // Сразу очищаем хранилище, чтобы сообщение не всплывало при обычном обновлении через F5
    sessionStorage.removeItem('adminStatusMessage');
    sessionStorage.removeItem('adminStatusSuccess');
}


// 2. ОБРАБОТКА ЗАПРОСОВ НА СЕРВЕР (POST, PUT, DELETE)
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
                if (res.ok) {
                    showFormStatus('Product added successfully!', true);
                } else {
                    showFormStatus('Failed to add product. Try again.', false);
                }

            } else if (action === 'PUT') {
                const res = await fetch(`${API_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (res.ok) {
                    showFormStatus(`Product ID ${id} updated successfully!`, true);
                } else {
                    showFormStatus('Product with this ID not found!', false);
                }

            } else if (action === 'DELETE') {
                const res = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    showFormStatus(`Product ID ${id} deleted successfully!`, true);
                } else {
                    showFormStatus('Product with this ID not found!', false);
                }
            }

            productForm.reset();
            validateForm();

        } catch (error) {
            console.error('Server CRUD Error:', error);
            showFormStatus('Error communicating with server. Check terminal.', false);
        }
    });
}


// 3. УПРАВЛЕНИЕ ОТЗЫВАМИ
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
                reviewsContainer.innerHTML = '<p class="reviews-placeholder">No reviews found.</p>';
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
            reviewsContainer.innerHTML = '<p style="color: #dc3545; text-align: center;">Failed to load reviews.</p>';
        }
    });
}

window.deleteReview = async function(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
        const res = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
        if (res.ok) {
            document.querySelector(`.review-item[data-id="${id}"]`)?.remove();
        }
    } catch (e) {
        console.error(e);
    }
};