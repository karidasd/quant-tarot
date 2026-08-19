/* 🔮 DARKAIS QUANT TAROT — ORACLE ENGINE */

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

    drawnCards[idx] = card;
    playMysticChime(440 + idx * 110);

    const frontEl = document.getElementById(`cardFront${idx}`);
    frontEl.innerHTML = `
        <div class="card-header-top">
            <span>${card.roman}</span>
            <span>${card.element}</span>
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

    const labels = currentSpreadMode === '1card' 
        ? ["Daily Alpha Prophecy"]
        : (currentSpreadMode === '3card' 
            ? ["Genesis Foundation (Past)", "Current Market Dynamics (Present)", "Target Equilibrium (Future)"]
            : ["Macro Market State", "Hidden Liquidity Risk", "Volatility Catalyst", "Overhead Obstacle", "Final Alpha Outcome"]);

    drawnCards.forEach((card, i) => {
        if (!card) return;
        const box = document.createElement('div');
        box.className = 'card-analysis-box';
        box.innerHTML = `
            <h4>${labels[i]}: ${card.name} (${card.arcana})</h4>
            <p>${card.upright}</p>
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
}

document.addEventListener('DOMContentLoaded', () => {
    initDeckSlots();
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.addEventListener('click', () => setSpread(btn.dataset.mode));
    });
});
