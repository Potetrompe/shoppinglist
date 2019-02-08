const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//? Connect to DB
const mongoURL = "mongodb://admin:admin2000@ds221645.mlab.com:21645/shoppinglist";
mongoose.connect(mongoURL, { useNewUrlParser: true });

//? Create schema - this is like a blueprint / template / "class"
const shoppinglistSchema = new mongoose.Schema({id: Object, item: String});

const Shoppinglist = mongoose.model("Shoppinglist", shoppinglistSchema);
// var item1 = Shoppinglist({item: "from DB!"}).save(function(err){
//     if(err) throw err;
//     console.log("item saved");
// });


//var data = [{item: "fItem"}, {item: "nItem"}, {item: "lItem"}];
const urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){

    app.use(bodyParser.json());                         // support for JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // support for URL-encoded bodies


    //* Request handlers
    app.get("/", (req, res) => {
        //? Get data from mongoDB and pass it to view
        Shoppinglist.find({/*item: "nameOfItem" */}, (err, data) => {  //empty find = get all || select * from shoppinglist
            if(err) throw err;
            //console.log(data);

            //* only sendt what i use
            let exp = [];
            data.forEach(li => exp.push({id: li._id, item: li.item}));
            console.log(exp);
            
            //* File in views-folder & send data in listObj
            res.render("./index.ejs", {list: exp}); 
        });
    });

    app.post("/", urlencodedParser, (req, res) => {

        let exp = {
            //id: 1, //* TODO: change to unique || id to _id (mongoDB)
            item: req.body.item
        }
        //console.log(exp);

        //? Get data from view and add it to mongoDB
        var newData = new Shoppinglist(exp).save((err, data) => {
            if(err) throw err;
            //* Render with updated data
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
        //console.log(`deleted if any at item = ${req.params.item}`);
        
        //? Deleted item from mongoDB
        // Shoppinglist
        //     .find({item: req.params.item.replace(/\-/g, " ")})
        //     .remove(
        //         function(err, data){
        //             if (err) throw err;
        //             //console.log(data.deletedCount);
        //             res.redirect("./");
        //         }
        //     );
        
        Shoppinglist.deleteOne({item: req.params.item.replace(/\-/g, " ")}, err => err ? console.error(err) : console.log(`Deleted`));  
        //*  TODO: delete at _id: xx;
        
        // let data = data.filter(function(shoppinglist){
        //     return shoppinglist.item.replace(/ /g, "-") !== req.params.item;
        // });
        // res.json(data);
    });
    
    


};