const CONFIG = {
    UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
    NUMBERS: '0123456789',
    SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    STORAGE_KEY: 'savedPasswords',
};

const DOM = {
    passwordLength: document.getElementById('passwordLength'),
    lengthValue: document.getElementById('lengthValue'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    saveBtn: document.getElementById('saveBtn'),
    generatedPassword: document.getElementById('generatedPassword'),
    accountName: document.getElementById('accountName'),
    strengthBars: document.querySelectorAll('.strength-bar'),
    strengthText: document.getElementById('strengthText'),
    passwordsList: document.getElementById('passwordsList'),
};

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPasswordsFromStorage();
    updateLengthDisplay();
});

function setupEventListeners() {
    DOM.passwordLength.addEventListener('input', updateLengthDisplay);
    DOM.generateBtn.addEventListener('click', generatePassword);
    DOM.copyBtn.addEventListener('click', copyToClipboard);
    DOM.saveBtn.addEventListener('click', savePassword);
}

function updateLengthDisplay() {
    DOM.lengthValue.textContent = DOM.passwordLength.value;
}

function generatePassword() {
    if (!isAtLeastOneCheckboxChecked()) {
        showError('Vyberte aspoň jeden typ znakov!');
        return;
    }

    DOM.generateBtn.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        DOM.generateBtn.style.animation = '';
    }, 500);

    let charset = '';
    if (DOM.uppercase.checked) charset += CONFIG.UPPERCASE;
    if (DOM.lowercase.checked) charset += CONFIG.LOWERCASE;
    if (DOM.numbers.checked) charset += CONFIG.NUMBERS;
    if (DOM.symbols.checked) charset += CONFIG.SYMBOLS;

    const length = parseInt(DOM.passwordLength.value);
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    DOM.generatedPassword.value = password;
    DOM.generatedPassword.style.animation = 'none';
    setTimeout(() => {
        DOM.generatedPassword.style.animation = 'pulse 0.4s ease';
    }, 10);
    
    updatePasswordStrength(password);
}

function isAtLeastOneCheckboxChecked() {
    return (
        DOM.uppercase.checked ||
        DOM.lowercase.checked ||
        DOM.numbers.checked ||
        DOM.symbols.checked
    );
}

function updatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    if (hasUpper + hasLower + hasNumber + hasSymbol >= 3) strength++;

    updateStrengthDisplay(strength);
}

function updateStrengthDisplay(strength) {
    DOM.strengthBars.forEach(bar => {
        bar.classList.remove('active', 'medium', 'good', 'strong');
    });
    DOM.strengthText.classList.remove('weak', 'medium', 'good', 'strong');
    DOM.strengthText.textContent = '—';

    if (strength === 0) {
        DOM.strengthText.textContent = 'Slabé';
        DOM.strengthText.classList.add('weak');
    } else if (strength === 1) {
        DOM.strengthBars[0].classList.add('active');
        DOM.strengthText.textContent = '🔴 Slabé';
        DOM.strengthText.classList.add('weak');
    } else if (strength === 2) {
        DOM.strengthBars[0].classList.add('medium');
        DOM.strengthBars[1].classList.add('medium');
        DOM.strengthText.textContent = '🟠 Stredné';
        DOM.strengthText.classList.add('medium');
    } else if (strength === 3) {
        DOM.strengthBars[0].classList.add('good');
        DOM.strengthBars[1].classList.add('good');
        DOM.strengthBars[2].classList.add('good');
        DOM.strengthText.textContent = '🟡 Dobré';
        DOM.strengthText.classList.add('good');
    } else if (strength >= 4) {
        DOM.strengthBars[0].classList.add('strong');
        DOM.strengthBars[1].classList.add('strong');
        DOM.strengthBars[2].classList.add('strong');
        DOM.strengthBars[3].classList.add('strong');
        DOM.strengthText.textContent = '🟢 Silné';
        DOM.strengthText.classList.add('strong');
    }
}

function copyToClipboard() {
    const password = DOM.generatedPassword.value;

    if (!password) {
        showError('Najskôr vygeneruj heslo!');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        showNotification('✓ Skopírované!', 'success');
        DOM.copyBtn.style.animation = 'heartbeat 0.5s ease';
        
        const originalText = DOM.copyBtn.textContent;
        DOM.copyBtn.textContent = '✓';
        DOM.copyBtn.style.background = 'var(--success-color)';

        setTimeout(() => {
            DOM.copyBtn.textContent = originalText;
            DOM.copyBtn.style.background = '';
            DOM.copyBtn.style.animation = '';
        }, 2000);
    }).catch(() => {
        showError('Chyba pri kopírovaní!');
    });
}

function savePassword() {
    const password = DOM.generatedPassword.value;
    const accountName = DOM.accountName.value.trim();

    if (!password) {
        showError('Najskôr vygeneruj heslo!');
        return;
    }

    if (!accountName) {
        showError('Zadaj názov účtu!');
        return;
    }

    DOM.saveBtn.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        DOM.saveBtn.style.animation = '';
    }, 500);

    const savedPasswords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');

    if (savedPasswords.some(item => item.name.toLowerCase() === accountName.toLowerCase())) {
        showError('Heslo s týmto názvom už existuje!');
        return;
    }

    const passwordEntry = {
        id: Date.now(),
        name: accountName,
        password: password,
        createdAt: new Date().toLocaleString('sk-SK'),
    };

    savedPasswords.push(passwordEntry);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(savedPasswords));

    DOM.accountName.style.animation = 'pulse 0.3s ease';
    DOM.generatedPassword.style.animation = 'pulse 0.3s ease';
    
    setTimeout(() => {
        DOM.accountName.value = '';
        DOM.generatedPassword.value = '';
        DOM.strengthText.textContent = '—';
        DOM.strengthBars.forEach(bar => bar.classList.remove('active', 'medium', 'good', 'strong'));
        DOM.accountName.style.animation = '';
        DOM.generatedPassword.style.animation = '';
    }, 150);

    showNotification('💾 Heslo uložené!', 'success');
    loadPasswordsFromStorage();
}

function loadPasswordsFromStorage() {
    const savedPasswords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');

    if (savedPasswords.length === 0) {
        DOM.passwordsList.innerHTML = `
            <div class="empty-state">
                <p>🔒 Zatiaľ žiadne uložené heslá. Vygeneruj a ulož svoje prvé heslo!</p>
            </div>
        `;
        return;
    }

    DOM.passwordsList.innerHTML = '';

    savedPasswords.forEach(entry => {
        const passwordItem = createPasswordItem(entry);
        DOM.passwordsList.appendChild(passwordItem);
    });
}

function createPasswordItem(entry) {
    const item = document.createElement('div');
    item.className = 'password-item';
    item.dataset.id = entry.id;

    const maskedPassword = '•'.repeat(entry.password.length);

    item.innerHTML = `
        <div class="password-item-icon">🔐</div>
        <div class="password-item-content">
            <div class="password-item-name">${escapeHtml(entry.name)}</div>
            <div class="password-item-password">${escapeHtml(entry.password)}</div>
            <div class="password-item-masked">${maskedPassword}</div>
        </div>
        <div class="password-item-actions">
            <button class="btn btn-view btn-small toggle-visibility">👁️ Zobraziť</button>
            <button class="btn btn-danger btn-small delete-btn">🗑️ Zmazať</button>
        </div>
    `;

    item.querySelector('.toggle-visibility').addEventListener('click', () => {
        togglePasswordVisibility(item, entry.password);
    });

    item.querySelector('.delete-btn').addEventListener('click', () => {
        deletePassword(entry.id);
    });

    return item;
}

function togglePasswordVisibility(element, password) {
    const isRevealed = element.classList.toggle('revealed');
    const button = element.querySelector('.toggle-visibility');
    const maskedPassword = '•'.repeat(password.length);
    const passwordDiv = element.querySelector('.password-item-password');

    passwordDiv.style.animation = 'none';
    setTimeout(() => {
        if (isRevealed) {
            button.textContent = '🙈 Skryť';
            passwordDiv.textContent = password;
            button.style.animation = 'pulse 0.3s ease';
        } else {
            button.textContent = '👁️ Zobraziť';
            passwordDiv.textContent = maskedPassword;
            button.style.animation = 'pulse 0.3s ease';
        }
        setTimeout(() => {
            button.style.animation = '';
        }, 300);
    }, 10);
}

function deletePassword(id) {
    if (!confirm('Naozaj chceš zmazať toto heslo?')) {
        return;
    }

    const passwordItem = document.querySelector(`[data-id="${id}"]`);
    if (passwordItem) {
        passwordItem.style.animation = 'slideOut 0.4s ease forwards';
    }

    setTimeout(() => {
        let savedPasswords = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        savedPasswords = savedPasswords.filter(item => item.id !== id);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(savedPasswords));

        showNotification('🗑️ Heslo zmazané!', 'success');
        loadPasswordsFromStorage();
    }, 400);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function showError(message) {
    showNotification('❌ ' + message, 'error');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
