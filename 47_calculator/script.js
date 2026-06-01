/**
 * CalcuLyfe - Premium Soothing Calculator
 * Advanced Logic & Visual Interactions
 */

// --- DOM ELEMENTS ---
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression-display");
const equalsIndicator = document.getElementById("equals-indicator");
const themeToggle = document.getElementById("theme-toggle");
const historyToggle = document.getElementById("history-toggle");
const closeHistory = document.getElementById("close-history");
const historyDrawer = document.getElementById("history-drawer");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// --- APP STATE ---
let currentExpression = "0";
let isCalculationPerformed = false;
let history = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme
  const savedTheme = localStorage.getItem("calculyfe_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Load History
  loadHistoryFromStorage();

  // Keyboard Event Listeners
  document.addEventListener("keydown", handleKeyboardInput);

  // Theme Toggle Click Handler
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("calculyfe_theme", newTheme);
  });

  // History Drawer Toggle
  historyToggle.addEventListener("click", () => {
    historyDrawer.classList.add("active");
  });

  closeHistory.addEventListener("click", () => {
    historyDrawer.classList.remove("active");
  });

  clearHistoryBtn.addEventListener("click", clearHistory);
});

// --- DISPLAY UPDATE & UX FORMATTING ---
/**
 * Appends numbers or operator tokens to current state and updates display
 * @param {string} token 
 */
function appendToDisplay(token) {
  // If calculation was just completed, typing a number starts fresh
  if (isCalculationPerformed) {
    if (isOperator(token)) {
      isCalculationPerformed = false;
    } else {
      currentExpression = "";
      isCalculationPerformed = false;
    }
  }

  // Handle initial zero state
  if (currentExpression === "0" && !isOperator(token) && token !== ".") {
    currentExpression = "";
  }

  // Decimal logic checks
  if (token === ".") {
    // Prevent double decimals in the active input number token
    const lastNumberToken = currentExpression.split(/[\+\-\*\/]/).pop();
    if (lastNumberToken.includes(".")) {
      return;
    }
    // If decimal is pressed first or directly after an operator, prepend a '0' for cleaner UX
    if (lastNumberToken === "") {
      currentExpression += "0.";
      updateDisplay();
      return;
    }
  }

  // Smart Operator Overwriting
  if (isOperator(token)) {
    const lastChar = currentExpression.slice(-1);
    if (isOperator(lastChar)) {
      // Overwrite previous operator
      currentExpression = currentExpression.slice(0, -1) + token;
      updateDisplay();
      return;
    }
  }

  currentExpression += token;
  updateDisplay();
}

/**
 * Handles backspace action
 */
function backspace() {
  if (isCalculationPerformed) {
    clearDisplay();
    return;
  }

  if (currentExpression.length <= 1 || currentExpression === "0") {
    currentExpression = "0";
  } else {
    currentExpression = currentExpression.slice(0, -1);
  }
  updateDisplay();
}

/**
 * Clears display state entirely
 */
function clearDisplay() {
  currentExpression = "0";
  expressionDisplay.textContent = "";
  equalsIndicator.classList.remove("visible");
  isCalculationPerformed = false;
  updateDisplay();
}

function updateDisplay() {
  let visualExpression = currentExpression;

  // 1. Format negative numbers preceded by operators: e.g. "5*-3" -> "5*(−3)"
  visualExpression = visualExpression.replace(/([\+\-\*\/])\-(\d+\.?\d*)/g, "$1(−$2)");

  // 2. Format multiplication and division with spacing
  visualExpression = visualExpression
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ");

  // 3. Format addition and subtraction with spacing. 
  // We only pad addition/subtraction if they are binary operators (preceded by a number/parenthesis).
  // This prevents padding a leading minus or plus at the start of the string!
  visualExpression = visualExpression
    .replace(/([0-9.)])\+/g, "$1 + ")
    .replace(/([0-9.)])\-/g, "$1 − ");

  // 4. If a minus remains at the start of the string, convert it to the elegant visual minus character, without padding spaces!
  if (visualExpression.startsWith("-")) {
    visualExpression = "−" + visualExpression.slice(1);
  }

  display.value = visualExpression || "0";

  // Dynamic Font Sizing
  const textLength = display.value.length;
  if (textLength > 18) {
    display.style.fontSize = "1.5rem";
  } else if (textLength > 12) {
    display.style.fontSize = "1.9rem";
  } else if (textLength > 8) {
    display.style.fontSize = "2.3rem";
  } else {
    display.style.fontSize = "2.7rem";
  }
}

// --- EVALUATION LOGIC ---
/**
 * Safe calculation and floating point fixer
 */
function calculate() {
  if (currentExpression === "0" || isCalculationPerformed) return;

  // If ends with an operator, strip it first
  let expressionToEvaluate = currentExpression;
  if (isOperator(expressionToEvaluate.slice(-1))) {
    expressionToEvaluate = expressionToEvaluate.slice(0, -1);
  }

  try {
    // Process percentages (e.g. 50% => 50/100)
    let processedExpression = expressionToEvaluate.replace(/%/g, "/100");

    // Standard Math evaluation
    let result = eval(processedExpression);

    if (result === undefined || isNaN(result)) {
      throw new Error("Invalid calculation");
    }

    // Precise handling of JS float errors (e.g., 0.1 + 0.2 = 0.3)
    if (result !== Infinity && result !== -Infinity) {
      result = Math.round(result * 1e12) / 1e12;
    }

    // Update screen components
    const visualExpr = expressionToEvaluate
      .replace(/\*/g, " × ")
      .replace(/\//g, " ÷ ")
      .replace(/\+/g, " + ")
      .replace(/\-/g, " − ");

    expressionDisplay.textContent = visualExpr;
    equalsIndicator.classList.add("visible");

    // Save calculation to History
    saveHistoryItem(visualExpr, result);

    // Set new current expression as the result
    currentExpression = String(result);
    isCalculationPerformed = true;
    updateDisplay();

  } catch (error) {
    display.value = "Error";
    display.style.fontSize = "2.7rem";
    currentExpression = "0";
    isCalculationPerformed = true;
  }
}

/**
 * Toggle positive/negative sign of current number
 */
function toggleSign() {
  if (isCalculationPerformed) {
    isCalculationPerformed = false;
  }

  if (currentExpression === "0" || currentExpression === "") return;

  // Match the trailing number token (with an optional leading minus)
  const match = currentExpression.match(/(-?)([0-9.]+)$/);
  if (!match) return;

  const fullMatch = match[0]; // e.g. "-3", "3", "-1.5"
  const hasMinus = match[1] === "-";
  const numberPart = match[2];

  const matchIndex = currentExpression.lastIndexOf(fullMatch);

  if (hasMinus) {
    // If minus is at the beginning or preceded by an operator, it is a unary negative sign
    const charBeforeMinus = currentExpression.charAt(matchIndex - 1);
    if (matchIndex === 0 || isOperator(charBeforeMinus)) {
      currentExpression = currentExpression.slice(0, matchIndex) + numberPart;
    } else {
      // It is a binary subtraction operator (e.g. "5-3"). Convert subtraction to adding a negative: "5+-3"
      currentExpression = currentExpression.slice(0, matchIndex) + "+" + "-" + numberPart;
    }
  } else {
    // No minus sign at start of trailing number part
    const charBeforeNumber = currentExpression.charAt(matchIndex - 1);
    if (charBeforeNumber === "+") {
      // Toggle plus to minus
      currentExpression = currentExpression.slice(0, matchIndex - 1) + "-" + numberPart;
    } else {
      // Otherwise, insert negative sign (e.g. "5*3" -> "5*-3" or "5" -> "-5")
      currentExpression = currentExpression.slice(0, matchIndex) + "-" + numberPart;
    }
  }

  updateDisplay();
}

// --- KEYBOARD LISTENER ---
/**
 * Event handler for system physical keyboard presses
 * @param {KeyboardEvent} e 
 */
function handleKeyboardInput(e) {
  // Prevent default scrolling for Spacebar when calculator is in focus
  if (e.key === " ") {
    e.preventDefault();
    return;
  }

  // Digit presses
  if (/^[0-9]$/.test(e.key)) {
    appendToDisplay(e.key);
  }
  // Decimal dot
  else if (e.key === "." || e.key === ",") {
    appendToDisplay(".");
  }
  // Math operators
  else if (e.key === "+") {
    appendToDisplay("+");
  } else if (e.key === "-") {
    appendToDisplay("-");
  } else if (e.key === "*") {
    appendToDisplay("*");
  } else if (e.key === "/") {
    e.preventDefault(); // Prevent opening default browser search
    appendToDisplay("/");
  } else if (e.key === "%") {
    appendToDisplay("%");
  }
  // Enter or Equals key
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  }
  // Backspace key
  else if (e.key === "Backspace") {
    backspace();
  }
  // Escape key for clearing
  else if (e.key === "Escape") {
    clearDisplay();
  }
}

// --- UTILITY CHECKS ---
/**
 * Check if the character is a standard mathematical operator
 * @param {string} char 
 * @returns {boolean}
 */
function isOperator(char) {
  return ["+", "-", "*", "/"].includes(char);
}

// --- LOCAL STORAGE HISTORY FUNCTIONS ---
/**
 * Adds an item to calculation history drawer and local storage
 * @param {string} expr 
 * @param {number|string} res 
 */
function saveHistoryItem(expr, res) {
  const item = { expr, res };
  history.unshift(item); // Add to beginning of array

  // Cap history at 30 items
  if (history.length > 30) {
    history.pop();
  }

  localStorage.setItem("calculyfe_history", JSON.stringify(history));
  renderHistory();
}

/**
 * Loads and renders history items from local storage
 */
function loadHistoryFromStorage() {
  const stored = localStorage.getItem("calculyfe_history");
  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch (e) {
      history = [];
    }
  }
  renderHistory();
}

/**
 * Redraws history sidebar listings
 */
function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = `<div class="empty-history">No history yet</div>`;
    return;
  }

  historyList.innerHTML = "";
  history.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <span class="history-expr">${item.expr}</span>
      <span class="history-res">${item.res}</span>
    `;

    // Click handler to load historical result/expression back to calculator screen
    div.addEventListener("click", () => {
      // Clean up multiplication/division signs back to computer syntax
      let cleanExpr = item.expr
        .replace(/ ÷ /g, "/")
        .replace(/ × /g, "*")
        .replace(/ − /g, "-")
        .replace(/ \+ /g, "+");
      
      currentExpression = cleanExpr;
      isCalculationPerformed = false;
      equalsIndicator.classList.remove("visible");
      expressionDisplay.textContent = "";
      updateDisplay();
      historyDrawer.classList.remove("active"); // auto close drawer for fluid workflow
    });

    historyList.appendChild(div);
  });
}

/**
 * Clears history from state, UI, and LocalStorage
 */
function clearHistory() {
  history = [];
  localStorage.removeItem("calculyfe_history");
  renderHistory();
}