const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const { default: fetch } = require("node-fetch")
const User = require("../models/user.js")
module.exports = {
    name: "hatch",
    description: "Hatch An Egg To Recieve A Pokémon!",
    options: [
        { "Integer": { name: "egg_id", description: "The #id of the Pokémon Egg You Wish To Hatch!", required: true } }
    ],
    run: async (client, interaction, color, support, guild) => {
        let user = await User.findOne({ id: interaction.user.id })
        if (!user) return interaction.reply({ content: `You Have Not Started Yet, Run \`/start\` Command To Choose Your Starter.` })
        const { options } = interaction;
        let egg_id = options.getInteger("egg_id")
        let egg = user.eggs[egg_id - 1]
        if (!egg) return interaction.reply({ content: `That **Egg** id is Invalid.` })
        if (user.nest < 1) return interaction.reply({ content: `You Need To Purchase An **Nest** To Hatch A Egg!` })
        fetch(`https://pokeapi.co/api/v2/pokemon/${egg.name}`)
            .then(res => res.json())
            .then(async data => {
                let accept = new MessageButton().setStyle("SUCCESS").setCustomId("accept").setLabel("Center")
                let decline = new MessageButton().setStyle("SUCCESS").setCustomId("decline").setLabel("To Pocket")
                if (user.pokemons.length >= 6) {
                    decline.setDisabled(true)
                }
                let row = new MessageActionRow().addComponents([accept, decline])
                let message = await interaction.channel.send({ content: `<@${interaction.user.id}>, Where Would You Like To Send The Pokémon?`, components: [row] })
                await interaction.deferReply()
                const filter = i => {
                    if (i.user.id == interaction.user.id) return true;
                    else return i.reply({ content: `This Button is Not For You!`, ephemeral: true })
                }
                const collector = await message.createMessageComponentCollector({
                    filter,
                    max: 1,
                    time: 20000
                })
                collector.on("collect", async (click) => {
                    await click.deferUpdate()
                    user = await User.findOne({ id: click.user.id })
                    if (user.nest < 1) return interaction.editReply({ content: `Cancelled.` })
                    if (click.customId == "accept") {
                        let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
                        let poke = egg;
                        let index = user.eggs.indexOf(egg)
                        if (index > -1) {
                            user.eggs.splice(index, 1)
                            poke.url = url;
                            poke.helditem = [];
                            poke.level = getRandomNumberBetween(1, 20)
                            user.pokemons1.push(poke)
                            user.nest = user.nest - 1;
                            if(user.q6 !== true) {
                                user.q6 = true
                                user.credits += 4000
                                await user.save()
                                await interaction.channel.send({ content: `**${click.user.username}** Has Successfully Completed Their 6th Quest, They Recieved 4,000 Credits!` })
                            }
                            await user.save()
                        } else {
                            poke.url = url;
                            poke.helditem = [];
                            poke.level = getRandomNumberBetween(1, 20)
                            user.pokemons1.push(poke)
                            user.nest = user.nest - 1;
                            if(user.q6 !== true) {
                                user.q6 = true
                                user.credits += 4000
                                await user.save()
                                await interaction.channel.send({ content: `**${click.user.username}** Has Successfully Completed Their 6th Quest, They Recieved 4,000 Credits!` })
                            }
                            await user.save()
                        }
                        await interaction.editReply({ content: `**You Successfully** Hatched An Egg of **__${poke.name}__ Level: ${poke.level}.**` })
                    } else {
                        let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
                        let poke = egg;
                        if (index > -1) {
                            user.eggs.splice(index, 1)
                            poke.url = url;
                            poke.helditem = [];
                            poke.level = getRandomNumberBetween(1, 20)
                            user.pokemons1.push(poke)
                            user.nest = user.nest - 1;
                            if(user.q6 !== true) {
                                user.q6 = true
                                user.credits += 4000
                                await user.save()
                                await interaction.channel.send({ content: `**${click.user.username}** Has Successfully Completed Their 6th Quest, They Recieved 4,000 Credits!` })
                            }
                            await user.save()
                        } else {
                            poke.url = url;
                            poke.helditem = [];
                            poke.level = getRandomNumberBetween(1, 20)
                            user.pokemons1.push(poke)
                            user.nest = user.nest - 1;
                            if(user.q6 !== true) {
                                user.q6 = true
                                user.credits += 4000
                                await user.save()
                                await interaction.channel.send({ content: `**${click.user.username}** Has Successfully Completed Their 6th Quest, They Recieved 4,000 Credits!` })
                            }
                            await user.save()
                        }
                        await interaction.editReply({ content: `**You Successfully** Hatched An Egg of **__${poke.name}__ Level: ${poke.level}.**` })
                    }
                })
            })
    }
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}