
// arithmatic = operands - values , variables
                // operations = + - * / 


let students = 30;
students = students + 1;

console.log(students);
students = students - 1;

console.log(students);
students = students * 2 ;

console.log(students);
students = students / 2;

console.log(students);
students = students ** 2;

console.log(students);
let  modulus = students % 2;

console.log(modulus);

console.log(students);

students += 1;

console.log(students);
students -= 1;

console.log(students);
students *= 2;

console.log(students);
students /= 2;

console.log(students);
students **= 2;

console.log(students);

// unery operator 
students-- ;

console.log(students);
students++;



console.log(students);

// 2. operator precedence 
/*
    1. perenthesis () 
    2. exponents 
    3. multiply & devide & modulo 
    4. addition & substraction
*/  

// logical operators =  used to combine or manipulate boolean values 
//                                    (true or false)

// AND = &&
// OR  = ||
// NOT = !


const temp = -100;

if(temp > 0 && temp <= 30){
    console.log("The weather is GOOD");
}
else{
    console.log("The weather is BAD");
}


const temp = -250;

if(temp <= 0 || temp > 30){
    console.log("The weather is BAD");
}
else{
    console.log("The weather is GOOD");
}

const isSunny = true;

if(!isSunny){
    console.log("It is CLOUDY");
}
else{
    console.log("It is SUNNY");
}

//   = assignment operator
//  == comparison operator (compare if values are equal)
// === strict equality operator (compare if values & datatype are equal)
//   != inequality operator
// !== strict inequality operator

const PI = 3.14;

if(PI === "3.14"){
    console.log("That is NOT Pi");
}
else{
    console.log("That is Pi");
}