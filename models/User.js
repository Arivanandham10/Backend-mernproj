const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        },
    email: {
        type: String,
        required: true
    },
    phoneno: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
const Usermodel = mongoose.model("users", Schema)
module.exports = Usermodel