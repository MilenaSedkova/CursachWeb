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
    
    // Очищаем старый статус перед новой попыткой
    const oldStatus = document.getElementById('formStatusMessage');
    if (oldStatus) oldStatus.remove();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let hasError = false;

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
        // Шаг 1: Ищем пользователя по Email
        const emailRes = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        const usersByEmail = await emailRes.json();

        if (usersByEmail.length === 0) {
            showError(emailInput, 'Аккаунт с таким Email не существует. Зарегистрируйтесь!');
            return;
        }

        // Шаг 2: Проверяем пароль
        const user = usersByEmail[0];
        if (user.password !== password) {
            showError(passwordInput, 'Неверный пароль. Попробуйте еще раз');
            return;
        }
        
        // Авторизация успешна! Сохраняем пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // ВЫВОДИМ УСПЕХ НА СТРАНИЦЕ (Зеленая плашка)
        showStatusMessage(`Authorization is successful! Welcome, ${user.firstName || user.nickname}!`, 'success');
        
        // Блокируем кнопку, чтобы не нажимали дважды
        const btnSubmit = document.getElementById('loginSubmitBtn');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.style.backgroundColor = '#A8B2A9';
        }
        
        // Ждем 2 секунды и редиректим (Судя по скрину, ты в папке html, поэтому путь ../)
        setTimeout(() => {
            window.location.href = user.role === 'admin' ? 'admin.html' : '../homepage.html';
        }, 2000);

    } catch (error) {
        console.error('Auth error:', error);
        // ВЫВОДИМ ОШИБКУ НА СТРАНИЦЕ (Красная плашка)
        showStatusMessage('Ошибка сервера. Убедитесь, что json-server запущен.', 'error');
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

function showStatusMessage(message, type) {
    let statusDiv = document.getElementById('formStatusMessage');
    
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'formStatusMessage';
        
        statusDiv.style.marginTop = '20px';
        statusDiv.style.padding = '18px 24px';
        statusDiv.style.borderRadius = '16px';
        statusDiv.style.fontFamily = "'Inter', sans-serif";
        statusDiv.style.fontSize = '16px';
        statusDiv.style.fontWeight = '600';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.width = '100%';
        statusDiv.style.boxSizing = 'border-box';
        
        // Вставляем блок под кнопку Log in
        const btnSubmit = document.getElementById('loginSubmitBtn'); 
        if (btnSubmit) {
            btnSubmit.parentNode.insertBefore(statusDiv, btnSubmit.nextSibling);
        }
    }
    
    if (type === 'success') {
        statusDiv.style.backgroundColor = '#F1F8F4'; 
        statusDiv.style.color = '#669C61'; 
        statusDiv.style.border = '1px solid #7EB693';
    } else {
        statusDiv.style.backgroundColor = '#FFF8F8'; 
        statusDiv.style.color = '#dc3545'; 
        statusDiv.style.border = '1px solid #F5C2C7';
    }
    
    statusDiv.textContent = message;
}