const express = require("express");
const shoppinglistController = require("./controllers/shoppinglistController.js");

const app = express();

//Set up template engine
app.set("view engine", "ejs");

//Static files - all static files in public folder
app.use(express.static("./public"));

//Fire controllers
shoppinglistController(app);

//Listen to port
const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log(`Port: ${PORT}`);
