// js/auth.js

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');

function init() {
    form.addEventListener('submit', handleLogin);
    
    // Сброс ошибок при начале ввода данных
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            clearError(input);
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let hasError = false;

    // 1. Клиентская валидация полей на пустоту и формат
    if (!email) {
        showError(emailInput, 'Поле Email обязательно для заполнения');
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(emailInput, 'Неверный формат Email адреса');
        hasError = true;
    }

    if (!password) {
        showError(passwordInput, 'Поле Пароль обязательно для заполнения');
        hasError = true;
    }

    if (hasError) return;

    try {
        // 2. ШАГ 1: Проверяем, существует ли пользователь с таким Email в принципе
        const emailRes = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        const usersByEmail = await emailRes.json();

        if (usersByEmail.length === 0) {
            // Если массив пустой — такого Email нет в db.json
            showError(emailInput, 'Аккаунт с таким Email не существует. Зарегистрируйтесь!');
            return;
        }

        // 3. ШАГ 2: Если Email существует, проверяем связку Email + Пароль
        const user = usersByEmail[0];
        if (user.password !== password) {
            showError(passwordInput, 'Неверный пароль. Попробуйте еще раз');
            return;
        }
        
        // 4. Если всё совпало — сохраняем сессию в LocalStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Используем твой готовый Toast-нотификатор (если он подключен) или обычный alert
        const toast = document.getElementById('successToast');
        if (toast) {
            toast.querySelector('.toast-text').textContent = `Welcome back, ${user.firstName || 'User'}! ✨`;
            toast.classList.add('show');
        } else {
            alert(`Авторизация успешна! Добро пожаловать, ${user.firstName || 'User'}!`);
        }
        
        // Редирект в зависимости от роли
        setTimeout(() => {
            window.location.href = user.role === 'admin' ? 'admin.html' : 'homepage.html';
        }, 1500);

    } catch (error) {
        console.error('Auth error:', error);
        alert('Ошибка сервера при авторизации. Убедитесь, что json-server запущен.');
    }
}

// Вспомогательные функции для вывода красивых ошибок под инпутами
function showError(input, message) {
    clearError(input);
    input.classList.add('invalid'); // Добавляет красную рамку из auth.css
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'auth-error-message'; // Класс для стилизации текста ошибки
    errorSpan.textContent = message;
    input.parentElement.appendChild(errorSpan);
}

function clearError(input) {
    input.classList.remove('invalid');
    const oldError = input.parentElement.querySelector('.auth-error-message');
    if (oldError) oldError.remove();
}

document.addEventListener('DOMContentLoaded', init);