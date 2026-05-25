// Функция для проверки правильности email (заменяет наш отсутствующий validators.js)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

const form = document.getElementById('newsletterForm');
const emailInput = document.getElementById('newsletterEmail');
const submitBtn = document.getElementById('newsletterBtn');
const statusDiv = document.getElementById('newsletterStatus'); 

function initNewsletter() {
  if (!form || !emailInput || !submitBtn || !statusDiv) return; // Защита от ошибок

  // Живая валидация при вводе
  form.addEventListener('input', (e) => {
    if (e.target === emailInput) {
      statusDiv.textContent = ''; // Очищаем статус
      const isValid = validateEmail(emailInput.value.trim());
      submitBtn.disabled = !isValid;
    }
  });

  form.addEventListener('submit', handleSubscribe);
}

// Функция-помощник для вывода текста прямо на баннер
function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  
  if (type === 'error') {
    statusDiv.style.color = '#ff4d4f'; 
  } else {
    statusDiv.style.color = '#fff'; 
    statusDiv.style.fontWeight = 'bold';
  }

  setTimeout(() => {
    statusDiv.textContent = '';
  }, 4000);
}

async function handleSubscribe(e) {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!validateEmail(email)) {
    showStatus('Неверный формат Email', 'error');
    return;
  }

  const subscriberData = {
    email: email,
    subscribedAt: new Date().toISOString()
  };

  try {
    const checkResponse = await fetch(`http://localhost:3000/subscribers?email=${email}`);
    const existingSubscribers = await checkResponse.json();

    if (existingSubscribers.length > 0) {
      showStatus('Вы уже подписаны на наши новости!', 'error');
      return;
    }

    await fetch('http://localhost:3000/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriberData)
    });

    showStatus('Спасибо за подписку!', 'success');
    form.reset(); 
    submitBtn.disabled = true; 

  } catch (error) {
    console.error('Newsletter Error:', error);
    showStatus('Ошибка сервера. Попробуйте позже.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initNewsletter);