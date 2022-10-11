const { MessageButton, MessageActionRow } = require("discord.js");
const User = require("../models/user.js")

module.exports = {
    name: "release",
    description: "release a Pokémon / egg.",
    options: [
        {"StringChoices": { name: "what_release", description: "what To Release? Pokémon/egg", required: true, choices: [["pokemon", "pokemon"], ["egg", "egg"]]}},
        {"Integer": { name: "item", description: "item id.", required: true }}
    ],
    run: async (client, interaction, color) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Picked A Starter Yet, Run \`/start\` Command To Pick A Starter.` })
        const { options } = interaction;
        let item = options.getString("what_release")
        let amt = options.getInteger("item")
        if(item == "pokemon") {
            let poke = user.pokemons[amt - 1]
            if(poke) {
                let accept = new MessageButton().setStyle("SUCCESS").setCustomId("accept").setLabel("accept")
                let decline = new MessageButton().setStyle("DANGER").setCustomId("decline").setLabel("decline")
                const row = [new MessageActionRow().addComponents([accept, decline])]
                let msg = await interaction.channel.send({ content: `Are You Sure, You wish To Release Your **Level ${poke.level} __${poke.name}__ ${poke.totalIV}%**`, components: row })
                const filter = i => {
                    if(i.user.id === interaction.user.id) return true;
                    return i.reply({ content: `This Button is Not For You!`, ephemeral: true })
                }
                const collector = msg.createMessageComponentCollector({
                    filter,
                    max: 1,
                    time: 15000
                })
                collector.on("collect", async (click) => {
                    if(click.customId == "decline") {
                        return click.reply({ content: `Request Declined.`})
                    } else {
                        user.pokemons.splice(amt - 1, 1)
                        user.credits += 100;
                        await user.save()
                        await click.reply({ content: `Successfully Released The Pokémon, You Recieved **100** Credits.`})
                    }    
                })
           }
        }
        if(item == "egg") {
            let poke = user.eggs[amt - 1]
            if(poke) {
                let accept = new MessageButton().setStyle("SUCCESS").setCustomId("accept").setLabel("accept")
                let decline = new MessageButton().setStyle("DANGER").setCustomId("decline").setLabel("decline")
                const row = [new MessageActionRow().addComponents([accept, decline])]
                let msg = await interaction.channel.send({ content: `Are You Sure, You wish To Release Your ** __${poke.name}'s egg__ ${poke.totalIV}%**`, components: row })
                const filter = i => {
                    if(i.user.id === interaction.user.id) return true;
                    return i.reply({ content: `This Button is Not For You!`, ephemeral: true })
                }
                const collector = msg.createMessageComponentCollector({
                    filter,
                    max: 1,
                    time: 15000
                })
                collector.on("collect", async (click) => {
                    if(click.customId == "decline") {
                        return click.reply({ content: `Request Declined.`})
                    } else {
                        user.eggs.splice(amt - 1, 1)
                        user.credits += 100;
                        await user.save()
                        await click.reply({ content: `Successfully Released The Egg, You Recieved **100** Credits.`})
                    }    
                })
           }
        }
    }
}