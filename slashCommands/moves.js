const fetch = require("node-fetch")
const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
module.exports = {
    name: "moves",
    description: "See The Moves Your Pokémon Can Learn!",
    run: async (client, interaction, color) => {
        let user = await User.findOne({
            id: interaction.user.id
        })
        if (!user) return interaction.reply("You Have Not Started Yet, Run \`/start\` To Pick Your Starter.")
        let selected = user.selected[0];
	if(!selected) return interaction.reply(`You have Not Selected Any Pokémon!`)
	let poke = user.pokemons.find(r => {
        delete r.xp;
        delete user.selected[0].xp;
        delete r.level;
        delete user.selected[0].level;
	delete r.moves;
	delete user.selected[0].moves;
        return JSON.stringify(r) === JSON.stringify(user.selected[0])
    })
    let index = user.pokemons.indexOf(poke)
    user = await User.findOne({ id: interaction.user.id })
    pokemon = user.pokemons[index]
    if(!pokemon) return interaction.reply(`You have Not Selected Any Pokémon!`)
	let moves = pokemon.moves;
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
            .then(res => res.json())
            .then(async (data) => {
                let avail = data.moves.filter((move) => {
                    if(move.version_group_details[0].move_learn_method.name == "level-up") return move
                }).filter((move) => {
                    if(move.version_group_details[0].level_learned_at <= pokemon.level) return move;
                }).map(move => move.move.name)
                let embed = new MessageEmbed()
                    .setColor(color)
                    .setTitle(`${pokemon.name}'s Moves`)
                    .setDescription(`To Learn A Move, You May Type \`/learn <move_name>\``)
                    .addField("Available Moves", `${avail.length > 0 ? replaceAll(avail.join("\n"), "-", " ") : "\u200B"}`, true)
                    .addField("Selected Moves", `${moves.length > 0 ? replaceAll(moves.join("\n"), "-", " ") : "\u200B"}`, true)
                    await interaction.reply({ embeds: [embed] })
            })
    }
}
function replaceAll(str, find, replace) {
    var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}