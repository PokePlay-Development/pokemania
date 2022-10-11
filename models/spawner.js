const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id: { type: String, required: true },// Guild Id.
    count: { type: Number, default: 0 }, // Message Counts.
    channels: { type: Array, default: new Array() },
    disabled: { type: Boolean, default: false },
    total_spawns: { type: Number, default: 0 }
})

module.exports = mongoose.model("Spawner", Schema)