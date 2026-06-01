/**
 * AeroRoll - Soothing Random Number Generator
 * High-End Generation Logic & Slot-Machine Roll Driver
 */

// --- DOM ELEMENTS ---
const myButton = document.getElementById("myButton");
const minInput = document.getElementById("min-val");
const maxInput = document.getElementById("max-val");
const uniqueToggle = document.getElementById("unique-toggle");
const slotsGrid = document.getElementById("slots-grid");
const validationWarning = document.getElementById("validation-warning");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// Numeric Output Labels Array
const labels = [
  document.getElementById("label1"),
  document.getElementById("label2"),
  document.getElementById("label3"),
  document.getElementById("label4"),
  document.getElementById("label5")
];

// Output Slots Wrapper Elements
const slots = [
  document.getElementById("slot-1"),
  document.getElementById("slot-2"),
  document.getElementById("slot-3"),
  document.getElementById("slot-4"),
  document.getElementById("slot-5")
];

// --- APP STATE ---
let minRange = 1;
let maxRange = 100;
let quantity = 3;
let uniqueOnly = true;
let isRolling = false;
let rollHistory = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme Configuration
  const savedTheme = localStorage.getItem("aeroroll_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Load History
  loadHistoryFromStorage();

  // Button Action Click Listener
  myButton.addEventListener("click", rollNumbers);
  themeToggle.addEventListener("click", toggleTheme);
  clearHistoryBtn.addEventListener("click", clearHistory);

  // Quantity Selectors Click Handler
  const qtyBtns = document.querySelectorAll(".qty-btn");
  qtyBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (isRolling) return; // Prevent adjustment during active rolling

      qtyBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      quantity = parseInt(e.target.getAttribute("data-step") || e.target.getAttribute("data-qty"));
      
      // Update slots display layout immediately
      updateDisplaySlots();
      resetSlotDisplays();
    });
  });

  // Range and Config updates
  minInput.addEventListener("change", handleRangeChange);
  maxInput.addEventListener("change", handleRangeChange);
  uniqueToggle.addEventListener("change", () => {
    uniqueOnly = uniqueToggle.checked;
  });

  // Initial Layout Sync
  updateDisplaySlots();
});

// --- GENERATION ENGINE ---
/**
 * Drives the slot machine roll interval and compiles final results
 */
function rollNumbers() {
  if (isRolling) return;

  // 1. Inputs Sync & Parsing
  minRange = parseInt(minInput.value) || 1;
  maxRange = parseInt(maxInput.value) || 100;
  uniqueOnly = uniqueToggle.checked;

  // 2. Advanced Range Validation
  if (minRange > maxRange) {
    // Swap ranges if user reversed them
    minInput.value = maxRange;
    maxInput.value = minRange;
    const temp = minRange;
    minRange = maxRange;
    maxRange = temp;
  }

  // Range Size Check for Unique Constraints
  const totalRangeSize = maxRange - minRange + 1;
  if (uniqueOnly && quantity > totalRangeSize) {
    validationWarning.classList.add("visible");
    triggerBreachAlarm();
    return;
  } else {
    validationWarning.classList.remove("visible");
  }

  // 3. Initiate Slot-Machine Rolling Animation State
  isRolling = true;
  myButton.classList.add("rolling");
  
  // Spin lucide icons by reloading
  const rollIcon = myButton.querySelector("i");
  if (rollIcon) {
    rollIcon.setAttribute("data-lucide", "rotate-cw");
    lucide.createIcons();
  }

  // Add rolling pulses to visible slots
  for (let i = 0; i < quantity; i++) {
    slots[i].classList.add("rolling");
  }

  // Fast interval to randomize digit displays (ticks every 45ms)
  const rollInterval = setInterval(() => {
    for (let i = 0; i < quantity; i++) {
      labels[i].textContent = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    }
  }, 45);

  // 4. Final Output Selection after 600ms Animation Complete
  setTimeout(() => {
    clearInterval(rollInterval);

    // Compute definitive set of numbers
    const finalResults = generateResultsArray();

    // Render final results on screen
    for (let i = 0; i < quantity; i++) {
      labels[i].textContent = finalResults[i];
    }

    // De-activate rolling class states
    myButton.classList.remove("rolling");
    if (rollIcon) {
      rollIcon.setAttribute("data-lucide", "dices");
      lucide.createIcons();
    }
    slots.forEach(s => s.classList.remove("rolling"));

    // Save calculation run in history logs
    saveRollRun(finalResults);

    isRolling = false;
  }, 600);
}

/**
 * Computes unique or duplicates-allowed random numbers based on active config state
 * @returns {number[]}
 */
function generateResultsArray() {
  const results = [];

  if (uniqueOnly) {
    // Generate exactly unique elements
    const uniqueSet = new Set();
    while (uniqueSet.size < quantity) {
      const num = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
      uniqueSet.add(num);
    }
    return Array.from(uniqueSet);
  } else {
    // Standard duplicates-allowed random digits
    for (let i = 0; i < quantity; i++) {
      const num = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
      results.push(num);
    }
    return results;
  }
}

// --- VISUAL/GRID UPDATER ---
/**
 * Hides/reveals slot cards and changes grid sizes based on quantity
 */
function updateDisplaySlots() {
  // Clear layout sizing classes
  slotsGrid.className = "slots-grid";
  slotsGrid.classList.add(`qty-${quantity}`);

  // Hide/Show slot circles
  for (let i = 0; i < slots.length; i++) {
    if (i < quantity) {
      slots[i].classList.remove("hidden");
    } else {
      slots[i].classList.add("hidden");
    }
  }
}

/**
 * Clears display slots time text to default placeholders
 */
function resetSlotDisplays() {
  labels.forEach(lbl => {
    lbl.textContent = "--";
  });
}

/**
 * Triggers outline flash alarm on bounds failure
 */
function triggerBreachAlarm() {
  const card = document.getElementById("generator-card");
  card.style.borderColor = "var(--accent-coral)";
  card.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.2)";
  
  setTimeout(() => {
    card.style.borderColor = "var(--card-border)";
    card.style.boxShadow = "var(--card-shadow)";
  }, 400);
}

/**
 * Inputs changes validation
 */
function handleRangeChange() {
  minRange = parseInt(minInput.value) || 1;
  maxRange = parseInt(maxInput.value) || 100;
  
  // Check if constraints are satisfied
  const totalRangeSize = maxRange - minRange + 1;
  if (uniqueOnly && quantity > totalRangeSize) {
    validationWarning.classList.add("visible");
  } else {
    validationWarning.classList.remove("visible");
  }
}

// --- LOCAL STORAGE HISTORY FUNCTIONS ---
/**
 * Saves results array to roll runs log and updates storage
 * @param {number[]} results 
 */
function saveRollRun(results) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const runItem = {
    numbers: results,
    time: timeStr
  };

  rollHistory.unshift(runItem);

  // Cap history rows at 15 items
  if (rollHistory.length > 15) {
    rollHistory.pop();
  }

  localStorage.setItem("aeroroll_history", JSON.stringify(rollHistory));
  renderRollHistory();
}

/**
 * Loads history runs from local storage
 */
function loadHistoryFromStorage() {
  const stored = localStorage.getItem("aeroroll_history");
  if (stored) {
    try {
      rollHistory = JSON.parse(stored);
    } catch (e) {
      rollHistory = [];
    }
  }
  renderRollHistory();
}

/**
 * Redraws history listing feed elements
 */
function renderRollHistory() {
  if (rollHistory.length === 0) {
    historyList.innerHTML = `<div class="empty-history">No rolls generated yet</div>`;
    return;
  }

  historyList.innerHTML = "";
  rollHistory.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-row";

    const chipsHtml = item.numbers
      .map(num => `<span class="history-chip">${num}</span>`)
      .join("");

    div.innerHTML = `
      <div class="history-nums">
        ${chipsHtml}
      </div>
      <span class="history-time">${item.time}</span>
    `;

    historyList.appendChild(div);
  });
}

/**
 * Clears roll logs from storage
 */
function clearHistory() {
  rollHistory = [];
  localStorage.removeItem("aeroroll_history");
  renderRollHistory();
}

// --- THEME UTILITIES ---
/**
 * Toggles color settings
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("aeroroll_theme", newTheme);
}
