// function = A section of reusable code.
//                    Declare code once, use it whenever you want.
//                    Call the function to execute that code.

function happyBirthday(username, age){
    console.log(`Happy birthday to you!`);
    console.log(`Happy birthday to you!`);
    console.log(`Happy birthday dear, ${username}`);
    console.log(`Happy birthday to you!`);
    console.log(`You are ${age} years old!`);
}

function add(x, y){
    return x + y;
}

function subtract(x, y){
    return x - y;
}

function multiply(x, y){
    return x * y;
}

function divide(x, y){
    return x / y;
}

function isEven(number){

    return number % 2 === 0 ? true : false;
}

function isValidEmail(email){

    return email.includes("@") ? true : false;
}

console.log(happyBirthday("Gurpreet Singh", 21));
console.log(isValidEmail("Gurpreet@gmail.com"));
console.log(add(2,5));
console.log(subtract(5,2));
console.log(multiply(2,5));
console.log(divide(5,2));
console.log(isEven(2));

// variable scope = where a variable is recognized
//                               and accessible (local vs global)            

let x = 3; // global scope

function1();

function function1(){
    let x = 1; // local scope
    console.log(x);
}

function function2(){
    let x = 2; // local scope
    console.log(x);
}

console.log(x);