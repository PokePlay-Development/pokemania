const { Client, Collection, Intents, MessageButton, MessageActionRow, MessageAttachment, MessageEmbed } = require("discord.js");
onst { color } = require("../../settings.json").embeds;
const fetch = require("node-fetch");
const User = require("../../models/user");
const Spawn = require("../../models/spawn.js");
const { instanceToPlain } = require("class-transformer");
const Pokemon = require("../../classes/pokemon");
let embed = new Discord.MessageEmbed()
                        .setTitle(`A wild pokémon has appeared!`)
                        .setColor(require("./settings.json").embeds.color)
                        .setImage(`attachment://pokemon.png`)
                        .setDescription(`Guess the pokémon and type \`${guild.prefix}catch <pokémon>\` to catch it!`)
module.exports = {
name: "test",
 run: async (client, message, args) => {
if (!args[0]) return message.reply({
                        embeds: [embed],
                        components: row,
                        files: [attachment]
                    })

                    
