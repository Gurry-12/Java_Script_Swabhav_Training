
// Math - built-in object that provide a collection of
//          properties and methods 

// Math.PI
console.log(Math.PI);

let x = 3.21;
let y = 2;
let z;

z = Math.round(x);
console.log(z);

x= 3.99;
z = Math.floor(x);
console.log(z);

x= 3.99;
z = Math.ceil(x);
console.log(z);

x= 3.21;
z = Math.trunc(x);
console.log(z);

x= 3;
z = Math.pow(x, y);
console.log(z);

x= 81;
z = Math.sqrt(x);
console.log(z);

x= 10;
z = Math.log(x);
console.log(z);

x= 45;
z = Math.sin(x);
console.log(z);

x= 45;
z = Math.cos(x);
console.log(z);

x= 45;
z = Math.tan(x);
console.log(z);

x= -1;
z = Math.abs(x);
console.log(z);

x= -3.25;
z = Math.sign(x);
console.log(z);

x = 3;
y = 2;
z = 1;
let max = Math.max(x,y,z);
let min = Math.min(x,y,z);

console.log(max);
console.log(min);