const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const { color } = require("../../settings.json").embeds;
const fetch = require("node-fetch");
const User = require("../../models/user");
const Spawn = require("../../models/spawn.js");
const { instanceToPlain } = require("class-transformer");
const Pokemon = require("../../classes/pokemon");
module.exports = {
    name: "catch",
    aliases: ['c', 'cach'],
    description: "catch a pokemon",
    run: async (client, message, args) => {
        let user = await User.findOne({ id: message.author.id });
        if (!user) {
            return message.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter!`})
        }
        let spawn = await Spawn.findOne({ id: message.channel.id });
        if (!spawn) return message.reply({ content: `No Pokemon Is Currently Spawned In This Channel!` })
        if(!args[0]) return message.reply({ content: `Please Specify The Pokemon Name!` })
        if(spawn.pokename !== args[0]) return message.reply({ content: `That's The Wrong Pokemon!`})
        fetch(`https://pokeapi.co/api/v2/pokemon/${spawn.pokename}`)
        .then(res => res.json())
        .then(async data => {
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.name}`)
            .then(res => res.json())
            .then(async deta => {
                Spawn.findOneAndDelete({ id: message.channel.id }, async (err, res) => {
                    if(res) {
                        let yes_send = new MessageButton().setStyle("SUCCESS").setCustomId("send_to_center").setLabel("Yes Send To Center")
                        let no_send = new MessageButton().setStyle("DANGER").setCustomId("no_send_to_center").setLabel("No Keep It.")
                        const _row = [new MessageActionRow().addComponents([yes_send, no_send])]
                        let msg = await message.channel.send({
                            embeds: [new MessageEmbed()
                                .setTitle(`${message.author.username} Caught A **${data.name}!**`)
                                .setColor(color)
                                .setDescription(`Would You Like To Send This Pokémon To Pokémon Center?`)
                            ],
                            components: _row
                        })
                        const _filter = i => {
                            if (i.user.id == message.author.id) return true;
                            else return i.reply({ content: `Sorry! This Button is Not For You!`, ephemeral: true })
                        }
                        const _collector = msg.createMessageComponentCollector({
                            _filter,
                            max: 1,
                            time: 30000
                        })
                        let genarray = new Array("male", "female")
						let gender = genarray[Math.floor(Math.random() * 2)];
						if (deta.gender_rate < 0) gender = "none";
                        let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
                        let shiny_chance = getRandomNumberBetween(1, 100);
                        let shiny = false;
                        if (shiny_chance <= 5) {
                            url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${data.id}.png`;
                            shiny = true;
                        }
                        let poke = new Pokemon({ gender: gender, name: data.name, url: url, level: getRandomNumberBetween(1, 45), shiny: false, index: user.pokemons.length })
                        poke = instanceToPlain(poke)
                        _collector.on("collect", async (collect) => {
                            if (collect.customId == "send_to_center") {
                                user.pokemons1.push(poke)
                                user.caught.push(poke)
                                user.qcaught.push(poke)
                                await user.save()
                                if(user.qcaught.length >= 10 && user.q1 == false) {
                                    user = await User.findOne({ id: message.author.id })
                                    user.credits = user.credits + 1000
                                    user.q1 = true
                                    await user.save()
                                    await message.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
                                }
                                return collect.reply({ content: `**Successfully** Sent The Pokémon To **Pokémon Center!**` })
                            } else {
                                if (user.pokemons.length >= 6) {
                                    user.pokemons1.push(poke)
                                    user.caught.push(poke)
                                    user.qcaught.push(poke)
                                    await user.save()
                                    if(user.qcaught.length >= 10 && user.q1 == false) {
                                        user = await User.findOne({ id: message.author.id })
                                        user.credits = user.credits + 1000
                                        user.q1 = true
                                        await user.save()
                                        await message.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
                                    }
                                    return collect.reply({ content: `Your **Pokémon Slots** Are Currently Full! Sent The Pokémon To Pokémon Center.` })
                                } else {
                                    user.pokemons.push(poke)
                                    user.caught.push(poke)
                                    user.qcaught.push(poke)
                                    await user.save()
                                    if(user.qcaught.length >= 10 && user.q1 == false) {
                                        user = await User.findOne({ id: message.author.id })
                                        user.credits = user.credits + 1000
                                        user.q1 = true
                                        await user.save()
                                        await message.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
                                    }
                                    return collect.reply({ content: `**Successfully** Added **${data.name}** To Your Pokémon Slots!` })
                                }
                            }
                        })
                        _collector.on("end", async (collected) => {
                            if (collected.size <= 0) {
                                user.pokemons1.push(poke)
                                user.caught.push(poke)
                                await user.save()
                                return message.channel.send({ content: `There Was **No Response** From The Trainer,\n**Successfully** Sent The Pokémon To **Pokémon Center!**` })
                            }
                        })
                    }
                })
            })
        })
    }
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}