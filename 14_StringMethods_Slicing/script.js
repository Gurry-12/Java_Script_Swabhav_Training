// string methods = allow you to manipulate and work with text (strings)

let userName = "Bro Code";
let phoneNumber = "123-456-7890";

//console.log(userName.length);
//console.log(userName.charAt(0));
//console.log(userName.indexOf("o"));
//console.log(userName.lastIndexOf("o"));
//userName = userName.trim();
//userName = userName.toUpperCase();
//userName = userName.toLowerCase();
//userName = userName.repeat(3);
//let result = userName.startsWith(" ");
//let result = userName.endsWith(" ");
//let result = userName.includes(" ");
//phoneNumber = phoneNumber.replaceAll("-", "");
//phoneNumber = phoneNumber.padStart(15, "0");
//phoneNumber = phoneNumber.padEnd(15, "0");

console.log(phoneNumber);

// string slicing = creating a substring 
//                            from a portion of another string
//                            string.slice(start, end)

// ------------ EXAMPLE 1 ------------
const fullName = "Gurpreet Singh";

// let firstName = fullName.slice(0, 8);
// let lastName = fullName.slice(9, 14);

let firstName = fullName.slice(0, fullName.indexOf(" "));
let lastName = fullName.slice(fullName.indexOf(" ") + 1);

console.log(firstName);
console.log(lastName);

// ------------ EXAMPLE 2 ------------

const email = "Gurpreet@gmail.com";

let username = email.slice(0, email.indexOf("@"));
let extension = email.slice(email.indexOf("@") + 1);

console.log(username);
console.log(extension);