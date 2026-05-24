// js/auth-check.js
document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('currentUser');
    const navUl = document.querySelector('.nav-menu ul');
    const mobileNavUl = document.querySelector('.mobile-nav ul');

    if (userJson && navUl) {
        const user = JSON.parse(userJson);
        const displayName = user.firstName || user.nickname;
        
        // ПРОВЕРЯЕМ РОЛЬ ПОЛЬЗОВАТЕЛЯ
        const isAdmin = user.role === 'admin';

        const adminLinkHTML = isAdmin 
            ? `<li><a href="/html/Admin.html" style="color: #E3A92A; font-weight: 700;">Admin Panel</a></li>` 
            : '';

        // Создаем HTML
        const loggedInMenuHTML = `
            <li><a href="/homepage.html">Home</a></li>
            <li><a href="/html/AboutUs.html">About</a></li>
            <li><a href="/html/Shop.html">Shop</a></li>
            ${adminLinkHTML} <li class="user-profile">
                <a href="#" style="color: #669C61; font-weight: 700;">${displayName}</a>
            </li>
            <li><a href="#" id="logoutBtn" style="color: #669C61; font-weight: 600;">Logout</a></li>
        `;

        navUl.innerHTML = loggedInMenuHTML;
        if(mobileNavUl) mobileNavUl.innerHTML = loggedInMenuHTML;

        // Обработчик выхода
        document.querySelectorAll('#logoutBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = '/homepage.html'; 
            });
        });
    }
});
