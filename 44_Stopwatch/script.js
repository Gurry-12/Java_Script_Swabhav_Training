/**
 * Chronos - Soothing Modern Stopwatch
 * High-Precision Logic & Circular SVG Renderer
 */

// --- DOM ELEMENTS ---
const display = document.getElementById("display");
const displayMs = document.getElementById("display-ms");
const startStopBtn = document.getElementById("start-stop-btn");
const startStopText = document.getElementById("start-stop-text");
const lapResetBtn = document.getElementById("lap-reset-btn");
const lapResetText = document.getElementById("lap-reset-text");
const lapsList = document.getElementById("laps-list");
const themeToggle = document.getElementById("theme-toggle");
const ringIndicator = document.getElementById("ring-indicator");
const statsBar = document.getElementById("stats-bar");
const fastestLapVal = document.getElementById("fastest-lap-val");
const slowestLapVal = document.getElementById("slowest-lap-val");

// --- APP STATE ---
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let animationFrameId = null;

// Laps state
let laps = [];
let lastLapTimeMs = 0;

// SVG Ring Configuration
// Circumference = 2 * PI * r = 2 * 3.14159 * 95 = 596.9
const RING_CIRCUMFERENCE = 596.9;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme
  const savedTheme = localStorage.getItem("chronos_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Initialize display
  resetDisplay();

  // Button Listeners
  startStopBtn.addEventListener("click", toggleStartStop);
  lapResetBtn.addEventListener("click", handleLapReset);
  themeToggle.addEventListener("click", toggleTheme);

  // Keyboard Shortcuts
  document.addEventListener("keydown", handleKeyboardInput);
});

// --- TIMER CONTROLLER ---
/**
 * Starts or Stops the stopwatch timer
 */
function toggleStartStop() {
  if (!isRunning) {
    // START TIMING
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    animationFrameId = requestAnimationFrame(updateTimerLoop);

    // Update Controls State
    startStopBtn.classList.remove("start-state");
    startStopBtn.classList.add("stop-state");
    startStopText.textContent = "Stop";
    
    // Change Lap/Reset button to "Lap" mode
    lapResetBtn.disabled = false;
    lapResetText.textContent = "Lap";
    updateBtnIcon(lapResetBtn, "plus");
    
    updateBtnIcon(startStopBtn, "pause");
  } else {
    // STOP TIMING
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    elapsedTime = Date.now() - startTime;

    // Update Controls State
    startStopBtn.classList.remove("stop-state");
    startStopBtn.classList.add("start-state");
    startStopText.textContent = "Start";
    
    // Change Lap/Reset button to "Reset" mode
    lapResetText.textContent = "Reset";
    updateBtnIcon(lapResetBtn, "rotate-ccw");
    
    updateBtnIcon(startStopBtn, "play");
  }
}

/**
 * Handles the secondary button (Lap when running, Reset when stopped)
 */
function handleLapReset() {
  if (isRunning) {
    recordLap();
  } else {
    resetStopwatch();
  }
}

/**
 * High-precision timer animation frame update loop
 */
function updateTimerLoop() {
  elapsedTime = Date.now() - startTime;
  renderTime(elapsedTime);
  
  // Animate Circular Progress Ring
  // Complete a full circle rotation every 1 second (1000 milliseconds) for rich animation feedback
  const millisecondsOfCurrentSecond = elapsedTime % 1000;
  const progressFraction = millisecondsOfCurrentSecond / 1000;
  
  // Calculate dash offset: full circumference to 0
  const offset = RING_CIRCUMFERENCE - (progressFraction * RING_CIRCUMFERENCE);

  // Rollover Rewind Fix:
  // Disable transition when rolling over from 999ms to 0ms to prevent the rapid counter-clockwise spin
  if (millisecondsOfCurrentSecond < 60) {
    ringIndicator.style.transition = "none";
  } else {
    ringIndicator.style.transition = "stroke-dashoffset 0.05s linear, stroke var(--transition-slow)";
  }
  
  ringIndicator.style.strokeDashoffset = offset;

  if (isRunning) {
    animationFrameId = requestAnimationFrame(updateTimerLoop);
  }
}

/**
 * Formats and renders elapsed time on screen
 * @param {number} timeMs 
 */
function renderTime(timeMs) {
  const hours = Math.floor(timeMs / 3600000);
  const minutes = Math.floor((timeMs % 3600000) / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  const formattedMs = String(milliseconds).padStart(2, "0");

  display.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  displayMs.textContent = `.${formattedMs}`;
}

// --- LAP MANAGEMENT ---
/**
 * Records a new Lap split
 */
function recordLap() {
  const currentOverallTime = elapsedTime;
  const currentLapSplit = currentOverallTime - lastLapTimeMs;
  const lapNumber = laps.length + 1;

  const lapItem = {
    number: lapNumber,
    split: currentLapSplit,
    overall: currentOverallTime
  };

  laps.unshift(lapItem); // Insert at beginning of list (so newest is on top)
  lastLapTimeMs = currentOverallTime;

  // Recalculate stats (Fastest and Slowest Laps)
  recalculateLapStats();

  // Render list
  renderLapsList();
}

/**
 * Recalculates fastest/slowest lap splits in state
 */
function recalculateLapStats() {
  if (laps.length === 0) return;

  let minLapIdx = 0;
  let maxLapIdx = 0;

  for (let i = 1; i < laps.length; i++) {
    if (laps[i].split < laps[minLapIdx].split) {
      minLapIdx = i;
    }
    if (laps[i].split > laps[maxLapIdx].split) {
      maxLapIdx = i;
    }
  }

  // Clear previous tags
  laps.forEach(l => {
    l.isFastest = false;
    l.isSlowest = false;
  });

  // Only highlight if there is more than one lap to compare
  if (laps.length > 1) {
    laps[minLapIdx].isFastest = true;
    laps[maxLapIdx].isSlowest = true;

    // Show stats drawer and write values
    statsBar.classList.remove("hidden");
    fastestLapVal.textContent = formatMsToTime(laps[minLapIdx].split);
    slowestLapVal.textContent = formatMsToTime(laps[maxLapIdx].split);
  }
}

/**
 * Draws laps elements inside list container
 */
function renderLapsList() {
  if (laps.length === 0) {
    lapsList.innerHTML = `<div class="empty-laps">No laps recorded yet</div>`;
    return;
  }

  lapsList.innerHTML = "";
  laps.forEach(lap => {
    const div = document.createElement("div");
    div.className = "lap-item";
    if (lap.isFastest) div.classList.add("fastest");
    if (lap.isSlowest) div.classList.add("slowest");

    div.innerHTML = `
      <span class="lap-num">Lap ${lap.number}</span>
      <span class="lap-split">${formatMsToTime(lap.split)}</span>
      <span class="lap-overall">${formatMsToTime(lap.overall)}</span>
    `;

    lapsList.appendChild(div);
  });
}

/**
 * Resets overall stopwatch timing values, statistics and lists
 */
function resetStopwatch() {
  if (isRunning) return;

  cancelAnimationFrame(animationFrameId);
  elapsedTime = 0;
  startTime = 0;
  lastLapTimeMs = 0;
  laps = [];

  // Reset displays
  resetDisplay();
  
  // Reset buttons
  lapResetBtn.disabled = true;
  lapResetText.textContent = "Lap";
  updateBtnIcon(lapResetBtn, "plus");

  // Reset list
  renderLapsList();

  // Reset stats
  statsBar.classList.add("hidden");
  fastestLapVal.textContent = "--:--.--";
  slowestLapVal.textContent = "--:--.--";
}

/**
 * Sets displays to default initial zero values
 */
function resetDisplay() {
  display.textContent = "00:00:00";
  displayMs.textContent = ".00";
  ringIndicator.style.strokeDashoffset = RING_CIRCUMFERENCE;
}

// --- KEYBOARD MANAGEMENT ---
/**
 * Intercepts physical keyboard inputs for quick triggers
 * @param {KeyboardEvent} e 
 */
function handleKeyboardInput(e) {
  // Spacebar to play/pause
  if (e.key === " ") {
    e.preventDefault();
    toggleStartStop();
  }
  // L key to Record Lap
  else if (e.key.toLowerCase() === "l") {
    if (isRunning) recordLap();
  }
  // R key to Reset timer
  else if (e.key.toLowerCase() === "r") {
    if (!isRunning && elapsedTime > 0) resetStopwatch();
  }
}

// --- VISUAL/THEME UTILITIES ---
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
 * Helper to format raw milliseconds into clean MM:SS.cc time formats
 * @param {number} ms 
 * @returns {string}
 */
function formatMsToTime(ms) {
  const computedHours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  const formattedMins = String(minutes).padStart(2, "0");
  const formattedSecs = String(seconds).padStart(2, "0");
  const formattedCs = String(centiseconds).padStart(2, "0");

  if (computedHours > 0) {
    const formattedHours = String(computedHours).padStart(2, "0");
    return `${formattedHours}:${formattedMins}:${formattedSecs}.${formattedCs}`;
  }
  return `${formattedMins}:${formattedSecs}.${formattedCs}`;
}

/**
 * Toggles color settings
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("chronos_theme", newTheme);
}
