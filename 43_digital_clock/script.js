/**
 * AeroTime - Premium Ambient Digital Clock
 * Fluid Orbital Seconds Sweep & Multi-Theme Controller
 */

// --- DOM ELEMENTS ---
const timeDisplay = document.getElementById("time-display");
const secondsDisplay = document.getElementById("seconds-display");
const meridiemDisplay = document.getElementById("meridiem-display");
const dayDisplay = document.getElementById("day-display");
const dateDisplay = document.getElementById("date-display");
const formatToggle = document.getElementById("format-toggle");
const formatLabel = document.getElementById("format-label");
const themeSelector = document.getElementById("theme-selector");
const secondsIndicator = document.getElementById("seconds-indicator");

// --- THEME & CONFIG CONFIGURATION ---
const THEMES = ["aurora", "sunset", "glow", "mint"];
let activeTheme = "aurora";
let timeFormat = "12"; // "12" or "24"

// SVG Circumference config: 2 * PI * r = 2 * 3.14159 * 105 = 659.7
const RING_CIRCUMFERENCE = 659.7;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme
  activeTheme = localStorage.getItem("aerotime_theme") || "aurora";
  applyTheme(activeTheme);

  // Load Time Format
  timeFormat = localStorage.getItem("aerotime_format") || "12";
  applyFormatState();

  // Button Action Listeners
  formatToggle.addEventListener("click", toggleFormat);
  themeSelector.addEventListener("click", cycleTheme);

  // Setup dot indicators click handlers
  THEMES.forEach(theme => {
    const dot = document.getElementById(`dot-${theme}`);
    if (dot) {
      dot.addEventListener("click", () => applyTheme(theme));
    }
  });

  // Start smooth clock render loop
  requestAnimationFrame(clockTickLoop);
});

// --- CLOCK CONTROLLER LOOP ---
/**
 * Drives sub-second orbital sweeps and updates digits on intervals
 */
function clockTickLoop() {
  const now = new Date();
  
  // 1. Digital Time Update
  updateDigitalTime(now);

  // 2. Date and Weekday Update
  updateDateRow(now);

  // 3. Fluid Seconds Ring Animation
  // Sweeps continuously by adding fractional milliseconds to the active second count
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const continuousSeconds = seconds + (milliseconds / 1000);
  
  // Progress fraction: 0 to 1 over 60 seconds
  const progressFraction = continuousSeconds / 60;
  
  // Calculate dashoffset: full ring (659.7) to 0
  const offset = RING_CIRCUMFERENCE - (progressFraction * RING_CIRCUMFERENCE);

  // Rollover Rewind Fix: 
  // Disable transition when rolling over from 59 to 0 to prevent the counter-clockwise rewind animation
  if (seconds === 0 && milliseconds < 150) {
    secondsIndicator.style.transition = "none";
  } else {
    secondsIndicator.style.transition = "stroke-dashoffset 0.1s linear, stroke var(--transition-slow)";
  }
  
  secondsIndicator.style.strokeDashoffset = offset;

  // Request next frame
  requestAnimationFrame(clockTickLoop);
}

// --- CLOCK WRITERS ---
/**
 * Formats time display outputs based on 12h/24h selections
 * @param {Date} now 
 */
function updateDigitalTime(now) {
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  if (timeFormat === "12") {
    // 12-hour formatting
    const meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, "0");
    
    timeDisplay.textContent = `${formattedHours}:${minutes}`;
    secondsDisplay.textContent = seconds;
    meridiemDisplay.textContent = meridiem;
    meridiemDisplay.style.display = "inline-block";
  } else {
    // 24-hour formatting
    const formattedHours = String(hours).padStart(2, "0");
    
    timeDisplay.textContent = `${formattedHours}:${minutes}`;
    secondsDisplay.textContent = seconds;
    meridiemDisplay.style.display = "none";
  }
}

/**
 * Formats and renders dynamic Date and Weekday titles
 * @param {Date} now 
 */
function updateDateRow(now) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const weekday = days[now.getDay()];
  const month = months[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();

  dayDisplay.textContent = weekday;
  dateDisplay.textContent = `${month} ${dateNum}, ${year}`;
}

// --- CONFIGURATION CHANGES ---
/**
 * Toggles hour format configurations
 */
function toggleFormat() {
  timeFormat = timeFormat === "12" ? "24" : "12";
  localStorage.setItem("aerotime_format", timeFormat);
  applyFormatState();
}

/**
 * Syncs format controls UI labels
 */
function applyFormatState() {
  document.documentElement.setAttribute("data-format", timeFormat);
  formatLabel.textContent = timeFormat === "12" ? "12H" : "24H";
}

/**
 * Cycles to the next theme in the available HSL themes array
 */
function cycleTheme() {
  let nextIdx = (THEMES.indexOf(activeTheme) + 1) % THEMES.length;
  applyTheme(THEMES[nextIdx]);
}

/**
 * Applies a selected HSL theme and syncs dot indicators
 * @param {string} themeName 
 */
function applyTheme(themeName) {
  if (!THEMES.includes(themeName)) return;

  activeTheme = themeName;
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("aerotime_theme", themeName);

  // Sync indicators paginated dots
  THEMES.forEach(theme => {
    const dot = document.getElementById(`dot-${theme}`);
    if (dot) {
      if (theme === themeName) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    }
  });
}
