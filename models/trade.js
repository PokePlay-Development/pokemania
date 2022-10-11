const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id1: { type: String, required: true },
    id2: { type: String, required: true },
    tag1: { type: String, default: null }, 
    tag2: { type: String, default: null },
    username1: { type: String, default: null }, 
    username2: { type: String, default: null },
    credit1: { type: Number, default: 0 },
    credit2: { type: Number, default: 0 },
    crystal1: { type: Number, default: 0 },
    crystal2: { type: Number, default: 0 },
    summon1: { type: Number, default: 0 },
    summon2: { type: Number, default: 0 },
    pokemon1: { type: Array, default: [] },
    pokemon2: { type: Array, default: [] },
    confirm1: { type: Boolean, default: false },
    confirm2: { type: Boolean, default: false }
})

module.exports = mongoose.model("Trade", Schema)