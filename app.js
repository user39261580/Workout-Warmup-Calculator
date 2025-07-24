// Final fixes: use click event delegation for selects + enforce min correctly

// --- Helper to force redraw of default selects on some iOS/Chrome quirks
function refreshSelect(select) {
  select.blur();
  setTimeout(() => select.focus(), 0);
}

// Revised min enforcement logic
function enforceMinWeight() {
  const unit = unitEl.value;
  const isBarbell = forBarbellEl.checked;
  const minWeight = isBarbell ? (unit === 'kg' ? 20 : 45) : 1;
  weightEl.min = minWeight;
}

// Overwrite existing handler functions
function handleBarbellChange() {
  enforceMinWeight();
  if (parseFloat(weightEl.value) < weightEl.min) {
    weightEl.value = weightEl.min;
  }
  computeAndRender();
}

function handleUnitChange() {
  // Convert current weight to new unit if both weight and unit exist
  const previousUnit = unitEl.dataset.prev || 'kg';
  const newUnit = unitEl.value;
  const weight = parseFloat(weightEl.value);

  if (!isNaN(weight)) {
    let converted = weight;
    if (previousUnit !== newUnit) {
      converted = previousUnit === 'kg' ? Math.round(weight * 2.20462) : Math.round(weight / 2.20462);
      weightEl.value = converted;
    }
  }

  unitEl.dataset.prev = newUnit;
  enforceMinWeight();
  computeAndRender();
}

// Attach event listener fix for selects that might stop propagation
[bodyPartEl, unitEl, repsEl, setCountEl].forEach((sel) => {
  sel.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
});