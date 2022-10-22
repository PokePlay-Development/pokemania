const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    id: { type: String, required: true },
    pokemons: { type: Array, default: [] },
    pokemons1: { type: Array, default: [] },
    eggs: { type: Array, default: [] },
    credits: { type: Number, default: 0 },
    crystals: { type: Number, default: 0 },
    summons: { type: Number, default: 0 },
    reffered: { type: Boolean, default: false },
    selected: { type: Array, default: [] },
    createdAt: { type: String, default: Date.now() },
    shName: { type: String, default: null },
    shCount: { type: Number, default: 0 },
    caught: { type: Array, default: [] },
    destiny_knot: { type: Number, default: 0 },
    ultra_destiny_knot: { type: Number, default: 0 },
    pokeball: { type: Number, default: 10 },
    greatball: { type: Number, default: 0 },
    ultraball: { type: Number, default: 0 },
    masterball: { type: Number, default: 0 },
    trainer: { type: String, default: "ash"},
    q1: { type: Boolean, default: false },
    q2: { type: Boolean, default: false },
    q3: { type: Boolean, default: false },
    q4: { type: Boolean, default: false },
    q5: { type: Boolean, default: false },
    q6: { type: Boolean, default: false },
    qcaught: { type: Array, default: [] },
    held_items: { type: Array, default: [] },
    nest: { type: Number, default: 1 }
})

module.exports = mongoose.model("User", Schema)