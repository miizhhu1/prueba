const { request } = require("express");
const express = require("express");
const router = express.Router();
const Users = require("../models/Users")

module.exports = router;

// GET all the users
router.get("/users", async (req, res) => {
    if(req.body.idCard != null){
        console.log("I'm not a teapo    t")
        res.status(418).json({message:"The server refuses the attempt to brew coffee with a teapot. This services does not use parameters"})
    }
    
    try {
        const usersData = await Users.find();
        res.status(200).json(usersData);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// GET users by idCard
router.get("/users/:idCard", async (req,res) => {
    try {
        const usersData = await Users.find({"idCard":req.params.idCard});
        res.status(200).json(usersData)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

// POST a new users
router.post("/users", async (req,res) => {
    let newUsers = new Users({
        idCard: req.body.idCard,
        fullname: req.body.fullname,
        email: req.body.email,
        username: req.body.username,
        passwordHash: req.body.passwordHash,
        type: req.body.type
    })

    try {
        const usersToSave = await newUsers.save();
        res.status(200).json({message: "Succesfully Created new Users", usersToSave})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PUT Update users parameters based on idCard
router.put("/users/:idCard", async (req, res) => {
    // Find out if that users idCard exists and save on variable
    let usersOld;
    try {
        await Users.findOne({"idCard":req.params.idCard}, (err, result) => {
            if(err){
                res.status(500).json({message: err.message});
            }
            else if(!result){
                res.status(404).json("There is no Users with that idCard");
            }
            else{
                console.log("result: " + result)
                usersOld = result;
            }
        }).clone(); 
        //Used this because if not Atlas does not like repeated queries 
        // https://stackoverflow.com/questions/68945315/mongooseerror-query-was-already-executed
    } catch (error) {
        res.status(500).json({message: error.message});
    }

    let newUsers = {};
    
    // Update local variable with parameters that have been sent, no Upsert
    let requestParameters = Object.keys(req.body);
    if (requestParameters.includes("idCard")) newUsers.idCard = req.body.idCard;
    if (requestParameters.includes("fullname")) newUsers.fullname = req.body.fullname;
    if (requestParameters.includes("email")) newUsers.email = req.body.email;
    if (requestParameters.includes("username")) newUsers.username = req.body.username;
    if (requestParameters.includes("passwordHash")) newUsers.passwordHash = req.body.passwordHash;
    if (requestParameters.includes("type")) newUsers.type = req.body.type;

    console.log(newUsers)
    // Do the Updating
    try {
        const filter = { idCard: req.params.idCard   };
        const update = newUsers;

        let updatedUsers = await Users.findOneAndUpdate(filter, update, {
            new: true,
            upsert: false
        });

        console.log("updated Users: " + updatedUsers);
        res.status(200).json({ message:"Success at Updating item of Menu",
                                newUsers: updatedUsers })

    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// DELETE users by idCard
router.delete("/users/:idCard", async (req, res) => {
    try {
        await Users.deleteOne({idCard: req.params.idCard}, function (err) {
            if (err) res.status(500).json({message: "Error at deleting users"});
        }).clone();
        res.status(200).json({message:`If there was a users with idCard ${req.params.idCard}, it has been deleted :(`})

    } catch (error) {
        res.status(500).json({message:error.message});
    }
})