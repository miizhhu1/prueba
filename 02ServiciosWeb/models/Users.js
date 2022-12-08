const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    idCard:{
        required:true,
        type: String
    },
    fullname:{
        required:true,
        type: String
    },
    email:{
        required: true,
        type: String
    },
    username:{
        required: true,
        type: String
    },
    passwordHash:{
        required: true,
        type: String
    },
    type:{
        required: true,
        type: String
    }
})
// Third parameter used based on this website, this is the pure name of the Collection on Mongo
// https://stackoverflow.com/questions/14183611/mongoose-always-returning-an-empty-array-nodejs
module.exports = mongoose.model('Users', usersSchema, 'users')