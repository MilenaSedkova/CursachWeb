document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('successToast');

    if (form) {
        form.addEventListener('submit', async function(e) {
            // Останавливаем перезагрузку страницы
            e.preventDefault();

            const submitBtn = form.querySelector('.btn-send');
            const originalBtnText = submitBtn.textContent;

            // 1. Собираем данные из полей
            const messageData = {
                name: document.getElementById('contactName').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                company: document.getElementById('contactCompany').value.trim(), // Может быть пустым
                subject: document.getElementById('contactSubject').value.trim(),
                message: document.getElementById('contactMessage').value.trim(),
                date: new Date().toISOString() // Добавляем дату отправки
            };

            // 2. Блокируем кнопку и меняем текст на время отправки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // 3. Отправляем POST-запрос на сервер
                // Убедись, что URL совпадает с адресом твоего API
                const response = await fetch('http://localhost:3000/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageData)
                });

                if (!response.ok) {
                    throw new Error('Ошибка при отправке на сервер');
                }

                // 4. Успешная отправка: показываем тост и очищаем форму
                toast.classList.add('show');
                form.reset();

                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);

            } catch (error) {
                console.error('Ошибка отправки сообщения:', error);
                alert('Oops! Something went wrong. Please try again later.');
            } finally {
                // 5. В любом случае возвращаем кнопку в исходное состояние
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});