const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id: { type: String, required: true },
    language: { type: String, default: "english"}
})

module.exports = mongoose.model("Guild", Schema)