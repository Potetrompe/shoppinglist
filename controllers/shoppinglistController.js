var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//Connect to DB
mongoose.connect("mongodb://admin:admin2000@ds221645.mlab.com:21645/shoppinglist");

//Create schema - this is like a blueprint / template / "class"
var shoppinglistSchema = new mongoose.Schema({item: String});

var Shoppinglist = mongoose.model("Shoppinglist", shoppinglistSchema);
// var item1 = Shoppinglist({item: "from DB!"}).save(function(err){
//     if(err) throw err;
//     console.log("item saved");
// });


//var data = [{item: "fItem"}, {item: "nItem"}, {item: "lItem"}];
var urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){

    app.use(bodyParser.json());                         // support for JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // support for URL-encoded bodies


    //All request handlers
    app.get("/", function(req, res){
        //Get data from mongoDB and pass it to view
        Shoppinglist.find({/*item: "from DB!" */}, function(err, data){
            if(err) throw err;
            res.render("./index.ejs", {shoppinglist: data}); //File in views-folder
        });
    });

    app.post("/", urlencodedParser, function(req, res){
        //Get data from view and add it to mongoDB
        var newShoppinglist = new Shoppinglist(req.body).save(function(err, data){
            if(err) throw err;
            //Render with updated data
            //res.render("./index.ejs", {shoppinglist: data});
            res.redirect("./");
        });

        // var newData = {item: req.body.item};
        // data.push(newData);

        // // console.log("User added: " + req.body.item);
        // // console.log(data[data.length-1]);

        // res.render("./index.ejs", {shoppinglist: data});
    });

    app.delete("/:item", function(req, res){
        console.log("delete request recived");
        //Deleted item from mongoDB
        // console.log(req.params.item);
        // Shoppinglist.find({item: req.params.item.replace(/\-/g, " ")}).remove(function(err, data){
        //     if (err) throw err;
        //     res.redirect("./");
        // });
        
        // data = data.filter(function(shoppinglist){
        //     return shoppinglist.item.replace(/ /g, "-") !== req.params.item;
        // });
        // res.json(data);
    });
    
    app.get("/:id", function(req, res){
        console.log(req.params.id);
    })


};