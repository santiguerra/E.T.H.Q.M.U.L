const codeDisplay = document.getElementById('code-display');
const digits = Array.from(codeDisplay.querySelectorAll('.digit'));
const accessBtn = document.getElementById('access-btn');
const errorMsg = document.getElementById('error-msg');
const dataStream = document.querySelector('.data-stream');

const TARGET_CODE = '2351';
let currentInput = '';

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    // Only accept numbers
    if (/[0-9]/.test(e.key) && currentInput.length < 4) {
        currentInput += e.key;
        updateDisplay();
        playTypingSound();
    } else if (e.key === 'Backspace' && currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
        playTypingSound();
    } else if (e.key === 'Enter') {
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
    // A simple beep sound using AudioContext (optional but adds to the vibe)
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // value in hertz
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } catch(e) {
        // AudioContext not supported or blocked, ignore
    }
}

accessBtn.addEventListener('click', checkAccess);

function checkAccess() {
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

        errorMsg.textContent = 'SYSTEM UNLOCKED. REDIRECTING...';
        errorMsg.style.color = 'var(--terminal-green)';
        errorMsg.classList.add('show');
        
        dataStream.innerHTML += '<br>// ACCESS_GRANTED: WELCOME ADMIN';
        
        // Glitch effect on background
        document.querySelector('.background-container').style.animationDuration = '0.2s';
        
        // Simulating redirect or unlock action
        setTimeout(() => {
            alert('¡Acceso concedido! Sistema desbloqueado.');
        }, 2000);

    } else {
        // Error
        errorMsg.textContent = 'ACCESS DENIED: INVALID CODE';
        errorMsg.style.color = '#ff0000';
        errorMsg.classList.remove('show');
        // trigger reflow to restart animation
        void errorMsg.offsetWidth; 
        errorMsg.classList.add('show');
        
        dataStream.innerHTML += '<br>// ERROR: UNAUTHORIZED ATTEMPT LOGGED';
        
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
