// RANDOM PASSWORD GENERATOR
function generatePassword(
  length,
  includeLowercase,
  includeUppercase,
  includeNumbers,
  includeSymbols,
) {
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=";

  let allowedChars = "";
  let password = "";

  allowedChars += includeLowercase ? lowercaseChars : "";
  allowedChars += includeUppercase ? uppercaseChars : "";
  allowedChars += includeNumbers ? numberChars : "";
  allowedChars += includeSymbols ? symbolChars : "";

  if (isNaN(length)) {
    return `(Please enter a valid number for length)`;
  }
  if (length <= 0) {
    return `(Password length must be at least 1)`;
  }
  if (allowedChars.length === 0) {
    return `(At least 1 set of characters needs to be selected)`;
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    password += allowedChars[randomIndex];
  }

  return password;
}

// Get the display element (this can stay outside the function)
const showData = document.getElementById("showData");

// This function runs every time the button is clicked
function getPassword() {
  // 1. Grab the CURRENT values from the HTML elements right now
  const length = parseInt(document.getElementById("passwordLength").value);
  const includeLowercase = document.getElementById("hasLowerCase").checked;
  const includeUppercase = document.getElementById("hasUpperCase").checked;
  const includeNumbers = document.getElementById("hasDigit").checked;
  const includeSymbols = document.getElementById("hasSpecialChars").checked;

  // 2. Generate the password using those live values
  const password = generatePassword(
    length,
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
  );

  // 3. Display the password in the HTML
  showData.textContent = password;
}
