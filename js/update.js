// Функция обновления счётчика
function updateCartCountOnAllPages() {
    const cartCountEl = document.getElementById('cartCount');
    if (!cartCountEl) {
        console.log('Элемент #cartCount не найден');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountEl.textContent = `Cart(${total})`;
    console.log('Счётчик обновлён:', total);
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', updateCartCountOnAllPages);

// Обновляем при изменении localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartCountOnAllPages();
    }
});