/**
 * ZenCount - Soothing Interactive Counter
 * Advanced Logic & Interactive Activity Loggers
 */

// --- DOM ELEMENTS ---
const countLabel = document.getElementById("countLabel");
const decreaseBtn = document.getElementById("decreaseBtn");
const resetBtn = document.getElementById("resetBtn");
const increaseBtn = document.getElementById("increaseBtn");
const settingsToggle = document.getElementById("settings-toggle");
const settingsDrawer = document.getElementById("settings-drawer");
const themeToggle = document.getElementById("theme-toggle");
const minLimitInput = document.getElementById("min-limit");
const maxLimitInput = document.getElementById("max-limit");
const warningBadge = document.getElementById("warning-badge");
const counterCard = document.getElementById("counter-card");
const logsList = document.getElementById("logs-list");
const clearLogsBtn = document.getElementById("clear-logs");

// --- APP STATE ---
let count = 0;
let stepSize = 1;
let minLimit = null;
let maxLimit = null;
let logs = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme Configuration
  const savedTheme = localStorage.getItem("zencount_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Initialize UI Values
  updateCounterDisplay();

  // Button OnClick Listeners
  increaseBtn.addEventListener("click", incrementCount);
  decreaseBtn.addEventListener("click", decrementCount);
  resetBtn.addEventListener("click", resetCount);
  settingsToggle.addEventListener("click", toggleSettingsDrawer);
  themeToggle.addEventListener("click", toggleTheme);
  clearLogsBtn.addEventListener("click", clearLogs);

  // Step Selectors Listeners
  const stepBtns = document.querySelectorAll(".step-btn");
  stepBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      stepBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      stepSize = parseInt(e.target.getAttribute("data-step"));
      
      // Log step size alteration
      logActivity(`step size changed to ${stepSize}`, "reset");
    });
  });

  // Limits Input Changes
  minLimitInput.addEventListener("input", handleLimitChange);
  maxLimitInput.addEventListener("input", handleLimitChange);

  // Keyboard Overrides
  document.addEventListener("keydown", handleKeyboardInput);
});

// --- CORE COUNTER STATE ACTIONS ---
/**
 * Increments count by selected step size, checking boundary locks
 */
function incrementCount() {
  // Check if max limit exists and is already reached or will be breached
  if (maxLimit !== null) {
    if (count >= maxLimit) {
      triggerBoundaryBreach("Max limit reached");
      return;
    }
    
    if (count + stepSize > maxLimit) {
      const remainingStep = maxLimit - count;
      if (remainingStep > 0) {
        count = maxLimit;
        logActivity(`+${remainingStep} (max limit)`, "inc");
        updateCounterDisplay();
      }
      triggerBoundaryBreach("Max limit reached");
      return;
    }
  }

  count += stepSize;
  logActivity(`+${stepSize}`, "inc");
  updateCounterDisplay();
}

/**
 * Decrements count by selected step size, checking boundary locks
 */
function decrementCount() {
  // Check if min limit exists and is already reached or will be breached
  if (minLimit !== null) {
    if (count <= minLimit) {
      triggerBoundaryBreach("Min limit reached");
      return;
    }
    
    if (count - stepSize < minLimit) {
      const remainingStep = count - minLimit;
      if (remainingStep > 0) {
        count = minLimit;
        logActivity(`-${remainingStep} (min limit)`, "dec");
        updateCounterDisplay();
      }
      triggerBoundaryBreach("Min limit reached");
      return;
    }
  }

  count -= stepSize;
  logActivity(`-${stepSize}`, "dec");
  updateCounterDisplay();
}

/**
 * Resets counter value back to zero
 */
function resetCount() {
  if (count === 0) return;
  
  count = 0;
  logActivity("reset counter", "reset");
  updateCounterDisplay();
}

// --- VISUAL & UI WRITERS ---
/**
 * Syncs the central digits, mood classes and boundary warnings
 */
function updateCounterDisplay() {
  countLabel.textContent = count;

  // Sync Mood indicator colors
  countLabel.classList.remove("neutral", "positive", "negative");
  
  if (count === 0) {
    countLabel.classList.add("neutral");
  } else if (count > 0) {
    countLabel.classList.add("positive");
  } else {
    countLabel.classList.add("negative");
  }

  // Clear boundary alarms if limits are no longer breached
  let isUnderBounds = (minLimit === null || count > minLimit);
  let isOverBounds = (maxLimit === null || count < maxLimit);
  
  if (isUnderBounds && isOverBounds) {
    warningBadge.classList.remove("visible");
  } else {
    // Keep warning visible if resting exactly on boundary
    warningBadge.classList.add("visible");
    warningBadge.textContent = count <= minLimit ? "Min Bound Reached" : "Max Bound Reached";
  }
}

/**
 * Triggers a visual flash on the card outline and shows the alarm badge
 * @param {string} msg 
 */
function triggerBoundaryBreach(msg) {
  warningBadge.textContent = msg;
  warningBadge.classList.add("visible");

  // Visual outline flash
  counterCard.classList.remove("breach-flash");
  void counterCard.offsetWidth; // Trigger browser reflow to repeat keyframe animation
  counterCard.classList.add("breach-flash");

  setTimeout(() => {
    counterCard.classList.remove("breach-flash");
  }, 400);
}

// --- SETTINGS DRAWER CONTROLLER ---
/**
 * Toggles collapsible advanced settings drawer panel
 */
function toggleSettingsDrawer() {
  settingsDrawer.classList.toggle("collapsed");
}

/**
 * Listens to boundary inputs and updates local boundary states
 */
function handleLimitChange() {
  const minVal = minLimitInput.value.trim();
  const maxVal = maxLimitInput.value.trim();

  minLimit = minVal === "" ? null : parseInt(minVal);
  maxLimit = maxVal === "" ? null : parseInt(maxVal);

  // Clamp current count to boundaries if input alters bounds to overlap count
  if (minLimit !== null && count < minLimit) {
    count = minLimit;
    logActivity("clamped to min limit", "reset");
  }
  if (maxLimit !== null && count > maxLimit) {
    count = maxLimit;
    logActivity("clamped to max limit", "reset");
  }

  updateCounterDisplay();
}

// --- ACTIVITY LOG COMPILER ---
/**
 * Compiles a transaction event and prints it to list feed
 * @param {string} actionText 
 * @param {string} badgeType "inc" | "dec" | "reset"
 */
function logActivity(actionText, badgeType) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const logItem = {
    action: actionText,
    type: badgeType,
    time: timeString
  };

  logs.unshift(logItem); // Add to beginning of local array

  // Cap logs in UI at 20 events
  if (logs.length > 20) {
    logs.pop();
  }

  renderActivityLogs();
}

/**
 * Redraws activity log markup
 */
function renderActivityLogs() {
  if (logs.length === 0) {
    logsList.innerHTML = `<div class="empty-logs">No activity logged yet</div>`;
    return;
  }

  logsList.innerHTML = "";
  logs.forEach(item => {
    const div = document.createElement("div");
    div.className = "log-item";
    
    // Class badges mapping
    let badgeClass = "badge-reset";
    if (item.type === "inc") badgeClass = "badge-inc";
    if (item.type === "dec") badgeClass = "badge-dec";

    div.innerHTML = `
      <div class="log-action">
        <span class="log-badge ${badgeClass}">${item.type}</span>
        <span>${item.action}</span>
      </div>
      <span class="log-time">${item.time}</span>
    `;

    logsList.appendChild(div);
  });
}

/**
 * Wipes activity feed
 */
function clearLogs() {
  logs = [];
  renderActivityLogs();
}

// --- KEYBOARD MANAGEMENT ---
/**
 * Overrides default browser inputs for arrow keys and counters
 * @param {KeyboardEvent} e 
 */
function handleKeyboardInput(e) {
  // Ignore shortcuts if focusing settings input forms to prevent locks
  if (document.activeElement === minLimitInput || document.activeElement === maxLimitInput) {
    return;
  }

  // Up Arrow or "+" key
  if (e.key === "ArrowUp" || e.key === "+") {
    e.preventDefault();
    incrementCount();
  }
  // Down Arrow or "-" key
  else if (e.key === "ArrowDown" || e.key === "-") {
    e.preventDefault();
    decrementCount();
  }
  // R key or Backspace to reset
  else if (e.key.toLowerCase() === "r" || e.key === "Backspace") {
    e.preventDefault();
    resetCount();
  }
}

// --- THEME UTILITIES ---
/**
 * Toggles color settings
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("zencount_theme", newTheme);
}
