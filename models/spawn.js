const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id: { type: String, required: true }, // channel ID.
    pokename: { type: String, required: true },
    pokeid: { type: String, required: true },
    pokemon: { type: Object, default: null }
})

module.exports = mongoose.model("Spawn", Schema)