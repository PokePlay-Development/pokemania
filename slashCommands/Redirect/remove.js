const Spawner = require("../../models/spawner.js")

module.exports = {
    name: "remove",
    description: "Remove A Channel From Spawn Redirection.",
    options: [
        {"Channel": { name: "channel", description: "Mention A Channel You Wish To Remove!", required: true }}
    ],
    administrator: true,
    run: async (client, interaction, color, support) => {
        let spawn = await Spawner.findOne({ id: interaction.guild.id })
        if(!spawn) await new Spawner({ id: interaction.guild.id }).save()
        spawn = await Spawner.findOne({ id: interaction.guild.id })
        let channel = interaction.options.getChannel("channel")
        if(channel.type !== "GUILD_TEXT") {
            return interaction.reply({ content: `Only **TEXT** Channels Are Supported For Spawns.`})
        }
        if(!spawn.channels.includes(channel.id)) {
            return interaction.reply({ content: `That Channel is Not Added For Spawns!`})
        }
        let index = spawn.channels.indexOf(channel.id)
        if(index > -1) {
            spawn.channels.splice(index, 1)
            await spawn.save()
        }
        return interaction.reply({ content: `Successfully **Removed** ${channel} From The Spawn Channels List.`})
    }
}