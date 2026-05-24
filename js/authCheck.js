document.addEventListener('DOMContentLoaded', () => {
    // 1. Получаем пользователя из хранилища
    const userJson = localStorage.getItem('currentUser');
    
    // Ищем навигационное меню
    const navUl = document.querySelector('.nav-menu ul');
    const mobileNavUl = document.querySelector('.mobile-nav ul');

    if (userJson && navUl) {
        // Пользователь авторизован!
        const user = JSON.parse(userJson);
        const displayName = user.firstName || user.nickname;

        // Создаем HTML для личного кабинета (убираем Login/Register, добавляем имя и выход)
        const loggedInMenuHTML = `
            <li><a href="/homepage.html">Home</a></li>
            <li><a href="/html/AboutUs.html">About</a></li>
            <li><a href="/html/Shop.html">Shop</a></li>
            <li class="user-profile">
                <a href="#" style="color: #669C61; font-weight: 700;"> ${displayName}</a>
            </li>
            <li><a href="#" id="logoutBtn" style="color: #669C61;">Logout</a></li>
        `;

        navUl.innerHTML = loggedInMenuHTML;
        if(mobileNavUl) mobileNavUl.innerHTML = loggedInMenuHTML;

        // Добавляем обработчик для кнопки выхода
        document.querySelectorAll('#logoutBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser'); // Удаляем сессию
                window.location.reload(); // Перезагружаем страницу
            });
        });
    }
});