// How to  accept user input 

// 1. window prompt

// let firstName = window.prompt("Enter yout name ");
// console.log(firstName);

// 2. professional way with html 

let username;

document.getElementById("mySubmit").onclick = function() {
    username = document.getElementById("myText").value;
    document.getElementById("myH1").textContent = `Hello ${username}`;
}