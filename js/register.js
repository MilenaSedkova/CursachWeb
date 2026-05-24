const form = document.getElementById('registerForm');
const btnSubmit = document.getElementById('registerSubmitBtn');

const fields = {
    email: document.getElementById('regEmail'),
    name: document.getElementById('regName'),
    lastName: document.getElementById('regLastName'),
    middleName: document.getElementById('regMiddleName'),
    dob: document.getElementById('regDob'),
    phone: document.getElementById('regPhone'),
    nickname: document.getElementById('regNickname'),
    password: document.getElementById('regPassword'),
    confirmPassword: document.getElementById('regConfirmPassword'),
    agreement: document.getElementById('regAgreement')
};

// Заглушка ТОП-100 паролей
const TOP_100_PASSWORDS = ['12345678', 'password', 'qwerty1234', '11111111', '123456789'];
let nicknameAttempts = 0;

function init() {
    // 1. Глазки для пароля
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById(e.currentTarget.dataset.target);
            if (input.type === 'password') {
                input.type = 'text';
                e.currentTarget.textContent = '🙈';
            } else {
                input.type = 'password';
                e.currentTarget.textContent = '👁️';
            }
        });
    });

    // 2. Блокировка вставки в поле подтверждения пароля
    fields.confirmPassword.addEventListener('paste', (e) => {
        e.preventDefault();
        showError(fields.confirmPassword, 'Вставка пароля запрещена. Введите вручную.');
    });

    // 3. Форматирование номера телефона РБ на лету
    fields.phone.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('375')) val = val.slice(3);
        val = val.slice(0, 9); // Максимум 9 цифр после кода
        
        if (val.length === 0) e.target.value = '';
        else if (val.length <= 2) e.target.value = `+375(${val}`;
        else if (val.length <= 5) e.target.value = `+375(${val.slice(0,2)})-${val.slice(2)}`;
        else if (val.length <= 7) e.target.value = `+375(${val.slice(0,2)})-${val.slice(2,5)}-${val.slice(5)}`;
        else e.target.value = `+375(${val.slice(0,2)})-${val.slice(2,5)}-${val.slice(5,7)}-${val.slice(7)}`;
    });

    // 4. Очистка ошибок при вводе и разблокировка кнопки
    form.addEventListener('input', (e) => {
        if (e.target.classList.contains('auth-control') || e.target.type === 'checkbox') {
            clearError(e.target);
            checkFormValidity();
        }
    });

    // Генерация пароля
    document.getElementById('btnGenPassword').addEventListener('click', () => {
        const genPwd = generateSecurePassword();
        fields.password.value = genPwd;
        fields.confirmPassword.value = genPwd;
        clearError(fields.password);
        clearError(fields.confirmPassword);
        fields.password.type = 'text'; // Временно показываем пароль
        checkFormValidity();
    });

    // Генерация никнейма
    document.getElementById('btnGenNickname').addEventListener('click', async () => {
        const fName = fields.name.value.trim();
        const lName = fields.lastName.value.trim();
        
        if (!fName || !lName) {
            showError(fields.nickname, 'Сначала введите Name и Last name');
            return;
        }

        if (nicknameAttempts >= 5) {
            fields.nickname.removeAttribute('readonly');
            showError(fields.nickname, 'Лимит попыток. Введите никнейм самостоятельно.');
            fields.nickname.focus();
            return;
        }

        const newNick = generateNickname(fName, lName, nicknameAttempts);
        
        // Проверка уникальности
        const isUnique = await checkUnique('nickname', newNick);
        nicknameAttempts++;

        if (isUnique) {
            fields.nickname.value = newNick;
            fields.nickname.removeAttribute('readonly');
            clearError(fields.nickname);
        } else {
            showError(fields.nickname, `Ник ${newNick} занят. Жмите еще раз.`);
        }
        checkFormValidity();
    });

    form.addEventListener('submit', handleRegister);
}

// функция генерации //
function generateSecurePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&*";
    const all = upper + lower + digits + special;
    
    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    pwd += special[Math.floor(Math.random() * special.length)];
    
    for(let i=0; i<8; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
    }
    // Перемешиваем
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

function generateNickname(fName, lName, attempt) {
    const p1 = fName.slice(0, Math.floor(Math.random() * 3) + 1);
    const p2 = lName.slice(0, Math.floor(Math.random() * 3) + 1);
    const num = Math.floor(Math.random() * 890) + 10;
    const suffixes = ['', '_VIP', '77', '_pro', 'One'];
    return `${p1}${p2}${num}${suffixes[attempt] || ''}`.replace(/\s/g, '');
}

// валидация //
function validateAll() {
    let isValid = true;

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
        showError(fields.email, 'Неверный формат Email');
        isValid = false;
    }

    // Возраст 16+
    if (!fields.dob.value) {
        showError(fields.dob, 'Выберите дату рождения');
        isValid = false;
    } else {
        const dob = new Date(fields.dob.value);
        const age = new Date().getFullYear() - dob.getFullYear();
        if (age < 16) {
            showError(fields.dob, 'Вам должно быть не менее 16 лет');
            isValid = false;
        }
    }

    // Телефон (Только РБ)
    const phoneRaw = fields.phone.value.replace(/\D/g, '');
    if (!/^375(25|29|33|44)\d{7}$/.test(phoneRaw)) {
        showError(fields.phone, 'Формат: +375(XX)-XXX-XX-XX (только РБ)');
        isValid = false;
    }

    // Имя и Фамилия
    if (!fields.name.value.trim()) { showError(fields.name, 'Обязательное поле'); isValid = false; }
    if (!fields.lastName.value.trim()) { showError(fields.lastName, 'Обязательное поле'); isValid = false; }
    if (!fields.nickname.value.trim()) { showError(fields.nickname, 'Сгенерируйте или введите никнейм'); isValid = false; }

    // Пароль (Правила)
    const pwd = fields.password.value;
    if (pwd.length < 8 || pwd.length > 20) {
        showError(fields.password, 'Длина от 8 до 20 символов');
        isValid = false;
    } else if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
        showError(fields.password, 'Нужна заглавная, строчная, цифра и спецсимвол');
        isValid = false;
    } else if (TOP_100_PASSWORDS.includes(pwd)) {
        showError(fields.password, 'Пароль слишком простой (в TOP-100)');
        isValid = false;
    }

    // Подтверждение пароля
    if (pwd !== fields.confirmPassword.value) {
        showError(fields.confirmPassword, 'Пароли не совпадают');
        isValid = false;
    }

    // Соглашение
    if (!fields.agreement.checked) {
        isValid = false;
    }

    return isValid;
}

function checkFormValidity() {
    const requiredFilled = Object.values(fields).every(f => {
        // 1. Если поля вообще нет в HTML, игнорируем его, чтобы скрипт не падал
        if (!f) return true; 
        
        // 2. Отчество необязательно, его не проверяем на пустоту
        if (f.id === 'regMiddleName') return true; 
        
        // 3. Для чекбокса (соглашения) проверяем галочку
        if (f.type === 'checkbox') return f.checked; 
        
        // 4. Для остальных полей проверяем, что введено хоть что-то
        return f.value.trim().length > 0;
    });
    
    // Если всё заполнено — разблокируем кнопку (она станет темно-синей)
    btnSubmit.disabled = !requiredFilled;
}

// отправка на сервер //
async function checkUnique(field, value) {
    try {
        const res = await fetch(`http://localhost:3000/users?${field}=${encodeURIComponent(value)}`);
        const data = await res.json();
        return data.length === 0;
    } catch {
        return false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    // Очищаем старый статус перед новой попыткой (если он был)
    const oldStatus = document.getElementById('formStatusMessage');
    if (oldStatus) oldStatus.remove();

    // Если локальная валидация не пройдена
    if (!validateAll()) {
        showStatusMessage('Пожалуйста, исправьте ошибки в полях выше.', 'error');
        return; 
    }

    // Проверка уникальности Email
    const isEmailUnique = await checkUnique('email', fields.email.value);
    if (!isEmailUnique) {
        showError(fields.email, 'Этот Email уже зарегистрирован');
        showStatusMessage('Ошибка: Данный Email уже используется.', 'error');
        return;
    }

    // Проверка уникальности Никнейма
    const isNickUnique = await checkUnique('nickname', fields.nickname.value);
    if (!isNickUnique) {
        showError(fields.nickname, 'Этот никнейм уже занят');
        showStatusMessage('Ошибка: Никнейм занят, сгенерируйте другой.', 'error');
        return;
    }

    // Собираем данные
    const userData = {
        email: fields.email.value.trim(),
        firstName: fields.name.value.trim(),
        lastName: fields.lastName.value.trim(),
        middleName: fields.middleName ? fields.middleName.value.trim() : "",
        dateOfBirth: fields.dob.value,
        phone: fields.phone.value.replace(/\D/g, ''),
        nickname: fields.nickname.value.trim(),
        password: fields.password.value,
        role: "customer",
        agreementAccepted: true,
        createdAt: new Date().toISOString()
    };

   try {
        const res = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!res.ok) throw new Error('Ошибка сервера');
        
        const savedUser = await res.json();
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        
        // 1. Показываем сообщение
        showStatusMessage('Регистрация успешна! Перенаправляем на главную...', 'success');
        
        // 2. Блокируем кнопку
        const btnSubmit = document.getElementById('registerSubmitBtn');
        btnSubmit.disabled = true;
        btnSubmit.style.backgroundColor = '#A8B2A9'; 

        setTimeout(() => {
            window.location.href = '/homepage.html'; 
        }, 2000);
        
    } catch (err) {
        showStatusMessage('Сбой регистрации. Проверьте подключение сервера JSON-Server.', 'error');
    }
}

function showStatusMessage(message, type) {
    // Ищем, есть ли уже блок для сообщений
    let statusDiv = document.getElementById('formStatusMessage');
    
    // Если его нет — создаем
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'formStatusMessage';
        
        // Стилизация блока
        statusDiv.style.marginTop = '20px'; // Отступ сверху, так как блок теперь ПОД кнопкой
        statusDiv.style.padding = '18px 24px';
        statusDiv.style.borderRadius = '16px';
        statusDiv.style.fontFamily = "'Inter', sans-serif";
        statusDiv.style.fontSize = '16px';
        statusDiv.style.fontWeight = '600';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.width = '100%';
        statusDiv.style.boxSizing = 'border-box';
        
        // Вставляем блок СРАЗУ ПОСЛЕ кнопки отправки (Register)
        const btnSubmit = document.getElementById('registerSubmitBtn');
        btnSubmit.parentNode.insertBefore(statusDiv, btnSubmit.nextSibling);
    }
    
    // Красим блок в зависимости от статуса (Успех или Ошибка)
    if (type === 'success') {
        statusDiv.style.backgroundColor = '#F1F8F4'; 
        statusDiv.style.color = '#669C61'; 
        statusDiv.style.border = '1px solid #7EB693';
    } else {
        statusDiv.style.backgroundColor = '#FFF8F8'; 
        statusDiv.style.color = '#dc3545'; 
        statusDiv.style.border = '1px solid #F5C2C7';
    }
    
    // Записываем текст. Никаких таймеров скрытия здесь нет — он останется навсегда!
    statusDiv.textContent = message;
}

function showError(input, message) {
    clearError(input);
    input.classList.add('invalid');
    const err = document.createElement('span');
    err.className = 'auth-error-message';
    err.textContent = message;
    
    // Вставляем ошибку после контейнера, если есть глаз, либо после инпута
    const ref = input.parentElement.classList.contains('password-wrapper') ? input.parentElement : input;
    ref.parentElement.appendChild(err);
}

function clearError(input) {
    input.classList.remove('invalid');
    const ref = input.parentElement.classList.contains('password-wrapper') ? input.parentElement : input;
    const old = ref.parentElement.querySelector('.auth-error-message');
    if (old) old.remove();
}

document.addEventListener('DOMContentLoaded', init);