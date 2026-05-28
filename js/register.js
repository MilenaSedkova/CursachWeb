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

// === ФУНКЦИЯ ДИНАМИЧЕСКОГО ПЕРЕВОДА СТРОК ===
function getTxt(enText) {
    const currentLang = localStorage.getItem('language') || document.documentElement.lang || 'en';
    const dict = window.AppI18n ? window.AppI18n.dictionary : undefined;
    
    if (currentLang === 'ru' && dict && dict[enText]) {
        return dict[enText];
    }
    return enText;
}

function init() {
    // 1. Глазки для пароля
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById(e.currentTarget.dataset.target);
            if (input.type === 'password') {
                input.type = 'text';
                e.currentTarget.textContent = '\u{1F648}';
            } else {
                input.type = 'password';
                e.currentTarget.textContent = '\u{1F441}';
            }
        });
    });

    // 2. Блокировка вставки в поле подтверждения пароля
    fields.confirmPassword.addEventListener('paste', (e) => {
        e.preventDefault();
        showError(fields.confirmPassword, getTxt('Password pasting is prohibited. Enter manually.'));
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
    const btnGenPassword = document.getElementById('btnGenPassword');
    if (btnGenPassword) {
        btnGenPassword.addEventListener('click', () => {
            const genPwd = generateSecurePassword();
            fields.password.value = genPwd;
            fields.confirmPassword.value = genPwd;
            clearError(fields.password);
            clearError(fields.confirmPassword);
            fields.password.type = 'text'; // Временно показываем пароль
            checkFormValidity();
        });
    }

    // Генерация никнейма
    const btnGenNickname = document.getElementById('btnGenNickname');
    if (btnGenNickname) {
        btnGenNickname.addEventListener('click', async () => {
            const fName = fields.name.value.trim();
            const lName = fields.lastName.value.trim();
            
            if (!fName || !lName) {
                showError(fields.nickname, getTxt('Please enter Name and Last name first'));
                return;
            }

            if (nicknameAttempts >= 5) {
                fields.nickname.removeAttribute('readonly');
                showError(fields.nickname, getTxt('Attempt limit. Enter nickname manually.'));
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
                showError(fields.nickname, `${getTxt('Nickname')} ${newNick} ${getTxt('is taken. Try again.')}`);
            }
            checkFormValidity();
        });
    }

    form.addEventListener('submit', handleRegister);

    const agreementLink = document.getElementById('showAgreementLink');
    if (agreementLink) {
        agreementLink.addEventListener('click', (e) => {
            e.preventDefault(); // Отменяем стандартный переход по ссылке
            
            // Узнаем текущий язык сайта (один раз для всего окна!)
            const savedSettings = JSON.parse(localStorage.getItem('appSettings')) || {};
            const currentLang = savedSettings.lang || 'en';
            
            // Задаем правильный заголовок в именительном падеже
            const modalTitle = currentLang === 'ru' ? 'Пользовательское соглашение' : 'User Agreement';
            
            // Текст на РУССКОМ
            const textRu = `
                <div style="font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6; color: #5A6670; max-height: 400px; overflow-y: auto; padding-right: 10px; text-align: left;">
                    <h4 style="color: #1F263E; margin-bottom: 10px;">1. Общие положения</h4>
                    <p style="margin-bottom: 15px;">Настоящее пользовательское соглашение регулирует отношения между магазином Organick и пользователем. Регистрируясь на сайте, вы соглашаетесь с данными условиями.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">2. Конфиденциальность</h4>
                    <p style="margin-bottom: 15px;">Мы гарантируем сохранность ваших личных данных. Ваши email, телефон и адрес используются исключительно для обработки заказов и не передаются третьим лицам.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">3. Покупки и возврат</h4>
                    <p style="margin-bottom: 15px;">Все продукты сертифицированы. В случае получения товара ненадлежащего качества, вы имеете право на замену или возврат средств в течение 14 дней.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">4. Обязанности пользователя</h4>
                    <p style="margin-bottom: 15px;">Пользователь обязуется предоставлять достоверные данные при регистрации и не использовать сайт в мошеннических целях.</p>
                </div>
            `;

            // Текст на АНГЛИЙСКОМ
            const textEn = `
                <div style="font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6; color: #5A6670; max-height: 400px; overflow-y: auto; padding-right: 10px; text-align: left;">
                    <h4 style="color: #1F263E; margin-bottom: 10px;">1. General Provisions</h4>
                    <p style="margin-bottom: 15px;">This user agreement regulates the relationship between the Organick store and the user. By registering on the site, you agree to these terms.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">2. Privacy</h4>
                    <p style="margin-bottom: 15px;">We guarantee the safety of your personal data. Your email, phone, and address are used exclusively for order processing and are not shared with third parties.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">3. Purchases and Returns</h4>
                    <p style="margin-bottom: 15px;">All products are certified. In case of receiving a product of inadequate quality, you have the right to a replacement or refund within 14 days.</p>
                    
                    <h4 style="color: #1F263E; margin-bottom: 10px;">4. User Responsibilities</h4>
                    <p style="margin-bottom: 15px;">The user agrees to provide accurate data during registration and not to use the site for fraudulent purposes.</p>
                </div>
            `;

            // Выбираем нужный текст в зависимости от языка
            const agreementText = (currentLang === 'ru') ? textRu : textEn;

            // Вызываем окно
            if (window.AppUI) {
                window.AppUI.showModal(modalTitle, agreementText);
            }
        });
    }
}

// === ФУНКЦИИ ГЕНЕРАЦИИ (Вынесены на глобальный уровень) ===
function generateSecurePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$*()_+-="; 
    const all = upper + lower + digits + special;
    
    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    pwd += special[Math.floor(Math.random() * special.length)];
    
    for(let i = 0; i < 8; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
    }
    
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function generateNickname(fName, lName, attempt) {
    const p1 = fName.slice(0, Math.floor(Math.random() * 3) + 1);
    const p2 = lName.slice(0, Math.floor(Math.random() * 3) + 1);
    const num = Math.floor(Math.random() * 890) + 10;
    const suffixes = ['', '_VIP', '77', '_pro', 'One'];
    return `${p1}${p2}${num}${suffixes[attempt] || ''}`.replace(/\s/g, '');
}

// === ВАЛИДАЦИЯ ФОРМЫ ===
function validateAll() {
    let isValid = true;

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
        showError(fields.email, getTxt('Uncorrect format of Email'));
        isValid = false;
    }

    // Возраст 16+
    if (!fields.dob.value) {
        showError(fields.dob, getTxt('Choose the date of birth'));
        isValid = false;
    } else {
        const dob = new Date(fields.dob.value);
        const age = new Date().getFullYear() - dob.getFullYear();
        if (age < 16) {
            showError(fields.dob, getTxt('You must be at least 16 years old'));
            isValid = false;
        }
    }

    // Телефон (Только РБ)
    const phoneRaw = fields.phone.value.replace(/\D/g, '');
    if (!/^375(25|29|33|44)\d{7}$/.test(phoneRaw)) {
        showError(fields.phone, getTxt('Format: +375(XX)-XXX-XX-XX (only RB)'));
        isValid = false;
    }

    // Имя, Фамилия, Никнейм
    if (!fields.name.value.trim()) { showError(fields.name, getTxt('Required field')); isValid = false; }
    if (!fields.lastName.value.trim()) { showError(fields.lastName, getTxt('Required field')); isValid = false; }
    if (!fields.nickname.value.trim()) { showError(fields.nickname, getTxt('Generate or enter a nickname')); isValid = false; }

    // Пароль (Правила)
    const pwd = fields.password.value;
    if (pwd.length < 8 || pwd.length > 20) {
        showError(fields.password, getTxt('Length from 8 to 20 characters'));
        isValid = false;
    } else if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
        showError(fields.password, getTxt('Need uppercase, lowercase, digit and special character'));
        isValid = false;
    } else if (TOP_100_PASSWORDS.includes(pwd)) {
        showError(fields.password, getTxt('Password is too simple (in TOP-100)'));
        isValid = false;
    }

    // Подтверждение пароля
    if (pwd !== fields.confirmPassword.value) {
        showError(fields.confirmPassword, getTxt('Passwords do not match'));
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
        if (!f) return true; 
        if (f.id === 'regMiddleName') return true; 
        if (f.type === 'checkbox') return f.checked; 
        return f.value.trim().length > 0;
    });
    
    if (btnSubmit) btnSubmit.disabled = !requiredFilled;
}

// === СВЯЗЬ С СЕРВЕРОМ ===
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
    
    const oldStatus = document.getElementById('formStatusMessage');
    if (oldStatus) oldStatus.remove();

    if (!validateAll()) {
        showStatusMessage(getTxt('Please fix the errors in the fields above.'), 'error');
        return; 
    }

    // Проверка уникальности Email
    const isEmailUnique = await checkUnique('email', fields.email.value);
    if (!isEmailUnique) {
        showError(fields.email, getTxt('This Email is already registered'));
        showStatusMessage(getTxt('Error: This Email is already in use.'), 'error');
        return;
    }

    // Проверка уникальности Никнейма
    const isNickUnique = await checkUnique('nickname', fields.nickname.value);
    if (!isNickUnique) {
        showError(fields.nickname, getTxt('This nickname is already taken'));
        showStatusMessage(getTxt('Error: Nickname is taken, generate another one.'), 'error');
        return;
    }

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
        
        if (!res.ok) throw new Error('Server error');
        
        const savedUser = await res.json();
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        
        showStatusMessage(getTxt('Registration is successful! Redirecting to home page...'), 'success');
        
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.style.backgroundColor = '#A8B2A9'; 
        }

        setTimeout(() => {
            window.location.href = '/homepage.html'; 
        }, 2000);
        
    } catch (err) {
        showStatusMessage(getTxt('Registration failed. Check JSON-Server connection.'), 'error');
    }
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ИНТЕРФЕЙСА ===
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

function showError(input, message) {
    clearError(input);
    input.classList.add('invalid');
    const err = document.createElement('span');
    err.className = 'auth-error-message';
    err.textContent = message;
    
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