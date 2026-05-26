document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bookingSectionContainer');
    if (!container) return;

    // 1. Проверяем авторизацию (ищем пользователя в localStorage)
    // Адаптируй под ключ, который используется в твоем проекте (например, 'currentUser' или 'user')
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));

    if (currentUser && currentUser.email) {
        // === ВАРИАНТ ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ ===
        renderBookingForm(container, currentUser);
    } else {
        // === ВАРИАНТ ДЛЯ ГОСТЯ ===
        renderAuthRequiredBanner(container);
    }
});

// Функция отрисовки формы
function renderBookingForm(container, user) {
    container.innerHTML = `
        <div class="booking-wrapper">
            <div class="prod-header pos-center">
                <span class="subtitle" style="font-family: 'Yellowtail', cursive; color: #7EB693; font-size: 2.2rem;">Consultation</span>
                <h2 class="section-title" style="color: #274C5B;">Book a Free Consultation</h2>
                <div class="user-badge-notice">
                    <img src="/pictures/ContactImages/MessageIcon.svg" alt="user">
                    <span>Booking for: <strong>${user.email}</strong></span>
                </div>
            </div>

            <form class="contact-form booking-form" id="consultationForm">
                <div class="form-group">
                    <label class="form-label">Preferred Date*</label>
                    <input type="date" id="bookingDate" class="form-input" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">Preferred Time*</label>
                    <select id="bookingTime" class="form-input" required>
                        <option value="" disabled selected>Select time slot</option>
                        <option value="10:00 - 11:00">10:00 - 11:00</option>
                        <option value="12:00 - 13:00">12:00 - 13:00</option>
                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                        <option value="16:00 - 17:00">16:00 - 17:00</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label class="form-label">What topics would you like to discuss?*</label>
                    <textarea id="bookingNotes" class="form-textarea" placeholder="Grow strategies, organic certification, delivery terms..." required></textarea>
                </div>
                <div class="btn-text-offset" style="text-align: center; margin-top: 30px;">
                    <button type="submit" class="btn-send" style="padding: 12px 40px !important;">Confirm Booking</button>
                </div>
            </form>
        </div>
    `;

    // Вешаем обработчик отправки на созданную форму
    document.getElementById('consultationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-send');
        
        const bookingData = {
            userEmail: user.email, // Email берется автоматически из системы!
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            notes: document.getElementById('bookingNotes').value.trim(),
            createdAt: new Date().toISOString()
        };

        btn.disabled = true;
        btn.textContent = 'Booking...';

        try {
            const response = await fetch('http://localhost:3000/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                // Используем твой successToast, который уже прописан в HTML
                const toast = document.getElementById('successToast');
                if (toast) {
                    toast.querySelector('.toast-text').textContent = 'Consultation booked successfully!';
                    toast.classList.add('show');
                    this.reset();
                    setTimeout(() => toast.classList.remove('show'), 3000);
                } else {
                    alert('Consultation booked successfully!');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Confirm Booking';
        }
    });
}

// Функция отрисовки заглушки, если пользователь не вошел
function renderAuthRequiredBanner(container) {
    container.innerHTML = `
        <div class="booking-lock-card">
            <span class="subtitle" style="font-family: 'Yellowtail', cursive; color: #7EB693; font-size: 2.2rem;">Exclusive Access</span>
            <h2 style="color: #274C5B; margin-bottom: 15px;">Want a Free Consultation?</h2>
            <p style="color: #525C60; max-width: 500px; margin: 0 auto 25px;">
                Consultations with our accredited farmers are available strictly to members of the Organick community. Please log in to your account.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <a href="/html/Login.html" class="btn-primary" style="padding: 10px 25px; background-color: #274C5B; color: white; border-radius: 8px; text-decoration: none;">Log In</a>
                <a href="/html/Register.html" class="btn-primary" style="padding: 10px 25px; background-color: #7EB693; color: white; border-radius: 8px; text-decoration: none;">Register</a>
            </div>
        </div>
    `;
}