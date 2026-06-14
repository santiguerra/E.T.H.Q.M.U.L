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
                initMission04();
                initMission05();
                initMission06();
                initMission07();
                initMission08();
                initMission09();
                initMission10();
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
    if (solved === 10) {
        filled.classList.add('sweep');
    }
}

function applyStoredProgress() {
    const progress = getMissionProgress();
    if (progress['01'] === 'solved') solveMission01(true);
    if (progress['02'] === 'solved') solveMission02(true);
    if (progress['03'] === 'solved') solveMission03(true);
    if (progress['04'] === 'solved') solveMission04(true);
    if (progress['05'] === 'solved') solveMission05(true);
    if (progress['06'] === 'solved') solveMission06(true);
    if (progress['07'] === 'solved') solveMission07(true);
    if (progress['08'] === 'solved') solveMission08(true);
    if (progress['09'] === 'solved') solveMission09(true);
    if (progress['10'] === 'solved') solveMission10();
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
        result.textContent = '> DECRYPTION_SUCCESSFUL\n> Tu primer regalo ya te dije cual es.\n> MISSION_02 — UNLOCKED';
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
        result.textContent = '> ALICE_PROTOCOL: COMPLETE\n> Tu segundo regalo requiere un barista.\n> MISSION_03 — UNLOCKED';
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

// --- Mission 10 ---
const FINAL_MESSAGE = `Amor, este ya es el ultimo regalo de este jueguito para sacarte la rabia, pero el principal objetivo es sacarte una sonrisa por el tiempo que te demores resolviendo los puzzles. Quiero decirte que te amo mucho más de lo que te puedes imaginar, y que cada pista, cada acertijo y cada detalle de este recorrido los preparé pensando únicamente en ti. Sé que a veces los días se ponen pesados, que hay cosas que te frustran o que incluso yo puedo hacerte enojar, pero quiero ser siempre esa persona que te ayude a aligerar la carga y a cambiar un mal rato por un buen recuerdo.

Eres mi persona favorita, mi refugio y mi mayor alegría. Espero de verdad que hayas disfrutado esta pequeña aventura y que este ultimo regalo te guste muchísimo. Ya puedes relajarte un poco, y dejar de pensar en cómo resolver el siguiente paso. Tu ultima tarea es ponerte bonita para esta noche y darme un beso, si es que me lo gané.

Gracias por seguirme la corriente en mis locuras y por ser tan increíble.

Te amo con todo mi corazón. Te espero en la noche para hacerte una pregunta muy importante.`;

function solveMission10() {
    const row10 = document.querySelector('.mission-row[data-mission="10"]');
    const status10 = row10.querySelector('.mission-status');

    row10.classList.remove('active');
    row10.classList.add('solved');
    status10.className = 'mission-status solved-status';
    status10.innerHTML = 'DECRYPTED ✓';

    const progress = getMissionProgress();
    progress['10'] = 'solved';
    saveMissionProgress(progress);
    updateProgressDisplay();

    setTimeout(() => {
        document.getElementById('dashboard').classList.add('puzzle-complete');
        document.body.classList.add('puzzle-complete');
        const header = document.querySelector('.dashboard-header span:nth-child(2)');
        if (header) header.textContent = '// SYSTEM_LIBERATED // ann@init:~$ mission_complete // ❤️ 10/10';
    }, 2000);
}

function typewriterEffect(text, el, onDone) {
    let i = 0;
    const speed = 50;
    const tick = () => {
        if (i < text.length) {
            el.textContent += text[i];
            i++;
            setTimeout(tick, speed);
        } else if (onDone) {
            onDone();
        }
    };
    tick();
}

function initMission10() {
    const btn = document.getElementById('final-yes-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const prompt = document.getElementById('final-prompt');
        const message = document.getElementById('final-message');
        const output = document.getElementById('final-text-output');
        const footer = document.getElementById('final-footer');

        prompt.style.display = 'none';
        message.style.display = 'block';

        typewriterEffect(FINAL_MESSAGE, output, () => {
            setTimeout(() => {
                footer.style.opacity = '1';
                solveMission10();
            }, 600);
        });
    });
}

// --- Mission 09 ---
const LAYER_ANSWERS = ['MI REINA', 'REDES NEURONALES DE GRAFOS', 'TOPO INQUIETO', 'COUNTER INTELLIGENCE'];

function solveMission09(silent) {
    const row09 = document.querySelector('.mission-row[data-mission="09"]');
    const row10 = document.querySelector('.mission-row[data-mission="10"]');
    const status09 = row09.querySelector('.mission-status');

    row09.classList.remove('active');
    row09.classList.add('solved');
    status09.className = 'mission-status solved-status';
    status09.innerHTML = 'DECRYPTED ✓';

    if (row10) {
        row10.classList.remove('locked');
        row10.classList.add('active');
        const status10 = row10.querySelector('.mission-status');
        status10.className = 'mission-status initializing';
        status10.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('layer04-result');
        result.textContent = '> MASTER_DECRYPT: COMPLETE\n> TODAS LAS CAPAS VERIFICADAS\n> Tu noveno regalo es para descansar un poco.\n> MISSION_10 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['09'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission09() {
    const layers = [
        { inputId: 'layer01-input', btnId: 'layer01-btn', resultId: 'layer01-result', blockId: 'layer-block-01', nextBlockId: 'layer-block-02' },
        { inputId: 'layer02-input', btnId: 'layer02-btn', resultId: 'layer02-result', blockId: 'layer-block-02', nextBlockId: 'layer-block-03' },
        { inputId: 'layer03-input', btnId: 'layer03-btn', resultId: 'layer03-result', blockId: 'layer-block-03', nextBlockId: 'layer-block-04' },
        { inputId: 'layer04-input', btnId: 'layer04-btn', resultId: 'layer04-result', blockId: 'layer-block-04', nextBlockId: null },
    ];

    layers.forEach(({ inputId, btnId, resultId, blockId, nextBlockId }, i) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const resultEl = document.getElementById(resultId);
        if (!btn || !input) return;

        const verify = () => {
            const answer = input.value.trim().toUpperCase();
            if (!answer) return;

            if (answer === LAYER_ANSWERS[i]) {
                input.disabled = true;
                btn.disabled = true;
                btn.style.opacity = '0.4';
                resultEl.textContent = '> LAYER_VERIFIED ✓';
                resultEl.className = 'mission-result success show';

                const block = document.getElementById(blockId);
                if (block) block.classList.add('key-verified');

                if (nextBlockId) {
                    const next = document.getElementById(nextBlockId);
                    if (next) next.classList.remove('key-locked');
                } else {
                    solveMission09(false);
                }
            } else {
                resultEl.textContent = '> LAYER_REJECTED — INCORRECT DATA';
                resultEl.className = 'mission-result fail show';
                input.value = '';
                setTimeout(() => { resultEl.classList.remove('show'); }, 2000);
            }
        };

        btn.addEventListener('click', verify);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') verify(); });
    });
}

// --- Mission 08 ---
const KEY01_ANSWER = 3;
const KEY02_ANSWER = 67;
const KEY03_ANSWER = 2038;
const MISSION_08_CODE = '2108';

function solveMission08(silent) {
    const row08 = document.querySelector('.mission-row[data-mission="08"]');
    const row09 = document.querySelector('.mission-row[data-mission="09"]');
    const status08 = row08.querySelector('.mission-status');

    row08.classList.remove('active');
    row08.classList.add('solved');
    status08.className = 'mission-status solved-status';
    status08.innerHTML = 'DECRYPTED ✓';

    if (row09) {
        row09.classList.remove('locked');
        row09.classList.add('active');
        const status09 = row09.querySelector('.mission-status');
        status09.className = 'mission-status initializing';
        status09.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission08-result');
        result.textContent = '> THREE_KEYS_PROTOCOL: COMPLETE\n> Tu octavo regalo viene en camino. Espéralo.\n> MISSION_09 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['08'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission08() {
    const keys = [
        { inputId: 'key01-input', btnId: 'key01-btn', resultId: 'key01-result', blockId: 'key-block-01', answer: KEY01_ANSWER, nextBlockId: 'key-block-02' },
        { inputId: 'key02-input', btnId: 'key02-btn', resultId: 'key02-result', blockId: 'key-block-02', answer: KEY02_ANSWER, nextBlockId: 'key-block-03' },
        { inputId: 'key03-input', btnId: 'key03-btn', resultId: 'key03-result', blockId: 'key-block-03', answer: KEY03_ANSWER, nextBlockId: 'key-block-final' },
    ];

    const verified = { key01: false, key02: false, key03: false };

    const syncFinalInput = () => {
        if (verified.key01 && verified.key02 && verified.key03) {
            const sum = KEY01_ANSWER + KEY02_ANSWER + KEY03_ANSWER;
            const finalInput = document.getElementById('mission08-input');
            if (finalInput) finalInput.value = sum;
        }
    };

    keys.forEach(({ inputId, btnId, resultId, blockId, answer, nextBlockId }, i) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const resultEl = document.getElementById(resultId);
        if (!btn || !input) return;

        const verify = () => {
            const val = parseInt(input.value, 10);
            if (isNaN(val)) return;

            if (val === answer) {
                input.disabled = true;
                btn.disabled = true;
                btn.style.opacity = '0.4';
                resultEl.textContent = '> KEY_VERIFIED ✓';
                resultEl.className = 'mission-result success show';

                const block = document.getElementById(blockId);
                if (block) block.classList.add('key-verified');

                const nextBlock = document.getElementById(nextBlockId);
                if (nextBlock) nextBlock.classList.remove('key-locked');

                verified[`key0${i + 1}`] = true;
                syncFinalInput();
            } else {
                resultEl.textContent = '> KEY_REJECTED — INCORRECT VALUE';
                resultEl.className = 'mission-result fail show';
                input.value = '';
                setTimeout(() => { resultEl.classList.remove('show'); }, 2000);
            }
        };

        btn.addEventListener('click', verify);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') verify(); });
    });

    const finalBtn = document.getElementById('mission08-submit');
    const finalInput = document.getElementById('mission08-input');
    if (!finalBtn || !finalInput) return;

    const submitFinal = () => {
        const val = String(finalInput.value).trim();
        if (!val) return;
        if (val === MISSION_08_CODE) {
            finalInput.disabled = true;
            finalBtn.disabled = true;
            finalBtn.style.opacity = '0.4';
            solveMission08(false);
        } else {
            const result = document.getElementById('mission08-result');
            result.textContent = '> SUM_FAILED — INCORRECT TOTAL';
            result.className = 'mission-result fail show';
            finalInput.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    finalBtn.addEventListener('click', submitFinal);
    finalInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitFinal(); });
}

// --- Mission 07 ---
const MISSION_07_ANSWER = 'VIED';
const LETTER_BLANKS_CORRECT = { 'blank-l1': 'vida', 'blank-l2': 'inteligente', 'blank-l3': 'exclusivamente', 'blank-l4': 'dormido' };

function solveMission07(silent) {
    const row07 = document.querySelector('.mission-row[data-mission="07"]');
    const row08 = document.querySelector('.mission-row[data-mission="08"]');
    const status07 = row07.querySelector('.mission-status');

    row07.classList.remove('active');
    row07.classList.add('solved');
    status07.className = 'mission-status solved-status';
    status07.innerHTML = 'DECRYPTED ✓';

    if (row08) {
        row08.classList.remove('locked');
        row08.classList.add('active');
        const status08 = row08.querySelector('.mission-status');
        status08.className = 'mission-status initializing';
        status08.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission07-result');
        result.textContent = '> ENCRYPTED_LETTER: COMPLETE\n> Así como tú le diste un nuevo brillo a mi vida, quiero que le des ese mismo brillo a este libro.\n> MISSION_08 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['07'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission07() {
    const btn = document.getElementById('mission07-submit');
    const finalInput = document.getElementById('mission07-input');
    const blankIds = ['blank-l1', 'blank-l2', 'blank-l3', 'blank-l4'];
    if (!btn || !finalInput) return;

    const syncKey = () => {
        const letters = blankIds.map(id => {
            const el = document.getElementById(id);
            const val = el ? el.value.trim() : '';
            return val ? val[0].toUpperCase() : '';
        });
        if (letters.every(l => l)) finalInput.value = letters.join('');
    };

    blankIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', syncKey);
    });

    const submit = () => {
        const answer = finalInput.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_07_ANSWER) {
            finalInput.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            blankIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = true;
            });
            solveMission07(false);
        } else {
            const result = document.getElementById('mission07-result');
            result.textContent = '> DECRYPTION_FAILED — INVALID KEY';
            result.className = 'mission-result fail show';
            finalInput.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    finalInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

// --- Mission 06 ---
const MISSION_06_ANSWER = 'UOY EVOL I';

function solveMission06(silent) {
    const row06 = document.querySelector('.mission-row[data-mission="06"]');
    const row07 = document.querySelector('.mission-row[data-mission="07"]');
    const status06 = row06.querySelector('.mission-status');

    row06.classList.remove('active');
    row06.classList.add('solved');
    status06.className = 'mission-status solved-status';
    status06.innerHTML = 'DECRYPTED ✓';

    if (row07) {
        row07.classList.remove('locked');
        row07.classList.add('active');
        const status07 = row07.querySelector('.mission-status');
        status07.className = 'mission-status initializing';
        status07.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission06-result');
        result.textContent = '> GOSSIP_PROTOCOL: COMPLETE\n> Tu sexto regalo viene en camino. Espéralo.\n> MISSION_07 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['06'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission06() {
    const btn = document.getElementById('mission06-submit');
    const input = document.getElementById('mission06-input');
    if (!btn || !input) return;

    const submit = () => {
        const answer = input.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_06_ANSWER) {
            input.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            solveMission06(false);
        } else {
            const result = document.getElementById('mission06-result');
            result.textContent = '> GOSSIP_PROTOCOL: DENIED — XOXO, TRY AGAIN';
            result.className = 'mission-result fail show';
            input.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

// --- Mission 05 ---
const MISSION_05_ANSWER = 'REINA';

function solveMission05(silent) {
    const row05 = document.querySelector('.mission-row[data-mission="05"]');
    const row06 = document.querySelector('.mission-row[data-mission="06"]');
    const status05 = row05.querySelector('.mission-status');

    row05.classList.remove('active');
    row05.classList.add('solved');
    status05.className = 'mission-status solved-status';
    status05.innerHTML = 'DECRYPTED ✓';

    if (row06) {
        row06.classList.remove('locked');
        row06.classList.add('active');
        const status06 = row06.querySelector('.mission-status');
        status06.className = 'mission-status initializing';
        status06.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission05-result');
        result.textContent = '> FELINE_SEARCH: COMPLETE\n> Los escritos se ven mas lindos en papel.\n> MISSION_06 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['05'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission05() {
    const btn = document.getElementById('mission05-submit');
    const input = document.getElementById('mission05-input');
    if (!btn || !input) return;

    const submit = () => {
        const answer = input.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_05_ANSWER) {
            input.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            solveMission05(false);
        } else {
            const result = document.getElementById('mission05-result');
            result.textContent = '> SEQUENCE_FAILED — INVALID COMBINATION';
            result.className = 'mission-result fail show';
            input.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

// --- Mission 04 ---
const MISSION_04_ANSWER = 'TE AMO';

function solveMission04(silent) {
    const row04 = document.querySelector('.mission-row[data-mission="04"]');
    const row05 = document.querySelector('.mission-row[data-mission="05"]');
    const status04 = row04.querySelector('.mission-status');

    row04.classList.remove('active');
    row04.classList.add('solved');
    status04.className = 'mission-status solved-status';
    status04.innerHTML = 'DECRYPTED ✓';

    if (row05) {
        row05.classList.remove('locked');
        row05.classList.add('active');
        const status05 = row05.querySelector('.mission-status');
        status05.className = 'mission-status initializing';
        status05.innerHTML = 'INITIALIZING...<span class="dashboard-cursor">_</span>';
    }

    if (!silent) {
        const result = document.getElementById('mission04-result');
        result.textContent = '> CAFFENELLA_PROTOCOL: COMPLETE\n> Tu cuarto regalo te convierte en una asesina.\n> MISSION_05 — UNLOCKED';
        result.className = 'mission-result success show';

        const progress = getMissionProgress();
        progress['04'] = 'solved';
        saveMissionProgress(progress);
    }

    updateProgressDisplay();
}

function initMission04() {
    const btn = document.getElementById('mission04-submit');
    const input = document.getElementById('mission04-input');
    if (!btn || !input) return;

    const submit = () => {
        const answer = input.value.trim().toUpperCase();
        if (!answer) return;

        if (answer === MISSION_04_ANSWER) {
            input.disabled = true;
            btn.disabled = true;
            btn.style.opacity = '0.4';
            solveMission04(false);
        } else {
            const result = document.getElementById('mission04-result');
            result.textContent = '> DECRYPTION_FAILED — INVALID MESSAGE';
            result.className = 'mission-result fail show';
            input.value = '';
            setTimeout(() => { result.classList.remove('show'); }, 2000);
        }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
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
        result.textContent = '> FRAGMENT_ANALYSIS: COMPLETE\n> Tu tercer regalo es con mucho amor y un poquito de tiempo.\n> MISSION_04 — UNLOCKED';
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
        if (row.classList.contains('locked')) return;
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
