const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id: { type: String, required: true }, // channel ID.
    pokename: { type: String, required: true },
    pokeid: { type: String, required: true },
})

module.exports = mongoose.model("Spawn", Schema)