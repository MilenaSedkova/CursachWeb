const API_URL = 'http://localhost:3000';

window.updateHeaderCartCount = async function() {
    const el = document.getElementById('cartCount');
    const mobileEl = document.getElementById('mobileCartCount'); // Если у тебя есть мобильная корзина

    if (!el && !mobileEl) return;

    // 1. Проверяем, есть ли авторизованный пользователь
    const userJson = localStorage.getItem('currentUser');
    
    // ЕСЛИ ПОЛЬЗОВАТЕЛЯ НЕТ -> СТРОГО 0
    if (!userJson) {
        if (el) el.textContent = 'Cart(0)';
        if (mobileEl) mobileEl.textContent = 'Cart(0)';
        return; 
    }

    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЕСТЬ -> Идем в базу за ЕГО товарами
    const user = JSON.parse(userJson);
    try {
        const res = await fetch(`${API_URL}/cartItems?userId=${user.id}`);
        const items = await res.json();
        
        // Считаем общее количество
        const total = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
        
        if (el) el.textContent = `Cart(${total})`;
        if (mobileEl) mobileEl.textContent = `Cart(${total})`;
        
    } catch (e) {
        console.error('Ошибка при подсчете корзины:', e);
        if (el) el.textContent = 'Cart(0)';
        if (mobileEl) mobileEl.textContent = 'Cart(0)';
    }
};

// Запускаем подсчет при загрузке любой страницы
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.updateHeaderCartCount === 'function') {
        window.updateHeaderCartCount();
    }
});