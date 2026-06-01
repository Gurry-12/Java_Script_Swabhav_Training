/**
 * AeroTemp - Ambient Thermal Converter
 * Live Real-Time Conversions & Dynamic Thermal Indicator States
 */

// --- DOM ELEMENTS ---
const textBox = document.getElementById("textBox");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const swapBtn = document.getElementById("swap-units-btn");
const resultDisplay = document.getElementById("result");
const mercuryFluid = document.getElementById("mercury-fluid");
const tempStatus = document.getElementById("temp-status");
const themeToggle = document.getElementById("theme-toggle");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme Configuration
  const savedTheme = localStorage.getItem("aerotemp_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Live Event Listeners for real-time conversion
  textBox.addEventListener("input", performLiveConversion);
  fromUnit.addEventListener("change", performLiveConversion);
  toUnit.addEventListener("change", performLiveConversion);

  // Swap Units Button
  swapBtn.addEventListener("click", swapTemperatureUnits);

  // Theme Toggler
  themeToggle.addEventListener("click", toggleTheme);

  // Quick Presets Click Bindings
  const presetCards = document.querySelectorAll(".preset-card");
  presetCards.forEach(card => {
    card.addEventListener("click", () => {
      const presetVal = parseFloat(card.getAttribute("data-val"));
      const presetUnit = card.getAttribute("data-unit");
      
      // Load preset settings
      textBox.value = presetVal;
      fromUnit.value = presetUnit;
      
      // Trigger live updates
      performLiveConversion();
    });
  });

  // Perform initial conversion on load
  performLiveConversion();
});

// --- TEMPERATURE CONVERSION ENGINE ---
/**
 * Executes real-time conversions and updates display outputs, thermometer scales, and body mood colors
 */
function performLiveConversion() {
  const rawInput = textBox.value.trim();
  
  // Guard clause for empty or invalid inputs
  if (rawInput === "" || isNaN(parseFloat(rawInput))) {
    resultDisplay.textContent = "--";
    mercuryFluid.style.width = "0%";
    tempStatus.textContent = "Inactive";
    document.documentElement.className = "thermal-neutral";
    return;
  }

  const inputVal = parseFloat(rawInput);
  const sourceUnit = fromUnit.value;
  const targetUnit = toUnit.value;

  // 1. Core Conversion Math
  let resultVal;
  
  if (sourceUnit === targetUnit) {
    resultVal = inputVal;
  } else {
    // Celsius Conversions
    if (sourceUnit === "C") {
      if (targetUnit === "F") resultVal = (inputVal * 9) / 5 + 32;
      else if (targetUnit === "K") resultVal = inputVal + 273.15;
    }
    // Fahrenheit Conversions
    else if (sourceUnit === "F") {
      if (targetUnit === "C") resultVal = (inputVal - 32) * (5 / 9);
      else if (targetUnit === "K") resultVal = ((inputVal - 32) * 5) / 9 + 273.15;
    }
    // Kelvin Conversions
    else if (sourceUnit === "K") {
      if (targetUnit === "C") resultVal = inputVal - 273.15;
      else if (targetUnit === "F") resultVal = ((inputVal - 273.15) * 9) / 5 + 32;
    }
  }

  // Round precisely to 2 decimal places
  const roundedResult = Math.round(resultVal * 100) / 100;
  
  // Suffix mappings
  const suffixMap = { C: "°C", F: "°F", K: "K" };
  resultDisplay.textContent = `${roundedResult.toFixed(2)}${suffixMap[targetUnit]}`;

  // 2. Thermometer Scale & Thermal Accent Status
  // Normalize input value into Celsius to evaluate standard heat indexes
  let celsiusVal = inputVal;
  if (sourceUnit === "F") {
    celsiusVal = (inputVal - 32) * (5 / 9);
  } else if (sourceUnit === "K") {
    celsiusVal = inputVal - 273.15;
  }

  updateThermalUI(celsiusVal);
}

/**
 * Updates fluid mercury scales and adapts body theme classes based on temperature heat indexes
 * @param {number} celsiusTemp 
 */
function updateThermalUI(celsiusTemp) {
  // Map Celsius temperature to scale percentage
  // Lower threshold: -20°C (0% mercury)
  // Upper threshold: 120°C (100% mercury)
  // Span range: 140 degrees
  const minScaleCelsius = -20;
  const maxScaleCelsius = 120;
  const totalRange = maxScaleCelsius - minScaleCelsius;

  let progressFraction = (celsiusTemp - minScaleCelsius) / totalRange;
  
  // Clamp progress fraction between 0% and 100%
  progressFraction = Math.max(0, Math.min(1, progressFraction));
  const fillPercentage = progressFraction * 100;

  // Write width to horizontal tube
  mercuryFluid.style.width = `${fillPercentage}%`;

  // 3. Thermal Ambient Mood Class Toggles
  // Cold: <= 12°C
  // Hot: >= 32°C
  // Neutral: comfy room temperatures
  document.documentElement.classList.remove("thermal-cold", "thermal-neutral", "thermal-hot");

  if (celsiusTemp <= 12) {
    document.documentElement.classList.add("thermal-cold");
    tempStatus.textContent = "Cold";
  } else if (celsiusTemp >= 32) {
    document.documentElement.classList.add("thermal-hot");
    tempStatus.textContent = "Hot";
  } else {
    document.documentElement.classList.add("thermal-neutral");
    tempStatus.textContent = "Comfortable";
  }
}

// --- CONFIGURATION TRIGGERS ---
/**
 * Flips selected source and target dropdown selections and re-calculates instantly
 */
function swapTemperatureUnits() {
  const prevFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = prevFrom;

  // Trigger live updates
  performLiveConversion();
  
  // Animate swap arrow rotation on btn element
  const icon = swapBtn.querySelector("i");
  if (icon) {
    icon.style.transform = "scale(0.9)";
    setTimeout(() => {
      icon.style.transform = "none";
    }, 150);
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
  localStorage.setItem("aerotemp_theme", newTheme);
}