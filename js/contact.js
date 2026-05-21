document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Находим форму и уведомление
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('successToast');

    if (form) {
        form.addEventListener('submit', function(e) {
            // ❌ Останавливаем стандартную отправку (перезагрузку страницы)
            e.preventDefault();

            // ✅ Здесь можно добавить код отправки данных на сервер (fetch/axios)
            console.log("Форма отправлена!");

            // ✅ Показываем уведомление
            toast.classList.add('show');

            // ✅ Очищаем поля формы
            form.reset();

            // ✅ Скрываем уведомление через 3 секунды
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        });
    }
});