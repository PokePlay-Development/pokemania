const Spawner = require("../../models/spawner.js")

module.exports = {
    name: "toggle",
    description: "toggle spawn redirections.",
    administrator: true,
    run: async (client, interaction, color, support) => {
        let spawn = await Spawner.findOne({ id: interaction.guild.id })
        if(!spawn) await new Spawner({ id: interaction.guild.id }).save()
        spawn = await Spawner.findOne({ id: interaction.guild.id })
        if(spawn.disabled == false) {
            spawn.disabled = true;
            await spawn.save()
        } else if(spawn.disabled == true) {
            spawn.disabled = false;
            await spawn.save()
        }
        return interaction.reply(`Successfully ${spawn.disabled == false ? "**Enabled**" : "**Disabled**"} For This Server!`)
    }
}