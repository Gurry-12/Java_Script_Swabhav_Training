// variable = A container that store a value 
//            Behaves as if were the value it contained.

// 1. declaration           let x;
// 2. assignment            x  = 100;

// declatration 
let x;
let y;

// let x;
// let x;
// variable can't have same name at declaration 

// assignment
x = 123;

// declare + assign 
// let m = 123;

// // data types 
// // 1.  numbers 
// let age = 25;
// let price = 10.99;
// let gpa = 2.1;
// console.log(age);
// console.log(price);
// console.log(gpa);

// console.log(`You are ${age} years old`);
// console.log(`The price is $${price}`);
// console.log(`Your gpa is: ${gpa}`);

// // 2. String s
// let firstName = "Gurii";
// let favoriteFood = "Grill Sandwich";
// let email = "Gurii@example.com";

// console.log(typeof firstName);
// console.log(`Your name is ${firstName}`);
// console.log(`You like ${favoriteFood}`);
// console.log(`Your email is ${email}`);

// // 3. boolean
// // flags - true , false
// let online = true;
// let forSale = true;
// let isStudent = true;


// console.log(typeof online);
// console.log(`Bro is online: ${online}`);
// console.log(`Is this car for sale: ${forSale}`);
// console.log(`Enrolled: ${isStudent}`); 


let firstName = "Gurpreet Singh";
let age = 21;
let student = false; 

document.getElementById("p1").textContent = `Your name is ${firstName}`;
document.getElementById("p2").textContent = `You are ${age} years old`;
document.getElementById("p3").textContent = `Enrolled: ${student}`;