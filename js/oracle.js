/* 🔮 DARKAIS QUANT TAROT — MASTER ORACLE ENGINE WITH INVERTED CARDS & EXPORT */

let currentSpreadMode = '3card'; // '3card', '1card', '5card'
let drawnCards = [];
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playMysticChime(freq = 528) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
    } catch(e) {}
}

function playShuffleSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        for (let i = 0; i < 5; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200 + Math.random() * 400, now + i * 0.08);
            gain.gain.setValueAtTime(0.15, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.07);
        }
    } catch(e) {}
}

function setSpread(mode) {
    currentSpreadMode = mode;
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    initDeckSlots();
}

function setQuery(text) {
    const el = document.getElementById('oracleQueryInput');
    if (el) {
        el.value = text;
        el.focus();
    }
}

function initDeckSlots() {
    const container = document.getElementById('cardsSpreadContainer');
    container.innerHTML = '';
    document.getElementById('oracleReadingPanel').classList.remove('show');
    drawnCards = [];

    let count = currentSpreadMode === '1card' ? 1 : (currentSpreadMode === '3card' ? 3 : 5);
    const labels = currentSpreadMode === '1card' 
        ? ["DAILY ALPHA FORTUNE"]
        : (currentSpreadMode === '3card' 
            ? ["I. THE PAST (GENESIS)", "II. THE PRESENT (VOLATILITY)", "III. THE FUTURE (DESTINY)"]
            : ["I. MARKET STATE", "II. HIDDEN RISK", "III. CATALYST", "IV. RESISTANCE", "V. FINAL ALPHA"]);

    for (let i = 0; i < count; i++) {
        const slot = document.createElement('div');
        slot.className = 'tarot-card-slot';
        slot.dataset.slotIdx = i;
        slot.innerHTML = `
            <div class="tarot-card-inner" id="cardInner${i}">
                <div class="card-face card-back" onclick="revealCard(${i})">
                    <div class="card-back-rune">🔮</div>
                    <div class="card-back-title">DARKAIS</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${labels[i]}</div>
                    <div style="margin-top:14px; font-size:10px; color:var(--gold); border:1px solid var(--gold); padding:3px 8px; border-radius:12px;">CLICK TO DRAW</div>
                </div>
                <div class="card-face card-front" id="cardFront${i}"></div>
            </div>
        `;
        container.appendChild(slot);
    }
}

function shuffleDeck() {
    playShuffleSound();
    initDeckSlots();
}

function revealCard(idx) {
    if (drawnCards[idx]) return;

    // Pick a card not yet drawn
    let card;
    do {
        card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    } while (drawnCards.some(c => c && c.id === card.id));

    // 25% Chance of Inverted Card
    const isInverted = Math.random() < 0.25;
    drawnCards[idx] = { ...card, isInverted };

    playMysticChime(440 + idx * 110);

    const frontEl = document.getElementById(`cardFront${idx}`);
    frontEl.innerHTML = `
        <div class="card-header-top">
            <span>${card.roman}</span>
            <span>${card.element} ${isInverted ? '<span class="inverted-badge">INVERTED</span>' : ''}</span>
        </div>
        <div class="card-icon-art">${card.icon}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-arcana-sub">${card.arcana}</div>
        <div class="card-keywords-strip">
            ${card.keywords.map(k => `<span class="card-badge">${k}</span>`).join('')}
        </div>
    `;

    const innerEl = document.getElementById(`cardInner${idx}`);
    innerEl.classList.add('flipped');
    if (isInverted) innerEl.classList.add('inverted');

    // If all cards revealed, generate complete AI reading
    const totalRequired = currentSpreadMode === '1card' ? 1 : (currentSpreadMode === '3card' ? 3 : 5);
    const revealedCount = drawnCards.filter(Boolean).length;

    if (revealedCount === totalRequired) {
        setTimeout(renderCompleteReading, 600);
    }
}

function drawAllCards() {
    const total = currentSpreadMode === '1card' ? 1 : (currentSpreadMode === '3card' ? 3 : 5);
    for (let i = 0; i < total; i++) {
        setTimeout(() => revealCard(i), i * 300);
    }
}

function renderCompleteReading() {
    const panel = document.getElementById('oracleReadingPanel');
    const breakdownGrid = document.getElementById('cardBreakdownGrid');
    breakdownGrid.innerHTML = '';

    const userQuestion = document.getElementById('oracleQueryInput')?.value.trim();
    if (userQuestion) {
        const qBox = document.createElement('div');
        qBox.style.cssText = "grid-column: 1 / -1; background:rgba(255, 184, 0, 0.08); border:1px solid var(--gold); border-radius:8px; padding:12px 16px; margin-bottom:12px;";
        qBox.innerHTML = `<strong>🔮 INQUIRY SUBMITTED:</strong> <span style="color:#FFF; font-style:italic;">"${userQuestion}"</span>`;
        breakdownGrid.appendChild(qBox);
    }

    const labels = currentSpreadMode === '1card' 
        ? ["Daily Alpha Prophecy"]
        : (currentSpreadMode === '3card' 
            ? ["Genesis Foundation (Past)", "Current Market Dynamics (Present)", "Target Equilibrium (Future)"]
            : ["Macro Market State", "Hidden Liquidity Risk", "Volatility Catalyst", "Overhead Obstacle", "Final Alpha Outcome"]);

    drawnCards.forEach((card, i) => {
        if (!card) return;
        const box = document.createElement('div');
        box.className = 'card-analysis-box';
        const interpretation = card.isInverted ? card.inverted : card.upright;
        const stateTag = card.isInverted ? '<span style="color:#FF0055; font-weight:bold;">[INVERTED / CAUTION]</span>' : '<span style="color:#39FF14; font-weight:bold;">[UPRIGHT]</span>';

        box.innerHTML = `
            <h4>${labels[i]}: ${card.name} ${stateTag}</h4>
            <p>${interpretation}</p>
            <div style="font-size:12px; color:var(--gold);"><strong>Sentiment:</strong> ${card.sentiment}</div>
            <div style="font-size:12px; color:var(--cyan); margin-top:4px;"><strong>Directive:</strong> ${card.alphaDirective}</div>
        `;
        breakdownGrid.appendChild(box);
    });

    // Lucky Trading Pair
    const PAIRS = ["SOL / USDC", "BTC / USDT", "ETH / SOL", "JUP / SOL", "RAY / SOL", "AI16Z / SOL"];
    const luckyPair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    document.getElementById('luckyPairText').innerText = luckyPair;

    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth' });

    saveReadingToJournal(userQuestion, luckyPair);
}

// ── 5. 🔊 MYSTIC CYBER VOICE NARRATION ────────────────────────────────────
function narrateProphecy() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let speechText = "The Quant Oracle reveals your prophecy. ";
        drawnCards.forEach((c) => {
            if (c) speechText += `${c.name}. ${c.isInverted ? 'Inverted: ' + c.inverted : c.upright}. `;
        });
        const utter = new SpeechSynthesisUtterance(speechText);
        utter.pitch = 0.65;
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
    }
}

// ── 6. 📸 EXPORT READING CARD AS PNG IMAGE ────────────────────────────────
function exportReadingImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 700);
    grad.addColorStop(0, '#05070D');
    grad.addColorStop(1, '#0B101D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 700);

    // Neon Frame
    ctx.strokeStyle = '#FFB800';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 660);

    // Header Title
    ctx.fillStyle = '#FFB800';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔮 DARKAIS QUANT TAROT ORACLE READING', 600, 80);

    // Date
    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px monospace';
    ctx.fillText(new Date().toUTCString(), 600, 115);

    // Draw 3 Cards
    const cardWidth = 320;
    const cardHeight = 360;
    const startX = (1200 - (drawnCards.length * cardWidth + (drawnCards.length - 1) * 40)) / 2;

    drawnCards.forEach((card, i) => {
        if (!card) return;
        const x = startX + i * (cardWidth + 40);
        const y = 160;

        ctx.fillStyle = '#12192C';
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeStyle = card.isInverted ? '#FF0055' : '#00F0FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${card.roman} - ${card.name}`, x + cardWidth / 2, y + 50);

        ctx.font = '54px sans-serif';
        ctx.fillText(card.icon, x + cardWidth / 2, y + 140);

        ctx.fillStyle = card.isInverted ? '#FF0055' : '#39FF14';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(card.isInverted ? '● INVERTED' : '● UPRIGHT', x + cardWidth / 2, y + 190);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '13px sans-serif';
        ctx.fillText(card.keywords.slice(0, 2).join(' • '), x + cardWidth / 2, y + 230);
    });

    // Lucky Pair & Footer
    const pair = document.getElementById('luckyPairText').innerText;
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`PROPHETIC LIQUIDITY PAIR: ${pair}`, 600, 580);

    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText('https://karidasd.github.io/quant-tarot/ • Created by Dimitris Karydas (DarkAIs)', 600, 630);

    // Trigger Download
    const a = document.createElement('a');
    a.download = `DarkAIs_Quant_Tarot_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
}

// ── 7. 📜 ORACLE JOURNAL (LOCAL STORAGE) ──────────────────────────────────
function saveReadingToJournal(question, pair) {
    const history = JSON.parse(localStorage.getItem('darkais_tarot_journal') || '[]');
    const record = {
        date: new Date().toLocaleString(),
        question: question || 'General Alpha Synthesis',
        pair: pair,
        cards: drawnCards.map(c => ({ name: c.name, inverted: c.isInverted }))
    };
    history.unshift(record);
    localStorage.setItem('darkais_tarot_journal', JSON.stringify(history.slice(0, 10)));
    renderJournal();
}

function renderJournal() {
    const container = document.getElementById('journalGrid');
    if (!container) return;
    const history = JSON.parse(localStorage.getItem('darkais_tarot_journal') || '[]');
    if (history.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">No past readings in the vault yet. Draw cards to record prophecies!</div>';
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="journal-item">
            <div style="display:flex; justify-content:space-between; color:var(--gold); font-weight:bold; margin-bottom:4px;">
                <span>📜 ${item.question}</span>
                <span style="font-size:10px; color:var(--text-muted);">${item.date}</span>
            </div>
            <div style="color:var(--text-secondary); margin-bottom:6px;">
                ${item.cards.map(c => `• ${c.name} ${c.inverted ? '<span style="color:#FF0055">(Inverted)</span>' : ''}`).join(' ')}
            </div>
            <div style="font-size:11px; color:var(--cyan);">Pair: ${item.pair}</div>
        </div>
    `).join('');
}

// ── 8. INITIALIZATION & FOIL TILT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDeckSlots();
    renderJournal();

    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.addEventListener('click', () => setSpread(btn.dataset.mode));
    });

    // 3D Holographic Mouse Tilt
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        document.querySelectorAll('.tarot-card-slot').forEach(slot => {
            slot.style.transform = `rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
        });
    });
});
