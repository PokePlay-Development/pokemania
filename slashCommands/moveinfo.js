const fetch = require("node-fetch")
const {
    MessageEmbed } = require("discord.js")
const User = require("../models/user.js")
module.exports = {
    name: `moveinfo`,
    description: `Get Information About A Move!`,
    options: [{"String": { name: "move_name", description: `specify the move name, you wish to get information for!`, required: true }}],
    run: async (client, interaction, color) => {
	const options = interaction.options;
        let move = options.getString("move_name").replace(/ /g, "-").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/move/${move}`)
        .then(res => res.json())
        .then(async (data) => {
            interaction.reply({
                embeds: [new MessageEmbed()
                .setTitle(`${options.getString("move_name").toLowerCase()}`)
                .setColor(color)
                .setTimestamp()
                .addField("Type", `${data.type.name}`, true)
                .addField("Power", `${data.power == null ? 0 : data.power}`, true)
                .addField("Accuracy", `${data.accuracy == null ? 0 : data.accuracy}`, true)
                .addField("PP", `${data.pp == null ? 0 : data.pp}`, true)
                .addField("Damage Class", `${data.damage_class.name}`, true)
                .addField("Effect Chance", `${data.effect_chance == null ? 0 : data.effect_chance}%`, true)
                .addField("Effect", `${data.effect_entries[0].effect.replace("$effect_chance", data.effect_chance)}`, true)]    
            })
        }).catch(e => { return interaction.reply({ content: `Unable To Find That Move!`})})
    }
}