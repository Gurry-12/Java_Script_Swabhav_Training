/**
 * AeroRoll 3D - Soothing 3D Dice Roller Game
 * High-End 3D Roll driver, Stepper controls, and Stats calculations
 */

// --- DOM ELEMENTS ---
const numOfDiceInput = document.getElementById("numOfDice");
const qtyDecBtn = document.getElementById("qty-dec");
const qtyIncBtn = document.getElementById("qty-inc");
const diceResult = document.getElementById("diceResult");
const diceImages = document.getElementById("diceImages");
const rollBtn = document.getElementById("roll-btn");
const statsRow = document.getElementById("stats-row");
const sumValDisplay = document.getElementById("sum-val");
const avgValDisplay = document.getElementById("avg-val");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// --- APP STATE ---
let isRolling = false;
let rollHistory = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme Configuration
  const savedTheme = localStorage.getItem("aeroroll3d_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Load History
  loadHistoryFromStorage();

  // Stepper Click Event Listeners
  qtyDecBtn.addEventListener("click", () => adjustQty(-1));
  qtyIncBtn.addEventListener("click", () => adjustQty(1));

  // Theme Toggler
  themeToggle.addEventListener("click", toggleTheme);

  // History Clear Button
  clearHistoryBtn.addEventListener("click", clearHistory);
});

// --- STEPPER CONTROLLER ---
/**
 * Adjusts stepper quantity value within boundaries (1 to 12)
 * @param {number} delta 
 */
function adjustQty(delta) {
  if (isRolling) return;

  let currentVal = parseInt(numOfDiceInput.value) || 1;
  let newVal = currentVal + delta;

  if (newVal >= 1 && newVal <= 12) {
    numOfDiceInput.value = newVal;
    
    // Quick visual flash warning off if set in range
    document.getElementById("validation-warning").classList.remove("visible");
  } else if (newVal > 12) {
    triggerBreachAlarm("Max 12 dice allowed!");
  }
}

// --- DICE ROLL ENGINE ---
/**
 * Drives the 3D rotating dice interval, calculates statistics, and logs results
 */
function rollDice() {
  if (isRolling) return;

  const count = parseInt(numOfDiceInput.value) || 1;
  const warning = document.getElementById("validation-warning");

  // Bounds check
  if (count < 1 || count > 12) {
    triggerBreachAlarm(count < 1 ? "Min 1 die required!" : "Max 12 dice allowed!");
    return;
  }
  warning.classList.remove("visible");

  // Set active rolling state
  isRolling = true;
  rollBtn.disabled = true;
  rollBtn.classList.add("rolling");
  updateBtnIcon(rollBtn, "rotate-cw");

  // 1. Create temporary visual dice img tags to spin
  diceImages.innerHTML = "";
  const tempImages = [];
  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.src = `dice_images/1.png`;
    img.alt = `Dice rolling`;
    img.className = "rolling"; // triggers 3D rotate keyframe animation!
    diceImages.appendChild(img);
    tempImages.push(img);
  }

  // 2. Tumble roll interval (cycles faces rapidly every 50ms)
  const rollInterval = setInterval(() => {
    tempImages.forEach(img => {
      const face = Math.floor(Math.random() * 6) + 1;
      img.src = `dice_images/${face}.png`;
    });
  }, 50);

  // 3. Final calculations after 800ms tumble completes
  setTimeout(() => {
    clearInterval(rollInterval);

    // Compute definitive rolled values
    const finalValues = [];
    let sum = 0;
    
    tempImages.forEach(img => {
      const rolledFace = Math.floor(Math.random() * 6) + 1;
      img.src = `dice_images/${rolledFace}.png`;
      img.classList.remove("rolling"); // stops rotation
      img.alt = `Rolled a ${rolledFace}`;
      finalValues.push(rolledFace);
      sum += rolledFace;
    });

    const average = sum / count;

    // Render text summary
    diceResult.textContent = `Rolled ${count} dice: ${finalValues.join(", ")}`;

    // Sync Stats Bar (un-hide and write)
    sumValDisplay.textContent = sum;
    avgValDisplay.textContent = average.toFixed(1);
    statsRow.classList.remove("hidden");

    // Re-enable roll control
    rollBtn.disabled = false;
    rollBtn.classList.remove("rolling");
    updateBtnIcon(rollBtn, "play");

    // Save run in history logs
    saveRollRun(finalValues, sum);

    isRolling = false;
  }, 800);
}

// --- LOCAL STORAGE HISTORY FUNCTIONS ---
/**
 * Saves results to browser history logs
 * @param {number[]} results 
 * @param {number} totalSum 
 */
function saveRollRun(results, totalSum) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const runItem = {
    faces: results,
    sum: totalSum,
    time: timeStr
  };

  rollHistory.unshift(runItem);

  // Cap history rows at 15 items
  if (rollHistory.length > 15) {
    rollHistory.pop();
  }

  localStorage.setItem("aeroroll3d_history", JSON.stringify(rollHistory));
  renderRollHistory();
}

/**
 * Loads history runs from local storage
 */
function loadHistoryFromStorage() {
  const stored = localStorage.getItem("aeroroll3d_history");
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
    historyList.innerHTML = `<div class="empty-history">No runs logged yet</div>`;
    return;
  }

  historyList.innerHTML = "";
  rollHistory.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-row";

    const chipsHtml = item.faces
      .map(num => `<span class="history-chip">${num}</span>`)
      .join("");

    div.innerHTML = `
      <div class="history-chips">
        ${chipsHtml}
      </div>
      <div class="history-summary">
        <span class="history-sum">Sum: ${item.sum}</span>
        <span class="history-time">${item.time}</span>
      </div>
    `;

    historyList.appendChild(div);
  });
}

/**
 * Clears roll logs from storage
 */
function clearHistory() {
  rollHistory = [];
  localStorage.removeItem("aeroroll3d_history");
  renderRollHistory();
}

// --- VISUAL UTILITIES ---
/**
 * Triggers outline flash alarm on bounds failure
 * @param {string} msg 
 */
function triggerBreachAlarm(msg) {
  const warning = document.getElementById("validation-warning");
  warning.textContent = msg;
  warning.classList.add("visible");

  const card = document.getElementById("game-card");
  card.style.borderColor = "var(--accent-coral)";
  card.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.2)";
  
  setTimeout(() => {
    card.style.borderColor = "var(--card-border)";
    card.style.boxShadow = "var(--card-shadow)";
  }, 400);
}

/**
 * Helper to dynamically load new icons on action buttons
 * @param {HTMLElement} btn 
 * @param {string} iconName 
 */
function updateBtnIcon(btn, iconName) {
  const icon = btn.querySelector("i");
  if (icon) {
    icon.setAttribute("data-lucide", iconName);
    lucide.createIcons(); // refresh rendering
  }
}

/**
 * Toggles color settings
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("aeroroll3d_theme", newTheme);
}