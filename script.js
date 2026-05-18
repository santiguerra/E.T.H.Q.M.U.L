const codeDisplay = document.getElementById('code-display');
const digits = Array.from(codeDisplay.querySelectorAll('.digit'));
const accessBtn = document.getElementById('access-btn');
const errorMsg = document.getElementById('error-msg');
const dataStream = document.querySelector('.data-stream');
const hiddenInput = document.getElementById('hidden-code-input');
const terminalBody = document.querySelector('.terminal-body');

const TARGET_CODE = '2351';
let currentInput = '';

// --- Cooldown / Attempt System (localStorage based) ---
const MAX_ATTEMPTS = 2;

function getAttemptsData() {
    const todayStr = new Date().toDateString(); // E.g., "Mon May 18 2026"
    let count = parseInt(localStorage.getItem('attempts_count') || '0', 10);
    let lastDate = localStorage.getItem('last_attempt_date');

    if (lastDate !== todayStr) {
        count = 0;
        localStorage.setItem('attempts_count', '0');
        localStorage.setItem('last_attempt_date', todayStr);
    }
    return { count, date: todayStr };
}

function incrementAttempts() {
    const todayStr = new Date().toDateString();
    let count = parseInt(localStorage.getItem('attempts_count') || '0', 10) + 1;
    localStorage.setItem('attempts_count', count.toString());
    localStorage.setItem('last_attempt_date', todayStr);
    return count;
}

function checkLockdown() {
    const data = getAttemptsData();
    if (data.count >= MAX_ATTEMPTS) {
        applyLockdown();
        return true;
    }
    return false;
}

function applyLockdown() {
    hiddenInput.disabled = true;
    accessBtn.disabled = true;
    accessBtn.style.opacity = '0.3';
    accessBtn.style.pointerEvents = 'none';
    
    errorMsg.textContent = 'SYSTEM LOCKDOWN: MAX DAILY ATTEMPTS REACHED. TRY AGAIN TOMORROW.';
    errorMsg.style.color = '#ff0000';
    errorMsg.classList.add('show');
    
    // Show locked state on the digit display
    digits.forEach(d => {
        d.textContent = 'X';
        d.style.color = '#ff0000';
        d.style.borderBottomColor = '#ff0000';
        d.style.textShadow = '0 0 10px #ff0000';
    });
}

// --- Keyboard & Input Logic (Mobile Friendly) ---
// Focus the hidden input when clicking the terminal area
terminalBody.addEventListener('click', () => {
    if (!hiddenInput.disabled) {
        hiddenInput.focus();
    }
});

// Auto-focus on load (for desktop)
window.addEventListener('load', () => {
    if (!checkLockdown()) {
        hiddenInput.focus();
    }
});

hiddenInput.addEventListener('input', (e) => {
    // Only keep numeric digits
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) {
        val = val.slice(0, 4);
    }
    e.target.value = val;
    currentInput = val;
    updateDisplay();
    playTypingSound();
});

hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkAccess();
    }
});

function updateDisplay() {
    digits.forEach((digitEl, index) => {
        if (index < currentInput.length) {
            digitEl.textContent = currentInput[index];
            digitEl.classList.remove('empty');
            digitEl.classList.add('pulse');
        } else {
            digitEl.textContent = '_';
            digitEl.classList.add('empty');
            digitEl.classList.remove('pulse');
        }
    });
}

function playTypingSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
}

accessBtn.addEventListener('click', checkAccess);

function checkAccess() {
    if (checkLockdown()) return;

    if (currentInput.length < 4) {
        errorMsg.textContent = 'ERROR: ENTER 4 DIGITS';
        errorMsg.classList.add('show');
        return;
    }

    if (currentInput === TARGET_CODE) {
        // Success
        accessBtn.textContent = 'GRANTED_';
        accessBtn.style.borderColor = 'var(--terminal-green)';
        accessBtn.style.color = 'var(--terminal-green)';
        accessBtn.style.boxShadow = '0 0 20px var(--terminal-green)';
        
        digits.forEach(d => {
            d.style.color = 'var(--terminal-green)';
            d.style.borderBottomColor = 'var(--terminal-green)';
            d.style.textShadow = '0 0 10px var(--terminal-green)';
            d.classList.remove('pulse');
        });

        errorMsg.textContent = 'SYSTEM UNLOCKED.';
        errorMsg.style.color = 'var(--terminal-green)';
        errorMsg.classList.add('show');
        
        dataStream.innerHTML += '<br>// ACCESS_GRANTED: WELCOME ADMIN';
        
        document.querySelector('.background-container').style.animationDuration = '0.2s';
        
        // Simulating redirect or unlock action
        setTimeout(() => {
            alert('¡Acceso concedido! Sistema desbloqueado.');
            // window.location.href = 'https://github.com/santiguerra/E.T.H.Q.M.U.L';
        }, 2000);

    } else {
        // Increment attempts on fail
        const currentAttempts = incrementAttempts();
        const remaining = MAX_ATTEMPTS - currentAttempts;

        // Error
        errorMsg.style.color = '#ff0000';
        errorMsg.classList.remove('show');
        void errorMsg.offsetWidth; 
        errorMsg.classList.add('show');

        if (currentAttempts >= MAX_ATTEMPTS) {
            applyLockdown();
            dataStream.innerHTML += '<br>// SYSTEM LOCKDOWN TRIGGERED';
        } else {
            errorMsg.textContent = `ACCESS DENIED. ATTEMPTS REMAINING: ${remaining}`;
            dataStream.innerHTML += `<br>// ERROR: INVALID CODE. ${remaining} ATTEMPTS LEFT.`;
        }
        
        // Visual shake
        const terminal = document.querySelector('.terminal-container');
        terminal.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 400 });

        currentInput = '';
        hiddenInput.value = '';
        updateDisplay();
    }
}

// Add blinking cursor effect to prompt
setInterval(() => {
    const dataStreamHTML = dataStream.innerHTML;
    if (dataStreamHTML.endsWith('_')) {
        dataStream.innerHTML = dataStreamHTML.slice(0, -1);
    } else {
        dataStream.innerHTML += '_';
    }
}, 500);
