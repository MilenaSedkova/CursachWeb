// 🔄 update.js - Обновление счётчика корзины в хедере
const API_URL = 'http://localhost:3000';

window.updateHeaderCartCount = async function() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    
    try {
        const res = await fetch(`${API_URL}/cartItems`);
        const items = await res.json();
        const total = Array.isArray(items) ? items.reduce((s, it) => s + (it.quantity || 1), 0) : 0;
        el.textContent = `Cart(${total})`;
        localStorage.setItem('cart', JSON.stringify(items)); // кэш
    } catch {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        const total = items.reduce((s, it) => s + (it.quantity || 1), 0);
        el.textContent = `Cart(${total})`;
    }
};

// Автозапуск + синхронизация вкладок
document.addEventListener('DOMContentLoaded', () => window.updateHeaderCartCount?.());
window.addEventListener('storage', e => { if (e.key === 'cart') window.updateHeaderCartCount?.(); });