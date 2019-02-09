var express = require("express");
var shoppinglistController = require("./controllers/shoppinglistController.js");

var app = express();

//Set up template engine
app.set("view engine", "ejs");

//Static files - all static files in public folder
app.use(express.static("./public"));

//Fire controllers
shoppinglistController(app);

//Listen to port
app.listen(process.env.PORT || 8080);
console.log("Port: heroku descided or 8080");
