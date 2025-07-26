// Workout Warm-up Planner – app.js (updated with barbell mode)

const BAR = { kg: 20, lbs: 45 };

const DATA = {
  rules: {
    Upper: {
      5: [
        { set: 1, pct: 0.5, reps: 5 },
        { set: 2, pct: 0.75, reps: 2 },
        { set: 3, pct: 0.85, reps: 1 },
        { set: 4, pct: 0.9, reps: 1 },
        { set: 5, pct: 0.0, reps: 0 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
      8: [
        { set: 1, pct: 0.45, reps: 6 },
        { set: 2, pct: 0.7, reps: 3 },
        { set: 3, pct: 0.8, reps: 2 },
        { set: 4, pct: 0.85, reps: 1 },
        { set: 5, pct: 0.0, reps: 0 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
      12: [
        { set: 1, pct: 0.4, reps: 8 },
        { set: 2, pct: 0.6, reps: 5 },
        { set: 3, pct: 0.75, reps: 2 },
        { set: 4, pct: 0.0, reps: 0 },
        { set: 5, pct: 0.0, reps: 0 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
    },
    Lower: {
      5: [
        { set: 1, pct: 0.4, reps: 5 },
        { set: 2, pct: 0.6, reps: 3 },
        { set: 3, pct: 0.75, reps: 2 },
        { set: 4, pct: 0.85, reps: 1 },
        { set: 5, pct: 0.9, reps: 1 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
      8: [
        { set: 1, pct: 0.35, reps: 6 },
        { set: 2, pct: 0.55, reps: 4 },
        { set: 3, pct: 0.7, reps: 3 },
        { set: 4, pct: 0.8, reps: 2 },
        { set: 5, pct: 0.85, reps: 1 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
      12: [
        { set: 1, pct: 0.3, reps: 10 },
        { set: 2, pct: 0.5, reps: 6 },
        { set: 3, pct: 0.65, reps: 4 },
        { set: 4, pct: 0.75, reps: 2 },
        { set: 5, pct: 0.0, reps: 0 },
        { set: 6, pct: 0.0, reps: 0 },
      ],
    },
  },
};

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const roundToNearest = (val, step) => Math.round(val / step) * step;

// ---------- Elements ----------
const bodyPartEl = $('#body-part');
const weightEl = $('#target-weight');
const unitEl = $('#unit');
const repsEl = $('#target-reps');
const setCountEl = $('#set-count');
const barbellModeEl = $('#barbell-mode');
const planEl = $('#plan');
const copyBtn = $('#copy-btn');
const resetBtn = $('#reset-btn');
const refList = document.querySelector('.reference-list');
const accordionHeaders = document.querySelectorAll('.accordion__header');

// ---------- Init ----------
function init() {
  // Event listeners
  bodyPartEl.addEventListener('change', computeAndRender);
  weightEl.addEventListener('input', computeAndRender);
  weightEl.addEventListener('blur', handleWeightBlur);
  unitEl.addEventListener('change', handleUnitChange);
  repsEl.addEventListener('change', computeAndRender);
  setCountEl.addEventListener('change', computeAndRender);
  barbellModeEl.addEventListener('change', handleBarbellModeChange);

  copyBtn.addEventListener('click', handleCopy);
  resetBtn.addEventListener('click', handleReset);

  accordionHeaders.forEach((btn) => btn.addEventListener('click', () => toggleAccordion(btn)));

  // Initialize min weight for default unit (kg)
  updateMinWeight();
  computeAndRender();
}

// ---------- Event Handlers ----------
function handleUnitChange() {
  updateMinWeight();
  enforceMinWeight(); // Check and adjust weight if needed
  computeAndRender();
}

function handleWeightBlur() {
  enforceMinWeight();
  computeAndRender();
}

function handleBarbellModeChange() {
  updateMinWeight();
  enforceMinWeight(); // Check and adjust weight if needed
  computeAndRender();
}

function updateMinWeight() {
  const unit = unitEl.value;
  const barbellMode = barbellModeEl.checked;
  
  if (barbellMode) {
    weightEl.min = BAR[unit];
  } else {
    weightEl.min = 1;
  }
}

function enforceMinWeight() {
  const unit = unitEl.value;
  const barbellMode = barbellModeEl.checked;
  let weight = parseFloat(weightEl.value);
  
  if (barbellMode && !isNaN(weight) && weight < BAR[unit]) {
    weightEl.value = BAR[unit];
  }
}

// ---------- Core ----------
function computeAndRender() {
  const bodyPart = bodyPartEl.value;
  let weight = parseFloat(weightEl.value);
  const unit = unitEl.value;
  const reps = repsEl.value;
  const setCount = parseInt(setCountEl.value, 10);
  const barbellMode = barbellModeEl.checked;

  // Basic validation
  if (!bodyPart || isNaN(weight) || weight <= 0) {
    planEl.innerHTML = '';
    copyBtn.classList.add('hidden');
    return;
  }

  // For calculation purposes only - don't modify the input value during typing
  let calculationWeight = weight;
  if (barbellMode && weight < BAR[unit]) {
    calculationWeight = BAR[unit];
  }

  const ruleArr = DATA.rules[bodyPart]?.[reps] || [];
  const validSets = ruleArr.filter((s) => s.pct > 0).slice(0, setCount);
  const step = unit === 'kg' ? 2.5 : 5;

  const plan = validSets.map((s) => {
    let raw = calculationWeight * s.pct;
    let rounded = roundToNearest(raw, step);
    
    // Ensure minimum bar weight if barbell mode is on
    if (barbellMode && rounded < BAR[unit]) {
      rounded = BAR[unit];
    }
    
    return {
      set: s.set,
      pct: (s.pct * 100).toFixed(0),
      weight: rounded,
      reps: s.reps,
    };
  });

  renderTable(plan, unit);
  copyBtn.classList.remove('hidden');
}

function renderTable(plan, unit) {
  if (!plan.length) {
    planEl.innerHTML = '<p>No warm-up sets for these parameters.</p>';
    copyBtn.classList.add('hidden');
    return;
  }

  const heaviest = Math.max(...plan.map((p) => p.weight));

  const table = document.createElement('table');
  table.innerHTML = `<thead><tr><th>Set</th><th>%</th><th>Weight (${unit})</th><th>Reps</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  plan.forEach((p) => {
    const tr = document.createElement('tr');
    if (p.weight === heaviest) tr.classList.add('heaviest');
    tr.innerHTML = `<td>${p.set}</td><td>${p.pct}%</td><td>${p.weight}</td><td>${p.reps}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Replace
  planEl.innerHTML = '';
  planEl.appendChild(table);
}

// ---------- Copy & Reset ----------
function handleCopy() {
  const rows = planEl.querySelectorAll('tbody tr');
  if (!rows.length) return;
  
  const unit = unitEl.value;
  const lines = [];
  
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    const setNum = cells[0].textContent;
    const weight = cells[2].textContent;
    const reps = cells[3].textContent;
    lines.push(`Set ${setNum} – ${weight}${unit} × ${reps} reps`);
  });
  
  const text = lines.join('\n');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      showToast('Copy failed - please try again');
    });
  } else {
    showToast('Clipboard not supported');
  }
}

function handleReset() {
  document.getElementById('planner-form').reset();
  // Reset checkbox to checked and update min weight
  barbellModeEl.checked = true;
  unitEl.value = 'kg';
  updateMinWeight();
  planEl.innerHTML = '';
  copyBtn.classList.add('hidden');
}

function showToast(msg, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.className = 'status status--success';
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    borderRadius: 'var(--radius-base)',
    padding: 'var(--space-8) var(--space-16)',
    fontSize: 'var(--font-size-sm)'
  });
  
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, duration);
}

// ---------- Accordion ----------
function toggleAccordion(btn) {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  if (expanded) {
    panel.setAttribute('hidden', '');
  } else {
    panel.removeAttribute('hidden');
    // Close any other open accordion for simplicity
    accordionHeaders.forEach((other) => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        document.getElementById(other.getAttribute('aria-controls')).setAttribute('hidden', '');
      }
    });
  }
}

// ---------- Start ----------
init();