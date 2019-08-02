const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//? Connect to DB
const mongoURL = "mongodb://admin:admin2000@ds221645.mlab.com:21645/shoppinglist";
mongoose.connect(mongoURL, { useNewUrlParser: true });

//? Create schema - this is like a blueprint / template / "class"
const shoppinglistSchema    = new mongoose.Schema({item: String, author: String});
const usersSchema           = new mongoose.Schema({username: String, password: String, color: String});
const groupSchema           = new mongoose.Schema({name: String, users: Array});

const shoppinglist = mongoose.model("Shoppinglist", shoppinglistSchema);
const users = mongoose.model("users", usersSchema);
// var item1 = Shoppinglist({item: "from DB!"}).save(function(err){
//     if(err) throw err;
//     console.log("item saved");
// });

//var data = [{item: "fItem"}, {item: "nItem"}, {item: "lItem"}];
const urlencodedParser = bodyParser.urlencoded({extended: false});


const redirectLogin = (req, res, next) => {
    if(!req.session.userID){
        console.log(req.session.userID);
        res.redirect("/users")
    }else{
        next();
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userID){
        res.redirect("/")
    }else{
        next();
    }
}

const redirectLogout = (req, res, next) => {
    if(req.session.userID){
        res.redirect("/logout");
    }else{
        next();
    }
}


module.exports = app => {

    app.use(bodyParser.json());                         // support for JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // support for URL-encoded bodies
    

    //* Request handlers
    app.get("/", redirectLogin, (req, res) => {
        //? Get data from mongoDB and pass it to view
        shoppinglist.find({/*item: "nameOfItem" */}, (err, data) => {
            if(err) throw err;

            //* only send what i use
            let exp = [];
            data.forEach(item => exp.push(
                {
                    id: item._id, 
                    item: item.item,
                    author: item.author
                }
            ));

            //console.log(exp);
            res.render("./index.ejs", {list: exp});
        });

        //? data from users (authorID and color)
        users.find({/*item: "nameOfItem" */}, (err, data) => {
            if(err) throw err;
            //console.log("userData: " + data);
        });
        
        /*
        //? Querying
            Finding documents is easy with Mongoose, which supports the rich query syntax of MongoDB. 
            Documents can be retreived using each models find, findById, findOne, or where static methods.

            Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
        */

        //? Logging session cookie
        console.log(req.session.userID);
    });

    app.get("/users", /*redirectLogout,*/ (req, res) => {

        res.render("./users.ejs", {something: "some data"});


       //res.send("login/register");
    });

    app.get("/groups", redirectLogin, (req, res) => {
        
        res.render("./groups.ejs", {something: "some data"});
        
        
        //res.send("Groups");
    });

    //? ADD item to DB
    app.post("/", redirectLogin, urlencodedParser, (req, res) => {

        console.log("Added " + req.body.item);
        // console.log(req.body);
        
        // let liValue = "unset";

        // if(req.body.item != undefined){
        //     console.log("val from form");
        //     liValue = req.body.item;
        // }else if(req.body != undefined){
        //     console.log("val from icons");
        //     liValue = req.body.item;
        // }

        let itemData = {
            //| {item: String, author: String}
            //id: 1, //* TODO: change to unique || id to _id (mongoDB)
            item: req.body.item,
            author: "default"
        }

        //? Get data from view (or icons) and add it to mongoDB
        shoppinglist(itemData).save((err, data) => {
            if(err) throw err;
            //* Render with updated data
            //res.render("./index.ejs", {shoppinglist: data});
            res.redirect("./");
        });

    });

    //? Register User
    app.post("/register", urlencodedParser, (req, res) => {
        
        let userData = {
            //| {username: String, password: String, color: String}
            username: req.body.username,
            password: req.body.password,
            color: req.body.color
        }
        //console.log(userData);

        users(userData).save((err, data) => {
            if(err) throw err;
            console.log("posted to users: " + data);
            
            users.find({username: userData.username}, (err, data) => {
                if(err) throw err;
                req.session.userID = data[0]._id;
                console.log(data, `UserID: ${req.session.userID}`);
                res.redirect("./");
            });
        });
        
    });

    //? Log in User
    app.post("/login", redirectHome, urlencodedParser, (req, res) => {
        
        let userData = {
            //| {name: String, users: Array}
            username: req.body.username,
            password: req.body.password
        }
        
        console.log(userData);

        res.send(userData);
    });

    app.get("/logout", redirectLogin, (req, res) => {
        console.log(`Logging out User:${req.session.userID}`);
        req.session.userID = 0;
        res.redirect("/users");
    });


    //? DELETE with form
    app.delete("/:item", redirectLogin, function(req, res){
        //? Delete data from mongoDB
        shoppinglist.deleteOne(
            {item: req.params.item.replace(/\-/g, " ")}, 
            (err, data) => {
                if(err){
                    console.error(err);
                }else{
                    console.log(`Deleted ${data.deletedCount} at item = ${req.params.item}`);
                }
            }
        );  
        //*  TODO: get arr of selected ID from usr to delete
        
        // let data = data.filter(function(shoppinglist){
        //     return shoppinglist.item.replace(/ /g, "-") !== req.params.item;
        // });
        // res.json(data);
    });

    //? DELETE with btn
    app.delete("/", redirectLogin, (req, res) => {
        //console.log(req.body);

        for (let i = 0; i < req.body.length; i++) {
            shoppinglist.deleteOne(
                {_id: req.body[i]},
                (err, data) => {
                    if(err){
                        console.error(err);
                    }else{
                        console.log(`Deleted ${data.deletedCount} at ID = ${req.body[i]}`);
                    }
                }    
            );
        }

        //* For refreshing page after delete
        res.send();
        
    });
    
    


};