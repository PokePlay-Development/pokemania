const fetch = require("node-fetch")
const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
module.exports = {
    name: "unlearn",
    description: "Unlearn A Move!",
    options: [{"String": { name: "move_name", description: `specify the move name, you wish to Unlearn!`, required: true }}],
    run: async (client, interaction, color) => {
        let user = await User.findOne({
            id: interaction.user.id
        })
        if (!user) return interaction.reply("You Have Not Started Yet!\nType \`/pick\` To Start!")
        let selected = user.selected[0]
	    if(!selected) return interaction.reply(`You have Not Selected Any Pokémon!`)
	    let pk = user.pokemons.find(r => JSON.stringify(r) === JSON.stringify(user.selected[0]))
	    if(!pk) return interaction.reply(`You have Not Selected Any Pokémon!`)
        let moves = pk.moves;
        if(moves.length >= 4) {
	    await interaction.reply(`Your Pokémon Have Already Learnt 4 Moves!`)
        }
        let mvname = interaction.options.getString("move_name").replace(/ /g, "-").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pk.name}`)
        .then(res => res.json())
        .then(async (data) => {
            let avail = data.moves.filter((move) => {
                if(move.version_group_details[0].move_learn_method.name == "level-up") return move
            }).filter((move) => {
                if(move.version_group_details[0].level_learned_at <= pk.level) return move;
            }).map(move => move.move.name)
            if(!avail.includes(mvname)) return interaction.reply("That Move Is Not Available!")
            if(!moves.includes(mvname)) return interaction.reply("You Don't Have That Move!")
            let index = pk.moves.indexOf(mvname)
            if(index > -1) {
                pk.moves.splice(index, 1)
                user.markModified("pokemons")
                user.save()
                interaction.reply(`Your ${pk.name} Has Unlearned ${replaceAll(mvname, "-", " ")}!`)
            }
        })
    }
}
function replaceAll(str, find, replace) {
    var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}