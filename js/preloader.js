// Ждем полной загрузки всех ресурсов страницы
window.addEventListener('load', () => {
    const preloader = document.getElementById('sitePreloader');
    if (preloader) {
        // Добавляем класс плавного исчезновения
        preloader.classList.add('fade-out');
        
        // Полностью удаляем из DOM-дерева через 400мс, чтобы не мешал кликам
        setTimeout(() => {
            preloader.remove();
        }, 400);
    }
});