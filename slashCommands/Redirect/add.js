const Spawner = require("../../models/spawner.js")

module.exports = {
    name: "add",
    description: "Add A Channel To Spawn Redirection.",
    options: [
        {"Channel": { name: "channel", description: "Mention A Channel You Wish To Add!", required: true }}
    ],
    administrator: true,
    run: async (client, interaction, color, support) => {
        let spawn = await Spawner.findOne({ id: interaction.guild.id })
        if(!spawn) await new Spawner({ id: interaction.guild.id }).save()
        let _spawn = await Spawner.findOne({ id: interaction.guild.id })
        let channel = interaction.options.getChannel("channel")
        if(channel.type !== "GUILD_TEXT") {
            return interaction.reply({ content: `Only **TEXT** Channels Are Supported For Spawns.`})
        }
        if(_spawn.channels.includes(channel.id)) {
            return interaction.reply({ content: `That Channel is Already Added For Spawns!`})
        }
        _spawn.channels.push(channel.id)
        await _spawn.save()
        return interaction.reply({ content: `Successfully **Added** ${channel} In The Spawn Channels List.`})
    }
}