const { MessageEmbed } = require("discord.js")
const Spawner = require("../../models/spawner.js")

module.exports = {
    name: "info",
    description: "Get The Status of Spawn Redirections.",
    administrator: true,
    run: async (client, interaction, color, support) => {
        let spawn = await Spawner.findOne({ id: interaction.guild.id })
        if(!spawn) await new Spawner({ id: interaction.guild.id }).save()
        spawn = await Spawner.findOne({ id: interaction.guild.id })
        return interaction.reply({
            embeds: [new MessageEmbed()
            .setTitle("Spawn Redirections")
            .setColor(color)
            .setDescription(`Given Below is The Status of Spawn Redirections in This Server.`)
            .addFields(
                { name: "Spawn Channels:", value: `${spawn.channels.length > 0 ? `${spawn.channels.map(r => `<#${r}>`).join(", ")}` : `No Channel.`}`},
                { name: "Total Spawns", value: `${spawn.total_spawns} Spawns!`},
                { name: "Status", value: `${spawn.disabled == false ? "**Enabled**" : "**Disabled**"}`}
            )]
        })
    }
}