var express = require("express");
var mysql = require("mysql");
var app = express();

//| Port
var port = process.env.PORT || 8080;
app.use(express.static(__dirname));

var connection = mysql.createConnection({
    //* properties
    host: "localhost",
    user: "root",
    passord: "",
    database: "shoppinglist"
});

connection.connect(function(error){
    if(!!error){
        console.log("Database connection error");
    } else {
        console.log("Connected to database!");
    }
});


app.get("/", function(req, resp){

    resp.render("index");


    //* about mysql
    connection.query("SELECT * FROM test", function(error, rows, field){
        if(!!error){
            console.log("Error with query");
        } else {
            console.log("Query successful");
        }
    });

})

app.listen(port, function(){
    console.log("App running");
});