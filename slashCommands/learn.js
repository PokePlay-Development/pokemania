const fetch = require("node-fetch")
const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
module.exports = {
    name: "learn",
    description: "Learn A Move!",
    options: [{"String": { name: "move_name", description: `specify the move name, you wish to learn!`, required: true }}],
    run: async (client, interaction, color) => {
        let user = await User.findOne({
            id: interaction.user.id
        })
        if (!user) return interaction.reply("You Have Not Started Yet!\nType \`/pick\` To Start!")
        let selected = user.selected[0]
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
        if(moves.length >= 4) {
	    return await interaction.reply(`Your Pokémon Have Already Learnt 4 Moves!`)
        }
        let mvname = interaction.options.getString("move_name").replace(/ /g, "-").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
        .then(res => res.json())
        .then(async (data) => {
            let avail = data.moves.filter((move) => {
                if(move.version_group_details[0].move_learn_method.name == "level-up") return move
            }).filter((move) => {
                if(move.version_group_details[0].level_learned_at <= pokemon.level) return move;
            }).map(move => move.move.name)
            if(!avail.includes(mvname)) return interaction.reply("That Move Is Not Available To Learn!")
            if(moves.includes(mvname)) return interaction.reply("You Already Have That Move!")
            pokemon.moves.push(mvname)
            user.markModified("pokemons")
            user.save()
            interaction.reply(`Your ${pokemon.name} Has Learned ${replaceAll(mvname, "-", " ")}!`)
        })
    }
}
function replaceAll(str, find, replace) {
    var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}