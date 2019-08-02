const express = require("express");
const session = require("express-session");
const shoppinglistController = require("./controllers/shoppinglistController.js");

const app = express();

const TWO_HOURS = 1000 * 60 * 60 * 2;
const SESS_NAME = "sessionID";
const SESS_SECRET = "noonecanknowthisstring!";

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
        secure: false,  //* true in production
    }
}));

//Set up template engine
app.set("view engine", "ejs");

//Static files - all static files in public folder
app.use(express.static("./public"));

//Fire controllers
shoppinglistController(app);

//Listen to port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
