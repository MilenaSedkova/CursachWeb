window.AppUI = {
    showModal: function(title, contentHtml) {
        let overlay = document.getElementById('appModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'app-modal-overlay';
            overlay.id = 'appModalOverlay';
            overlay.innerHTML = `
                <div class="app-modal" role="dialog" aria-modal="true">
                    <div class="app-modal-header">
                        <h3 class="app-modal-title" id="appModalTitle"></h3>
                        <button class="app-modal-close" id="appModalClose" aria-label="Close">&times;</button>
                    </div>
                    <div class="app-modal-body" id="appModalBody"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal();
            });
            // Close on button click
            document.getElementById('appModalClose').addEventListener('click', () => this.closeModal());
        }
        
        document.getElementById('appModalTitle').innerText = title;
        document.getElementById('appModalBody').innerHTML = contentHtml;
        overlay.classList.add('active');
    },

    closeModal: function() {
        const overlay = document.getElementById('appModalOverlay');
        if (overlay) overlay.classList.remove('active');
    },

    showToast: function(message, duration = 3000) {
        let container = document.getElementById('appToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.className = 'app-toast-container';
            container.id = 'appToastContainer';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'app-toast';
        toast.innerText = message;
        container.appendChild(toast);

        // trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

const defaultSettings = {
    theme: 'light', // 'light' or 'dark'
    lang: 'en', // 'en' or 'ru'
    a11y: {
        enabled: false,
        fontScale: 1, // 1, 1.5, 2
        themeIndex: 1, // 1-5
        hideImages: false
    }
};

let appSettings = JSON.parse(localStorage.getItem('appSettings')) || defaultSettings;

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
}


function applyTheme() {
    if (appSettings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    // Update all theme buttons
    document.querySelectorAll('.control-btn').forEach(btn => {
        if (btn.innerText.trim().toLowerCase() === 'li' || btn.innerText.trim().toLowerCase() === 'd') {
            btn.innerText = appSettings.theme === 'dark' ? 'd' : 'li';
        }
    });
}

function applyA11y() {
    const { enabled, fontScale, themeIndex, hideImages } = appSettings.a11y;
    
    // Remove previous classes
    document.body.classList.remove('a11y-mode', 'a11y-theme-1', 'a11y-theme-2', 'a11y-theme-3', 'a11y-theme-4', 'a11y-theme-5', 'a11y-no-images');
    
    if (enabled) {
        document.body.classList.add('a11y-mode');
        document.body.classList.add(`a11y-theme-${themeIndex}`);
        document.body.style.setProperty('--a11y-font-scale', fontScale);
        
        if (hideImages) {
            document.body.classList.add('a11y-no-images');
            processAltText(true);
        } else {
            processAltText(false);
        }
    } else {
        document.body.style.removeProperty('--a11y-font-scale');
        processAltText(false);
    }
}

function processAltText(show) {
    if (show) {
        document.querySelectorAll('img').forEach(img => {
            // ИГНОРИРУЕМ декоративные картинки (логотипы, иконки кнопок, фоны, стрелочки)
            const parentClass = img.parentElement ? img.parentElement.className : '';
            if (
                img.closest('.logo') || 
                img.closest('.btn-primary') || 
                img.closest('.cart-btn') || 
                img.closest('.search-btn') || 
                img.closest('.about-hero-bg') || 
                img.closest('.newsletter-bg-image') ||
                img.classList.contains('btn-arrow') ||
                img.classList.contains('a11y-ignore') // Специальный класс, если захочешь скрыть что-то еще
            ) {
                return; // Пропускаем эти картинки, не создаем для них Alt-текст
            }

            // Для остальных картинок создаем текст-заглушку
            if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('a11y-alt-text')) {
                const span = document.createElement('span');
                span.className = 'a11y-alt-text';
                span.innerText = img.alt || '[Image]';
                img.parentNode.insertBefore(span, img.nextSibling);
            }
        });
    } else {
        document.querySelectorAll('.a11y-alt-text').forEach(span => span.remove());
    }
}

function applyLanguage() {
    // Update button texts
    document.querySelectorAll('.control-btn').forEach(btn => {
        if (btn.innerText.trim().toLowerCase() === 'en' || btn.innerText.trim().toLowerCase() === 'ru') {
            btn.innerText = appSettings.lang;
        }
    });

    if (window.AppI18n && typeof window.AppI18n.translate === 'function') {
        window.AppI18n.translate(appSettings.lang);
    }
}

function openA11yModal() {
    const a11y = appSettings.a11y;
    const html = `
        <div class="a11y-option-group">
            <h4>Включить режим / Enable Mode</h4>
            <div class="a11y-btn-group">
                <button class="a11y-btn ${!a11y.enabled ? 'active' : ''}" onclick="setA11yEnabled(false)">Off</button>
                <button class="a11y-btn ${a11y.enabled ? 'active' : ''}" onclick="setA11yEnabled(true)">On</button>
            </div>
        </div>
        <div class="a11y-option-group" ${!a11y.enabled ? 'style="opacity:0.5; pointer-events:none;"' : ''}>
            <h4>Размер шрифта / Font Size</h4>
            <div class="a11y-btn-group">
                <button class="a11y-btn ${a11y.fontScale === 1 ? 'active' : ''}" onclick="setA11yFont(1)">100%</button>
                <button class="a11y-btn ${a11y.fontScale === 1.5 ? 'active' : ''}" onclick="setA11yFont(1.5)">150%</button>
                <button class="a11y-btn ${a11y.fontScale === 2 ? 'active' : ''}" onclick="setA11yFont(2)">200%</button>
            </div>
        </div>
        <div class="a11y-option-group" ${!a11y.enabled ? 'style="opacity:0.5; pointer-events:none;"' : ''}>
            <h4>Цветовая схема / Color Scheme</h4>
            <div class="a11y-btn-group">
                <button class="a11y-btn ${a11y.themeIndex === 1 ? 'active' : ''}" onclick="setA11yTheme(1)">Black/White</button>
                <button class="a11y-btn ${a11y.themeIndex === 2 ? 'active' : ''}" onclick="setA11yTheme(2)">Green/Black</button>
                <button class="a11y-btn ${a11y.themeIndex === 3 ? 'active' : ''}" onclick="setA11yTheme(3)">White/Black</button>
                <button class="a11y-btn ${a11y.themeIndex === 4 ? 'active' : ''}" onclick="setA11yTheme(4)">Brown/Beige</button>
                <button class="a11y-btn ${a11y.themeIndex === 5 ? 'active' : ''}" onclick="setA11yTheme(5)">DarkBlue/LightBlue</button>
            </div>
        </div>
        <div class="a11y-option-group" ${!a11y.enabled ? 'style="opacity:0.5; pointer-events:none;"' : ''}>
            <h4>Изображения / Images</h4>
            <div class="a11y-btn-group">
                <button class="a11y-btn ${!a11y.hideImages ? 'active' : ''}" onclick="setA11yImages(false)">Show</button>
                <button class="a11y-btn ${a11y.hideImages ? 'active' : ''}" onclick="setA11yImages(true)">Hide</button>
            </div>
        </div>
        <hr style="border: 0; border-top: 1px solid var(--border-color, #eee); margin: 20px 0;">
        <button class="a11y-btn" style="width:100%; text-align:center; background:#cc0000; color:#fff; border:none;" onclick="resetAllSettings()">Reset All Settings</button>
    `;
    AppUI.showModal('Accessibility / Слабовидящим', html);
}

// Modal actions
window.setA11yEnabled = (val) => { appSettings.a11y.enabled = val; updateA11yAndReopen(); };
window.setA11yFont = (val) => { appSettings.a11y.fontScale = val; updateA11yAndReopen(); };
window.setA11yTheme = (val) => { appSettings.a11y.themeIndex = val; updateA11yAndReopen(); };
window.setA11yImages = (val) => { appSettings.a11y.hideImages = val; updateA11yAndReopen(); };
window.resetAllSettings = () => {
    // возвращаем текущие настройки к эталонным (глубокое копирование)
    appSettings = JSON.parse(JSON.stringify(defaultSettings));
    
    saveSettings();
    
    applyTheme();
    applyA11y();
    applyLanguage();
    
    AppUI.showToast(appSettings.lang === 'ru' ? 'Все настройки сброшены' : 'All settings reset');
    
    AppUI.closeModal();
};

function updateA11yAndReopen() {
    saveSettings();
    applyA11y();
    openA11yModal(); 
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial apply
    applyTheme();
    applyA11y();
    applyLanguage();

    // Bind header buttons
    document.body.addEventListener('click', (e) => {
        // Ищем ближайшую кнопку контроля
        const btn = e.target.closest('.control-btn');
        if (!btn) return; // Если клик был не по кнопке - игнорируем

        // 1. Проверяем кнопку A+ по ID, чтобы перевод текста её не ломал!
        if (btn.id === 'toggleA11yModal') {
            openA11yModal();
            return;
        }

        const text = btn.innerText.trim().toLowerCase();

        const globalResetBtn = document.getElementById('globalResetBtn');
    if (globalResetBtn) {
        globalResetBtn.addEventListener('click', () => {
            window.resetAllSettings(); 
        });
    }
        
        // 2. Логика переключения темы (li / d)
        if (text === 'li' || text === 'd') {
            appSettings.theme = appSettings.theme === 'light' ? 'dark' : 'light';
            saveSettings();
            applyTheme();
            AppUI.showToast(appSettings.lang === 'ru' ? 'Тема изменена' : 'Theme changed');
        } 
        // 3. Логика переключения языка (en / ru)
        else if (text === 'en' || text === 'ru') {
            appSettings.lang = appSettings.lang === 'en' ? 'ru' : 'en';
            saveSettings();
            applyLanguage();
            AppUI.showToast(appSettings.lang === 'ru' ? 'Язык изменен на Русский' : 'Language changed to English');
        }
    });
});


document.addEventListener('click', (e) => {
    // Ищем кнопки переключения языка (у них класс control-btn)
    const langBtn = e.target.closest('.control-btn');
    
    if (langBtn) {
        const btnText = langBtn.textContent.trim().toLowerCase();
        
        if (btnText === 'en' || btnText === 'ru') {
            
            // Даем браузеру миллисекунду, чтобы он успел сохранить новый язык в localStorage
            setTimeout(() => {
                if (typeof loadTestimonials === 'function') {
                    // Заставляем слайдер заново подгрузить тексты из db.json!
                    loadTestimonials(); 
                }
            }, 100);
        }
    }
}); 
