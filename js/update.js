// 🔄 update.js - Обновление счётчика корзины в хедере
const API_URL = 'http://localhost:3000';

window.updateHeaderCartCount = async function() {
    const el = document.getElementById('cartCount');
    if (!el) return;

    // 1. Узнаем, кто сейчас на сайте
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        // Если не авторизован - корзина всегда (0)
        el.textContent = `Cart(0)`;
        return; 
    }

    const user = JSON.parse(userJson);
    
    try {
        // 2. Делаем запрос к серверу С ФИЛЬТРОМ по userId
        const res = await fetch(`${API_URL}/cartItems?userId=${user.id}`);
        const items = await res.json();
        
        const total = Array.isArray(items) ? items.reduce((s, it) => s + (it.quantity || 1), 0) : 0;
        el.textContent = `Cart(${total})`;
        
        // Кэшируем корзину конкретного юзера (чтобы не пересекались при смене аккаунтов)
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items)); 
    } catch {
        const items = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
        const total = items.reduce((s, it) => s + (it.quantity || 1), 0);
        el.textContent = `Cart(${total})`;
    }
};

document.addEventListener('DOMContentLoaded', () => window.updateHeaderCartCount?.());
// Обновляем слушатель событий для новой структуры кэша
window.addEventListener('storage', e => { 
    if (e.key && e.key.startsWith('cart_')) window.updateHeaderCartCount?.(); 
});
