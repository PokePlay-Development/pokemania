const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageAttachment
} = require("discord.js")
const User = require("../models/user.js")
const fetch = require("node-fetch")
const Canvas = require("canvas")
const Spawn = require("../models/spawn.js")
const Spawner = require("../models/spawner.js")
module.exports = {
    name: "summon",
    description: `Summon A Pokémon Using Your Summon Credits!`,
    options: [
        {"String": { name: "pokemon", description: `Name of The Pokémon Which You Wish To Summon!`, required: false }}
    ],
    run: async (client, interaction, color, support, guild) => {
        return interaction.reply(`This Command Is Currently Under Maintainence!`)
    }
}
async function check_ban(name) {
    let bans = [
        "-mega",
        "-primal",
        "-speed",
        "-origin",
        "-gmax"
    ];
    let flag = false;
    bans.forEach(item => {
        if(name.includes(item)) flag = true;
    })
    return flag;
}