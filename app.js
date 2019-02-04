var express = require("express");


var app = express();

//Set up template engine
app.set("view engine", "ejs");

//Static files - all static files in public folder
app.use(express.static("./public"));


//Listen to port
app.listen(3000);
console.log("Port: 3000");


