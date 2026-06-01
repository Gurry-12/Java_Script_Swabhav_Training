/**
 * AeroCalc - Ambient Interest Dashboard
 * Elegant, real-time simple & compound interest calculator with dynamic HSL investment ratios,
 * year-by-year growth schedule projections, collapsible amortization drawers, and persistent state.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements Selection ---
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  const tabSimple = document.getElementById("tab-simple");
  const tabCompound = document.getElementById("tab-compound");
  
  const principalText = document.getElementById("principal-text");
  const principalSlider = document.getElementById("principal-slider");
  
  const rateText = document.getElementById("rate-text");
  const rateSlider = document.getElementById("rate-slider");
  
  const timeText = document.getElementById("time-text");
  const timeSlider = document.getElementById("time-slider");
  
  const frequencySelect = document.getElementById("frequency-select");
  const frequencyGroup = document.getElementById("frequency-select-group");
  
  const principalSegment = document.getElementById("principal-segment");
  const interestSegment = document.getElementById("interest-segment");
  const ratioPrincipalPct = document.getElementById("ratio-principal-pct");
  const ratioInterestPct = document.getElementById("ratio-interest-pct");
  
  const interestDisplay = document.getElementById("interest-display");
  const balanceDisplay = document.getElementById("balance-display");
  
  const accordionToggle = document.getElementById("accordion-toggle");
  const growthDrawer = document.getElementById("growth-drawer");
  const growthTableBody = document.getElementById("growth-table-body");

  // --- Theme Toggle Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem("aero-theme") || "dark";
    htmlEl.setAttribute("data-theme", savedTheme);
  }

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = htmlEl.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    htmlEl.setAttribute("data-theme", newTheme);
    localStorage.setItem("aero-theme", newTheme);
  });

  // --- State Persistence Helpers ---
  function saveStateToLocalStorage() {
    const state = {
      mode: htmlEl.getAttribute("data-mode") || "compound",
      principal: principalText.value,
      rate: rateText.value,
      time: timeText.value,
      frequency: frequencySelect.value
    };
    localStorage.setItem("aero-calc-state", JSON.stringify(state));
  }

  function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem("aero-calc-state");
    if (!savedState) return false;
    
    try {
      const state = JSON.parse(savedState);
      
      // Mode Setup
      const activeMode = state.mode || "compound";
      htmlEl.setAttribute("data-mode", activeMode);
      if (activeMode === "simple") {
        tabSimple.classList.add("active");
        tabCompound.classList.remove("active");
      } else {
        tabCompound.classList.add("active");
        tabSimple.classList.remove("active");
      }
      
      // Values Setup
      principalText.value = state.principal || "10000";
      principalSlider.value = Math.min(Number(state.principal || "10000"), Number(principalSlider.max));
      
      rateText.value = state.rate || "7.5";
      rateSlider.value = Math.min(Number(state.rate || "7.5"), Number(rateSlider.max));
      
      timeText.value = state.time || "10";
      timeSlider.value = Math.min(Number(state.time || "10"), Number(timeSlider.max));
      
      frequencySelect.value = state.frequency || "4";
      
      return true;
    } catch (e) {
      console.error("Error loading calculator state:", e);
      return false;
    }
  }

  // --- Input Synchronization & Clamping ---
  function setupInputSync(textEl, sliderEl, minVal, maxVal, stepVal) {
    // When range slider drags: update text immediately and calculate
    sliderEl.addEventListener("input", () => {
      textEl.value = sliderEl.value;
      calculate();
    });

    sliderEl.addEventListener("change", () => {
      saveStateToLocalStorage();
    });

    // When text changes: sync slider (with clamping boundary for visual safety)
    textEl.addEventListener("input", () => {
      const val = parseFloat(textEl.value);
      if (!isNaN(val)) {
        sliderEl.value = Math.max(parseFloat(sliderEl.min), Math.min(val, parseFloat(sliderEl.max)));
        calculate();
      }
    });

    // When text loses focus: enforce structural limits and snap to step
    textEl.addEventListener("blur", () => {
      let val = parseFloat(textEl.value);
      if (isNaN(val) || val < minVal) {
        val = minVal;
      } else if (val > maxVal) {
        val = maxVal;
      }
      
      // Snap to nearest step increments
      val = Math.round(val / stepVal) * stepVal;
      // Precision control for decimals (e.g. Rate steps of 0.1)
      const decimalPlaces = (stepVal.toString().split(".")[1] || "").length;
      textEl.value = val.toFixed(decimalPlaces);
      
      sliderEl.value = Math.max(parseFloat(sliderEl.min), Math.min(val, parseFloat(sliderEl.max)));
      
      calculate();
      saveStateToLocalStorage();
    });
  }

  // --- Mode Switches (Simple Interest vs Compound Interest) ---
  function setCalculationMode(mode) {
    htmlEl.setAttribute("data-mode", mode);
    saveStateToLocalStorage();
    calculate();
  }

  tabSimple.addEventListener("click", () => {
    tabSimple.classList.add("active");
    tabCompound.classList.remove("active");
    setCalculationMode("simple");
  });

  tabCompound.addEventListener("click", () => {
    tabCompound.classList.add("active");
    tabSimple.classList.remove("active");
    setCalculationMode("compound");
  });

  frequencySelect.addEventListener("change", () => {
    calculate();
    saveStateToLocalStorage();
  });

  // --- Collapsible Year Schedule Drawer Toggle ---
  accordionToggle.addEventListener("click", () => {
    const isCollapsed = growthDrawer.classList.contains("collapsed");
    if (isCollapsed) {
      growthDrawer.classList.remove("collapsed");
      accordionToggle.classList.add("active");
      accordionToggle.querySelector("span").textContent = "Hide Growth Schedule";
    } else {
      growthDrawer.classList.add("collapsed");
      accordionToggle.classList.remove("active");
      accordionToggle.querySelector("span").textContent = "Show Growth Schedule";
    }
  });

  // --- Core Calculation & UI Rendering Engine ---
  function calculate() {
    const mode = htmlEl.getAttribute("data-mode") || "compound";
    const P = parseFloat(principalText.value) || 0;
    const R = parseFloat(rateText.value) || 0;
    const T = parseFloat(timeText.value) || 0;
    const n = parseFloat(frequencySelect.value) || 1;

    let interestEarned = 0;
    let totalBalance = 0;
    const yearlySchedule = [];

    if (mode === "simple") {
      // --- Simple Interest Math ---
      // I = P * R * T / 100
      interestEarned = P * (R / 100) * T;
      totalBalance = P + interestEarned;

      // Build Yearly Projections for Simple Interest
      const fullYears = Math.floor(T);
      for (let y = 1; y <= fullYears; y++) {
        const cumulativeInterest = P * (R / 100) * y;
        yearlySchedule.push({
          year: `Year ${y}`,
          interest: cumulativeInterest,
          balance: P + cumulativeInterest
        });
      }
      
      // Handle fractional trailing period if Time contains a decimal
      if (T > fullYears) {
        yearlySchedule.push({
          year: `Year ${T.toFixed(1)}`,
          interest: interestEarned,
          balance: totalBalance
        });
      }
    } else {
      // --- Compound Interest Math ---
      // A = P * (1 + R / (100 * n))^(n * T)
      if (R === 0) {
        totalBalance = P;
      } else {
        totalBalance = P * Math.pow(1 + (R / 100) / n, n * T);
      }
      interestEarned = totalBalance - P;

      // Build Yearly Projections for Compound Interest
      const fullYears = Math.floor(T);
      for (let y = 1; y <= fullYears; y++) {
        const yBalance = P * Math.pow(1 + (R / 100) / n, n * y);
        yearlySchedule.push({
          year: `Year ${y}`,
          interest: yBalance - P,
          balance: yBalance
        });
      }
      
      // Handle fractional trailing period for compound interest
      if (T > fullYears) {
        yearlySchedule.push({
          year: `Year ${T.toFixed(1)}`,
          interest: interestEarned,
          balance: totalBalance
        });
      }
    }

    // --- Render Primary Display Card Results ---
    interestDisplay.textContent = formatCurrency(interestEarned);
    balanceDisplay.textContent = formatCurrency(totalBalance);

    // --- Render Investment Segmented Ratio Progress Bar ---
    let principalPct = 100;
    let interestPct = 0;
    
    if (totalBalance > 0) {
      principalPct = (P / totalBalance) * 100;
      interestPct = (interestEarned / totalBalance) * 100;
    }

    principalSegment.style.width = `${principalPct}%`;
    interestSegment.style.width = `${interestPct}%`;
    
    ratioPrincipalPct.textContent = `${Math.round(principalPct)}%`;
    ratioInterestPct.textContent = `${Math.round(interestPct)}%`;

    // --- Populate Yearly Projections Table Rows ---
    renderTableSchedule(yearlySchedule);
  }

  // --- Currency Formatting Utility ---
  function formatCurrency(amount) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // --- Growth Table Populate Utility ---
  function renderTableSchedule(schedule) {
    growthTableBody.innerHTML = "";
    
    if (schedule.length === 0) {
      growthTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No year projections available.</td></tr>`;
      return;
    }

    schedule.forEach(row => {
      const tr = document.createElement("tr");
      
      const tdYear = document.createElement("td");
      tdYear.textContent = row.year;
      
      const tdInterest = document.createElement("td");
      tdInterest.textContent = formatCurrency(row.interest);
      
      const tdBalance = document.createElement("td");
      tdBalance.textContent = formatCurrency(row.balance);
      
      tr.appendChild(tdYear);
      tr.appendChild(tdInterest);
      tr.appendChild(tdBalance);
      
      growthTableBody.appendChild(tr);
    });
  }

  // --- Initialization Sequences ---
  initTheme();
  
  // Set boundaries matching HTML attributes
  setupInputSync(principalText, principalSlider, 500, 1000000, 500);
  setupInputSync(rateText, rateSlider, 0.1, 30, 0.1);
  setupInputSync(timeText, timeSlider, 1, 50, 1);
  
  // Try loading previous state, fallback to initial default calculations
  const stateLoaded = loadStateFromLocalStorage();
  calculate();
  
  // Save initial state if none exists yet
  if (!stateLoaded) {
    saveStateToLocalStorage();
  }
});
