window.updateHeaderCartCount = async function() {
    const el = document.getElementById('cartCount');
    const mobileEl = document.getElementById('mobileCartCount'); 

    if (!el && !mobileEl) return;

    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        if (el) el.textContent = 'Cart(0)';
        if (mobileEl) mobileEl.textContent = 'Cart(0)';
        return; 
    }

    const user = JSON.parse(userJson);
    try {
        // Запрашиваем всё и фильтруем руками
        const res = await fetch(`http://localhost:3000/cartItems`);
        const allItems = await res.json();
        
        let items = allItems.filter(item => String(item.userId) === String(user.id));
        if (items.length === 0 && allItems.length > 0) items = allItems; // Аварийный вывод

        const total = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
        
        if (el) el.textContent = `Cart(${total})`;
        if (mobileEl) mobileEl.textContent = `Cart(${total})`;
    } catch (e) {
        console.error('Ошибка при подсчете корзины:', e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.updateHeaderCartCount === 'function') {
        window.updateHeaderCartCount();
    }
});