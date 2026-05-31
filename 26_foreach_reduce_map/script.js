// forEach() = method used to iterate over the elements
//                     of an array and apply a specified function (callback)
//                     to each element

//                     array.forEach(callback)
//                     element, index, array are provided

// -------------- EXAMPLE 1 --------------

let numbers = [1, 2, 3, 4, 5];

numbers.forEach(cube);
numbers.forEach(display);

function double(element, index, array) {
  array[index] = element * 2;
}

function triple(element, index, array) {
  array[index] = element * 3;
}

function square(element, index, array) {
  array[index] = Math.pow(element, 2);
}

function cube(element, index, array) {
  array[index] = Math.pow(element, 3);
}

function display(element) {
  console.log(element);
}

// -------------- EXAMPLE 2 --------------

let fruits = ["apple", "orange", "banana", "coconut"];

fruits.forEach(capitalize);
fruits.forEach(display);

function upperCase(element, index, array) {
  array[index] = element.toUpperCase();
}

function lowercase(element, index, array) {
  array[index] = element.toLowerCase();
}

function capitalize(element, index, array) {
  array[index] = element.charAt(0).toUpperCase() + element.slice(1);
}

/*
function display(element){
    console.log(element);
}
*/

// .map() = accepts a callback and applies that function 
//                 to each element of an array, then return a new array

// ------------ EXAMPLE 1 ------------
numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(square);
const cubed = numbers.map(cube);

console.log(cubed);

function square(element){
    return Math.pow(element, 2);
}

function cube(element){
    return Math.pow(element, 3);
}

// ------------ EXAMPLE 2 ------------
const students = ["Spongebob", "Patrick", "Squidward", "Sandy"];
const studentsUpper = students.map(upperCase);
const studentsLower = students.map(lowerCase);

console.log(studentsLower);

function upperCase(element){
    return element.toUpperCase();
}

function lowerCase(element){
    return element.toLowerCase();
}

// ------------ EXAMPLE 3 ------------
const dates = ["2024-1-10", "2025-2-20", "2026-3-30"];
const formattedDates = dates.map(formatDates);

console.log(formattedDates);

function formatDates(element){
    const parts = element.split("-");
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}


// filter() = creates a new array by filtering out
//                elements with a callback

// ----------- EXAMPLE 1 -----------
 numbers = [1, 2, 3, 4, 5, 6, 7];
let evenNums = numbers.filter(isEven);
let oddNums = numbers.filter(isOdd);

console.log(oddNums);

function isEven(element){
    return element % 2 === 0;
}

function isOdd(element){
    return element % 2 !== 0;
}

// ----------- EXAMPLE 2 -----------
let ages = [16, 17, 17, 18, 19, 20, 65];
let adults = ages.filter(isAdult);
let children = ages.filter(isChild);

console.log(children);

function isAdult(element){
    return element >= 18;
}

function isChild(element){
    return element < 18;
}

// ----------- EXAMPLE 3 -----------
const words = ['apple', 'orange', 'kiwi', 'banana', 'pomegranate', 'coconut',];
const longWords = words.filter(getLongWords);
const shortWords = words.filter(getShortWords);

console.log(shortWords);

function getShortWords(element){
    return element.length <= 6;
}

function getLongWords(element){
    return element.length > 6;
}


// .reduce() = reduce the elements of an array
//                     to a single value    

// ----------- EXAMPLE 1 -----------
const prices = [5, 30, 10, 25, 15, 20];
const total = prices.reduce(sum);

console.log(`$${total.toFixed(2)}`);

function sum(accumulator, element){
    return accumulator + element;
}

// ----------- EXAMPLE 2 -----------
const scores = [75, 50, 90, 80, 65, 95];
const maximum = scores.reduce(getMax);
const minimum = scores.reduce(getMin);

console.log(maximum);
console.log(minimum);

function getMax(accumulator, element){
    return Math.max(accumulator, element);
}

function getMin(accumulator, element){
    return Math.min(accumulator, element);
}