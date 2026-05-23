// 🍔 BURGER MENU FUNCTIONALITY

const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Открытие меню
if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.add('active');
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку
    });
}

// Закрытие меню
function closeMobileMenu() {
    if (burgerBtn) burgerBtn.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
    document.body.style.overflow = ''; // Возвращаем прокрутку
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

// Закрытие при клике на ссылку
mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Синхронизация счётчика корзины
function updateMobileCartCount() {
    const desktopCount = document.getElementById('cartCount');
    const mobileCount = document.getElementById('mobileCartCount');
    
    if (desktopCount && mobileCount) {
        mobileCount.textContent = desktopCount.textContent;
    }
}

// Обновляем счётчик при изменении
if (typeof window.updateHeaderCartCount === 'function') {
    const originalUpdate = window.updateHeaderCartCount;
    window.updateHeaderCartCount = async function() {
        await originalUpdate();
        updateMobileCartCount();
    };
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateMobileCartCount();
});