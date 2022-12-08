const { request } = require("express");
const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem")
// for Whatsapp
require('dotenv').config()
const { sendMessage, getTextMessageInput } = require("../messageHelper");

module.exports = router;

// GET all the menuItems
router.get("/menuItems", async (req, res) => {
    // Easter Egg code 418 Teapot
    if(req.body.name != null){
        console.log("I'm not a teapot")
        res.status(418).json({message:"The server refuses the attempt to brew coffee with a teapot. This services does not use parameters"})
    }
    
    try {
        const menuItemsData = await MenuItem.find();
        res.status(200).json(menuItemsData);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// GET menuItem by code
router.get("/menuItems/:code", async (req,res) => {
    try {
        const menuItemsData = await MenuItem.find({"code":req.params.code});
        res.status(200).json(menuItemsData)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

// POST a new menuItem
router.post("/menuItems", async (req,res) => {
    let newMenuItem = new MenuItem({
        status: req.body.status,
        code: req.body.code,
        category: req.body.category,
        name: req.body.name,
        price: req.body.price,
        paysTaxes: req.body.paysTaxes
    })

    try {
        const menuItemToSave = await newMenuItem.save();
        res.status(200).json({message: "Succesfully Created new Menu Item", menuItemToSave})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PUT Update menuItem parameters based on code
router.put("/menuItem/:code", async (req, res) => {
    // Find out if that menuItem code exists and save on variable
    let menuItemOld;
    try {
        await MenuItem.findOne({"code":req.params.code}, (err, result) => {
            if(err){
                res.status(500).json({message: err.message});
            }
            else if(!result){
                res.status(404).json("There is no MenuItem with that code");
            }
            else{
                menuItemOld = result;
            }
        }).clone(); 
        //Used this because if not Atlas does not like repeated queries 
        // https://stackoverflow.com/questions/68945315/mongooseerror-query-was-already-executed
    } catch (error) {
        res.status(500).json({message: error.message});
    }

    let newMenuItem = {};
    
    // Update local variable with parameters that have been sent, no Upsert
    let requestParameters = Object.keys(req.body);
    if (requestParameters.includes("status")) newMenuItem.status = req.body.status;
    if (requestParameters.includes("code")) newMenuItem.code = req.body.code;
    if (requestParameters.includes("category")) newMenuItem.category = req.body.category;
    if (requestParameters.includes("name")) newMenuItem.name = req.body.name;
    if (requestParameters.includes("price")) newMenuItem.price = req.body.price;
    if (requestParameters.includes("paysTaxes")) newMenuItem.paysTaxes = req.body.paysTaxes;

    // Do the Updating
    try {
        const filter = { code: req.params.code };
        const update = newMenuItem;

        let updatedMenuItem = await MenuItem.findOneAndUpdate(filter, update, {
            new: true,
            upsert: false
        });

        res.status(200).json({ message:"Success at Updating item of Menu",
                                newItem: updatedMenuItem })

    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// DELETE MenuItem by Code
router.delete("/menuItem/:code", async (req, res) => {
    try {
        await MenuItem.deleteOne({code: req.params.code}, function (err) {
            if (err) res.status(500).json({message: "Error at deleting menuItem"});
        }).clone();
        res.status(200).json({message:`If there was a menu item with code ${req.params.code}, it has been deleted :(`})

    } catch (error) {
        res.status(500).json({message:error.message});
    }
})


//POST - Enviar un descuento en un item de menú, al Whatsapp de un cliente
// /restaurant/menuItem/code/discount/20/client/CI	

// Code modified from https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/
router.post('/menuItem/:code/discount/:percentage/client/:idCard', function(req, res, next) {
    // Retrieve MenuItem 


    // Calculate Prices and Discount

    // Retrieve Client Details

    // Message template to fill with Discount Details
    var message = `*¡Restaurante Santo Placer le ofrece una promoción!* \n\n
                    ¡Saludos {{1}}! Si presenta este mensaje durante esta semana,
                     puede obtener un {{2}}% de descuento en {{3}}. 
                     Podrá disfrutar una agradable comida por tan solo \${{4}}. 
                     Precio normal:  \${{5}}).\n\n !Lo esperamos 🍽!`

    // Attach headers for Whatsapp API
    var data = getTextMessageInput(process.env.RECIPIENT_WAID, message);
    
    sendMessage(data)
      .then(function (response) {
        res.sendStatus(200);
        return;
      })
      .catch(function (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      });
  });