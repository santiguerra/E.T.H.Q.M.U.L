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
        
        // Transition to dashboard
        setTimeout(() => {
            const accessScreen = document.querySelector('.glitch-container');
            const dashboard = document.getElementById('dashboard');
            accessScreen.classList.add('fade-out');
            setTimeout(() => {
                accessScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.body.style.height = 'auto';
                document.body.style.alignItems = 'flex-start';
                document.body.style.paddingTop = '40px';
                dashboard.classList.add('fade-in');
                initMission01();
                initMission02();
                initMission03();
                applyStoredProgress();
                updateProgressDisplay();
            }, 600);
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

// --- Mission system ---
const MISSION_01_ANSWER = 'TODO EMPIEZA AQUI';
const PROGRESS_KEY = 'mission_progress';

function getMissionProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch { return {}; }
}

function saveMissionProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function updateProgressDisplay() {
    const progress = getMissionProgress();
    const solved = Object.values(progress).filter(v => v === 'solved').length;
    const filled = document.getElementById('progress-filled');
    const empty = document.getElementById('progress-empty');
    const count = document.getElementById('progress-count');
    if (!filled || !empty || !count) return;
    filled.textContent = '█'.repeat(solved);
    empty.textContent = '░'.repeat(10 - solved);
    count.textContent = `${solved}/10`;
}

function applyStoredProgress() {
    const progress = getMissionProgress();
    if (progress['01'] === 'solved') solveMission01(true);
    if (progress['02'] === 'solved') solveMission02(true);
    if (progress['03'] === 'solved') solveMission03(true);
}

function solveMission01(silent) {
    const row01 = document.querySelector('.mission-row[data-mission="01"]');
    const row02 = document.querySelector('.mission-row[data-mission="02"]');
    const status01 = row01.querySelector('.mission-status');

    row01.classList.remove('active');
    row01.classList.add('solved');
    status01.className = 'mission-status solved-status';
    status01.innerHTML = 'DECRYPTED ✓';

    if (row02) {
        row02.classList.remove('locked');
        row02.classList.add('active');
        const status02 = row02.querySelector('.mission-status');
        status02.className = 'mission-status initializing';
        status02.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission01-result');
        result.textContent = '> DECRYPTION_SUCCESSFUL\n> Tu primer regalo está donde el agua hierve pero no se toma sola.\n> MISSION_02 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['01'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

// Mission 01 submit logic
function initMission01() {
    const input = document.getElementById('mission01-input');
    const btn = document.getElementById('mission01-submit');
    if (!input || !btn) return;

    const submit = () => {
        const answer = input.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_01_ANSWER) {
            input.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            solveMission01(false);
        } else {
            const result = document.getElementById('mission01-result');
            result.textContent = '> DECRYPTION_FAILED — INVALID KEY';
            result.className = 'mission-result fail show';
            input.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

// --- Mission 02 ---
const ALICE_ANSWERS = [3, 6, 12, 2, 5, 4, 1, 10];
const MISSION_02_CODE = '2114';

function solveMission02(silent) {
    const row02 = document.querySelector('.mission-row[data-mission="02"]');
    const row03 = document.querySelector('.mission-row[data-mission="03"]');
    const status02 = row02.querySelector('.mission-status');

    row02.classList.remove('active');
    row02.classList.add('solved');
    status02.className = 'mission-status solved-status';
    status02.innerHTML = 'DECRYPTED ✓';

    if (row03) {
        row03.classList.remove('locked');
        row03.classList.add('active');
        const status03 = row03.querySelector('.mission-status');
        status03.className = 'mission-status initializing';
        status03.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission02-result');
        result.textContent = '> ALICE_PROTOCOL: COMPLETE\n> Tu segundo regalo viene en camino. Espéralo.\n> MISSION_03 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['02'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission02() {
    const submitBtn = document.getElementById('mission02-submit');
    const codeInput = document.getElementById('mission02-code');
    const aliceInputs = document.querySelectorAll('.alice-input');
    const questionsResult = document.getElementById('alice-questions-result');
    const missionResult = document.getElementById('mission02-result');
    if (!submitBtn) return;

    let questionsVerified = false;

    const verifyQuestions = () => {
        const rows = document.querySelectorAll('.alice-row');
        const wrong = [];

        aliceInputs.forEach((input, i) => {
            const val = parseInt(input.value, 10);
            const row = rows[i];
            if (val === ALICE_ANSWERS[i]) {
                row.classList.remove('incorrect');
                row.classList.add('correct');
            } else {
                row.classList.remove('correct');
                row.classList.add('incorrect');
                wrong.push(`R${i + 1}`);
            }
        });

        if (wrong.length > 0) {
            questionsResult.textContent = `> ERROR: ${wrong.join(', ')} — INCORRECT DATA`;
            questionsResult.className = 'mission-result fail show';
            return false;
        }

        questionsResult.textContent = '> DATA_VERIFIED — ENTER FORMULA CODE';
        questionsResult.className = 'mission-result success show';
        aliceInputs.forEach(i => { i.disabled = true; });
        questionsVerified = true;
        codeInput.focus();
        return true;
    };

    const verifyCode = () => {
        if (!questionsVerified) {
            if (!verifyQuestions()) return;
        }
        const code = String(codeInput.value).trim();
        if (code === MISSION_02_CODE) {
            codeInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.4';
            solveMission02(false);
        } else {
            missionResult.textContent = '> DECRYPTION_FAILED — INVALID CODE';
            missionResult.className = 'mission-result fail show';
            codeInput.value = '';
            setTimeout(() => { missionResult.classList.remove('show'); }, 2000);
        }
    };

    submitBtn.addEventListener('click', () => {
        if (!questionsVerified) { verifyQuestions(); return; }
        verifyCode();
    });

    codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') verifyCode(); });
}

// --- Mission 03 ---
const MISSION_03_ANSWER = 'ABRIGO DEFECTOS';

function solveMission03(silent) {
    const row03 = document.querySelector('.mission-row[data-mission="03"]');
    const row04 = document.querySelector('.mission-row[data-mission="04"]');
    const status03 = row03.querySelector('.mission-status');

    row03.classList.remove('active');
    row03.classList.add('solved');
    status03.className = 'mission-status solved-status';
    status03.innerHTML = 'DECRYPTED ✓';

    if (row04) {
        row04.classList.remove('locked');
        row04.classList.add('active');
        const status04 = row04.querySelector('.mission-status');
        status04.className = 'mission-status initializing';
        status04.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission03-result');
        result.textContent = '> FRAGMENT_ANALYSIS: COMPLETE\n> "Así como tú le diste un nuevo brillo a mi vida, quiero que le des ese mismo brillo a este libro."\n> Tu tercer regalo viene en camino. Espéralo.\n> MISSION_04 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['03'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission03() {
    const btn = document.getElementById('mission03-submit');
    const finalInput = document.getElementById('mission03-input');
    const blankB = document.getElementById('blank-b');
    const blankE = document.getElementById('blank-e');
    if (!btn || !finalInput) return;

    // Auto-fill passphrase input when both blanks are filled
    const syncPassphrase = () => {
        const b = (blankB ? blankB.value.trim() : '');
        const e = (blankE ? blankE.value.trim() : '');
        if (b && e) finalInput.value = `${b} ${e}`;
    };

    if (blankB) blankB.addEventListener('input', syncPassphrase);
    if (blankE) blankE.addEventListener('input', syncPassphrase);

    const submit = () => {
        const answer = finalInput.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_03_ANSWER) {
            finalInput.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            if (blankB) blankB.disabled = true;
            if (blankE) blankE.disabled = true;
            solveMission03(false);
        } else {
            const result = document.getElementById('mission03-result');
            result.textContent = '> VERIFICATION_FAILED — INCORRECT PASSPHRASE';
            result.className = 'mission-result fail show';
            finalInput.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    finalInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

// Mission row click handlers — only toggle when clicking the .mission-info header
document.querySelectorAll('.mission-row').forEach(row => {
    const info = row.querySelector('.mission-info');
    if (!info) return;
    info.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        document.querySelectorAll('.mission-row.open').forEach(r => r.classList.remove('open'));
        if (!isOpen) row.classList.add('open');
    });
});

// Add blinking cursor effect to prompt
setInterval(() => {
    const dataStreamHTML = dataStream.innerHTML;
    if (dataStreamHTML.endsWith('_')) {
        dataStream.innerHTML = dataStreamHTML.slice(0, -1);
    } else {
        dataStream.innerHTML += '_';
    }
}, 500);
