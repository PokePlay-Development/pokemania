const mongoose = require("mongoose")
const config = require("../settings.json")
const Schema = new mongoose.Schema({
    id: { type: String, required: true },
    language: { type: String, default: "english"},
    prefix: { type: String, default: config.messageContentCommands.prefix }
})

module.exports = mongoose.model("Guild", Schema)