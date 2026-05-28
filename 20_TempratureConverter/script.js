// TEMPERATURE CONVERSION PROGRAM

const textBox = document.getElementById("textBox");
const celsiusToFahrenheit = document.getElementById("celsiusToFahrenheit");
const celsiusToKelvin = document.getElementById("celsiusToKelvin");
const fahrenheitToCelsius = document.getElementById("fahrenheitToCelsius");
const fahrenheitToKelvin = document.getElementById("fahrenheitToKelvin");
const kelvinToCelsius = document.getElementById("kelvinToCelsius");
const kelvinToFahrenheit = document.getElementById("kelvinToFahrenheit");
const result = document.getElementById("result");

function convert() {
    const val = Number(textBox.value);

    // Guard clause for empty or invalid inputs
    if (textBox.value === "") {
        result.textContent = "Please enter a value";
        return;
    }

    if (celsiusToFahrenheit.checked) {
        let temp = (val * 9) / 5 + 32;
        result.textContent = temp.toFixed(2) + "°F";
    } 
    else if (celsiusToKelvin.checked) {
        let temp = val + 273.15;
        result.textContent = temp.toFixed(2) + "K";
    } 
    else if (fahrenheitToCelsius.checked) {
        let temp = (val - 32) * (5 / 9);
        result.textContent = temp.toFixed(2) + "°C";
    } 
    else if (fahrenheitToKelvin.checked) {
        let temp = ((val - 32) * 5) / 9 + 273.15;
        result.textContent = temp.toFixed(2) + "K";
    } 
    else if (kelvinToCelsius.checked) {
        let temp = val - 273.15;
        result.textContent = temp.toFixed(2) + "°C";
    }
    else if (kelvinToFahrenheit.checked) {
        let temp = ((val - 273.15) * 9) / 5 + 32;
        result.textContent = temp.toFixed(2) + "°F";
    } 
    else {
        result.textContent = "Select a unit";
    }
}