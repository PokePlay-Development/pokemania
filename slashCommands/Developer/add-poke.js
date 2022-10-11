const User = require("../../models/user.js")
const Pokemon = require("../../classes/pokemon.js")
const { instanceToPlain } = require("class-transformer")
module.exports = {
    name: `add-poke`,
    description: `Add a pokemon To A Registered User.`,
    developer: true,
    admin: true,
    run: async (client, interaction) => {
        interaction.reply(`Under Construction.`)
    }
}