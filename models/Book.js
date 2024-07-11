const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
    booktitle: {
        type: String,
        required: true
        },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})
const Bookmodel = mongoose.model("Books", Schema)
module.exports = Bookmodel