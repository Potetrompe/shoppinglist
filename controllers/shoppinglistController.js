const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const saltRounds = 10;

//? Connect to DB
const mongoURL = "mongodb://admin:admin2000@ds221645.mlab.com:21645/shoppinglist";
mongoose.connect(mongoURL, { useNewUrlParser: true });

//? Create schema - this is like a blueprint / template / "class"
const shoppinglistSchema    = new mongoose.Schema({item: String, author: String, group: String});
const usersSchema           = new mongoose.Schema({username: String, password: String, color: String});
const groupSchema           = new mongoose.Schema({name: String, users: Array, color: String});
const groupRequestSchema    = new mongoose.Schema({from: String, to: String, group: String});

// const shoppinglist  = mongoose.model("Shoppinglist", shoppinglistSchema);
const shoppinglist  = mongoose.model("shoppinglists", shoppinglistSchema);
const users         = mongoose.model("users", usersSchema);
const groups        = mongoose.model("groups", groupSchema);
const groupRequests = mongoose.model("grouprequests", groupRequestSchema);

const urlencodedParser = bodyParser.urlencoded({extended: false});


const redirectLogin = (req, res, next) => {
    if(!req.session.userID){
        //console.log(req.session.userID);
        res.redirect("/users")
    }else{
        next();
    }
    //next();
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

        //? Log session cookie & userID
        //console.log(req.session.userID, req.session.userName);

        //? Find what groups user is in
        queryObj = {users: req.session.userName}
        let groupsArr = [];
        let groupNamesArr = [];
        let usersFromGroups = [];
        groups.find(queryObj, (err, data) => {
            if(err) throw err;
            data.forEach(groupObj => groupsArr.push({
                "group": groupObj.name, 
                "color": groupObj.color,
                "users": groupObj.users
            }));
            groupsArr.forEach(obj => groupNamesArr.push(obj.group));
            groupsArr.forEach(obj => usersFromGroups.push(obj.users));
            // console.log(groupsArr, groupNamesArr);
            // console.log(usersFromGroups);

            //| remove duplicates
            let filteredUsersInGroups = [];
            for (let prev, i = 0; i < usersFromGroups.length; i++) {
                for (let j = 0; j < usersFromGroups[i].length; j++) {
                    // console.log(usersFromGroups[i][j]);
                    if(usersFromGroups[i][j] !== prev){
                        filteredUsersInGroups.push(usersFromGroups[i][j]);
                        prev = usersFromGroups[i][j];
                    }
                }
                
            }
            // console.log(filteredUsersInGroups);


            //? Get list-data from mongoDB and pass it to view
            // queryObj = {author: req.session.userName};
            queryObj = {group: {$in: groupNamesArr}};
            if(req.session.admin){queryObj = {}};
            shoppinglist.find(queryObj, (err, data) => {
                if(err) throw err;
    
                //* only send what i use
                let exp = [];
                data.forEach(item => exp.push(
                    {
                        id: item._id, 
                        item: item.item,
                        author: item.author,
                        group: item.group
                    }
                ));

                //? colors from users in groups
                let userAndTheirColor = [];
                users.find({username: {$in: filteredUsersInGroups}}, (err, data) => {
                    if(err) throw err;
                    data.forEach(obj => userAndTheirColor.push({user: obj.username, color: obj.color}));
                    //console.log(userAndTheirColor);


                    //console.log(exp);
                    res.render("./index.ejs", {
                        list: exp, 
                        groupColors: groupsArr, 
                        activeGroup: req.session.currentGroup,
                        userAndTheirColor: userAndTheirColor
                    });
                });
    
            });
        });


        
        /*
        //? Querying
            Finding documents is easy with Mongoose, which supports the rich query syntax of MongoDB. 
            Documents can be retreived using each models find, findById, findOne, or where static methods.

            Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
        */

    });

    app.get("/users", /*redirectLogout,*/ (req, res) => {

        res.render("./users.ejs", {userID: req.session.userID});

    });

    app.get("/groups", redirectLogin, (req, res) => {

        //| local variables
        let groupsFilter = {users: req.session.userName};
        let groupRequestsFilter = {to: req.session.userName};
        let groupData, groupRequestData;


        groups.find(groupsFilter, (err, data) => {
            if(err) throw err;
            groupData = data;
            //console.log("Groups: " + data);
            
            groupRequests.find(groupRequestsFilter, (err, data) => {
                if(err) throw err;
                groupRequestData = data;
                //console.log("groupRequests: " + data);

                    //console.log({groupData: groupData, groupRequestData: groupRequestData});
                    res.render("./groups.ejs", {groupData: groupData, groupRequestData: groupRequestData});
            });
        });
        
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
            item: req.body.item,
            author: req.session.userName || "unset",
            group: req.body.group
        }

        //? Get data from view (or icons) and add it to mongoDB
        shoppinglist(itemData).save((err, data) => {
            if(err) throw err;
            //* Render with updated data
            //res.render("./index.ejs", {shoppinglist: data});
            req.session.currentGroup = itemData.group;
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

        bcrypt.hash(userData.password, saltRounds, (err, hash) => {
            if(err) throw err;
            userData.password = String(hash);
            //console.log(userData.password);

            users(userData).save((err, data) => {
                if(err) throw err;
                console.log("posted to users: " + data);
                
                users.find({username: userData.username, password: userData.password}, (err, data) => {
                    if(err) throw err;
                    req.session.userID = data[data.length-1]._id;
                    req.session.userName = data[data.length-1].username;

                    console.log(`Username: ${req.session.userName}, UserID: ${req.session.userID}`);
                    res.redirect("./");
                });
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
        //console.log(`Userdata: `, userData);

        users.find({
                username: userData.username
                //password: userData.password
            }, (err, data) => {
            if(err) throw err;

            bcrypt.compare(userData.password, String(data[data.length-1].password), (err, passCheck) => {
            
                if(!data[data.length-1]){
                    console.log(`No user with that combination!`);
                }else if(!passCheck){
                    console.log(data[data.length-1]);
                    console.log(userData.password, String(data[data.length-1].password));
                    console.log(`Wrong password!`);
                }else if(passCheck){
                    userData.id = data[data.length-1]._id;
                    req.session.userID = userData.id;
                    req.session.userName = userData.username;
                    if(req.session.userName == "admin"){
                        req.session.admin = true;
                    } 
                    // console.log(
                    //     data[data.length-1], 
                    //     userData.id,
                    //     req.session.userName);
                    //res.send(data);
                }
                res.redirect("./");
            });
        });

    });

    //? Log out User
    app.post("/logout", redirectLogin, (req, res) => {
        //console.log(`Logging out User:${req.session.userID}`);
        //req.session.userID = 0;
        if(req.body.userID == req.session.userID){
            req.session.userID = 0;
            req.session.userName = undefined;
            req.session.destroy(err => {
                if(err) throw err;
                console.log(`Logged out userID: ${req.body.userID}`);
            });
        } 
        res.redirect("/users");
    });

    //? Delete user
    app.post("/deleteuser", redirectLogin, (req, res) => {

        if(req.session.userID && req.session.userName){

            shoppinglist.deleteMany({author: req.session.userName}, (err, data) => {
                if(err) throw err;
                console.log(`Cleared items from user: ${req.session.userName}`);

                users.deleteMany({username: req.session.userName}, (err, data) => {
                    if(err) throw err;
                    console.log(`Deleted user: ${req.session.userName}`);

                    console.log(`Logged out user: ${req.session.userName}`);
                    req.session.userID = 0;
                    req.session.userName = undefined;
                    req.session.destroy(err => {
                        if(err) throw err;
    
                        res.redirect("/users");
                    });
                });
            });
        } 
    });

    //? Create group
    app.post("/groups", redirectLogin, (req, res) => {
        
        
        let groupData = {
            //| {name: String, users: Array(String), color: String}
            name: req.body.name,
            users: [
                req.session.userName
            ],
            color: req.body.color
        }

        groups(groupData).save((err, data) => {
            if(err) throw err;
            console.log("Posted to groups: " + data);
        });

        res.redirect("/groups");
    }); 

    //? Send group request
    app.post("/grouprequest", redirectLogin, (req, res) => {
        
        let groupRequestData = {
            from: req.session.userName,
            to: req.body.username,
            group: req.body.group,
            deleteGroup: req.body.deleteGroup
        };
        console.log(`Sendt request:`, groupRequestData);

        if(groupRequestData.deleteGroup === "NO" && groupRequestData.to != ""){
            groupRequests(groupRequestData).save((err, data) => {
                if(err) throw err;
                //console.log("Posted to groupRequests: " + data);
            });
        }else if(groupRequestData.deleteGroup === "YES"){
            groups.deleteMany({name: groupRequestData.group}, (err, data) => {
                if(err) throw err;
                console.log("deleted group: " + groupRequestData.group);

                shoppinglist.deleteMany({group: groupRequestData.group}, (err, data) => {
                    console.log("deleted items in group: " + groupRequestData.group);
                });
                shoppinglist.deleteMany({group: {$in: ["unset", ""]}}, (err, data) => {
                    if(err) throw err;
                });
            });
        }
        

        res.redirect("/groups");
    }); 

    //? Handle requests
    app.post("/addtogroup", redirectLogin, (req, res) => {
        
        let requestData = {
            user: req.session.userName,
            group: req.body.group,
            answer: req.body.answer
        };
        console.log(requestData);
        
        if(requestData.answer === "yes"){
            groups.updateOne({name: requestData.group}, {$push: {"users": requestData.user}}, (err, affected, res) => {
                if(err) throw err;
                console.log(`Added user: ${requestData.user} to group: ${requestData.group}`);
            });
        }
        groupRequests.deleteMany({to: requestData.user, group: requestData.group}, (err, data) => {
            if(err) throw err;
            console.log(`Deleted request from group: ${requestData.group}`);
            res.redirect("/groups");
        });   
        
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