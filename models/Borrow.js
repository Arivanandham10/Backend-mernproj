const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
    booktitle: {
        type: String,
        required: true
        },
    author: {
        type: String,
        required: true
    }
})
const Borrowmodel = mongoose.model("borrowedbooks", Schema)
module.exports = Borrowmodel