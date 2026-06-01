// console.time() = tool that allows you to measure the time it takes
//                              for a section of code or process to execute
//                              Great for identifying performance "bottlenecks"

function loadData() {
  console.time("loadData");

  for (let i = 0; i < 1000000000; i++) {
    //pretend to load some data
  }

  console.timeEnd("loadData");
}

function processData() {
  console.time("processData");

  for (let i = 0; i < 1000000; i++) {
    //pretend to process some data
  }

  console.timeEnd("processData");
}

loadData();
processData();

// .toLocaleString() = returns a string with a language 
//                                  sensitive representation of a number
//                                 .toLocaleString("locale", {options});

let number = 123456.789;

number = number.toLocaleString("en-US");
number = number.toLocaleString("hi-IN");
number = number.toLocaleString("de-DE");
number = number.toLocaleString(undefined);

number = number.toLocaleString("en-US", {style: "currency", currency: "USD"});
number = number.toLocaleString("hi-IN", {style: "currency", currency: "INR"});
number = number.toLocaleString("de-DE", {style: "currency", currency: "EUR"});

console.log(number);