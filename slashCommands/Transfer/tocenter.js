const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../../models/user.js")
const fetch = require("node-fetch")

module.exports = {
    name: `to_center`,
    description: `Transfer Pokémon to Pokémon Center.`,
    //trade: true,
    options: [
        {"Integer": { name: "pokemon", description: "The Pokémon Slot ID you want to transfer.", required: true }},
    ],
    run: async (client, interaction, color, support, guild) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) {
            return await interaction.reply({ content: `You don't have a starter Pokémon!`, ephemeral: true })
        } else {
            const { options } = interaction;
            let pokemon = options.getInteger("pokemon");
            let poke = user.pokemons[pokemon - 1];
            if(!poke) {
                return await interaction.reply({ content: `You don't have a Pokémon with that ID!`, ephemeral: true })
            } else {
                let accept = new MessageButton()
                .setCustomId(`accept`)
                .setLabel(`Accept`)
                .setStyle(`SUCCESS`)
                let decline = new MessageButton()
                .setCustomId(`decline`)
                .setLabel(`Decline`)
                .setStyle(`DANGER`)
                let row = new MessageActionRow()
                .addComponents([accept, decline])
                await interaction.reply({ content: `Success!`, ephemeral: true })
                let msg = await interaction.followUp({ content: `Are You Sure You Wish To Transfer Your ${poke.shiny == true ? "✨" : ""} **__${poke.name}___** **__Level:__** \`${poke.level}\` **${poke.totalIV}%** To Pokémon Center?`, components: [row] })
                const filter = i => {
                    if(i.user.id == interaction.user.id) return true;
                    else return i.reply({ content: `This Button is Not For You!`, ephemeral: true })
                }
                const collector = msg.createMessageComponentCollector({ filter, max: 1, time: 60000 });
                collector.on("collect", async (click) => {
                    if(click.customId == "accept") {
                            user.pokemons1.push(poke);
                            user.pokemons.splice(pokemon - 1, 1);
                            await user.save();
                            //await click.reply({ content: `Success!`, ephemeral: true })
                            await click.reply({ content: `Successfully Transferred Your ${poke.shiny == true ? "✨" : ""} **__${poke.name}___** **__Level:__** \`${poke.level}\` **${poke.totalIV}%** To Pokémon Center!`, components: [] })
                    } else {
                        click.reply(`Successfully Declined The Request.`)
                    }
                })
            }
        }
    }
}