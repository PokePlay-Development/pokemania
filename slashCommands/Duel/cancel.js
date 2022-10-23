const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")

module.exports = {
    name: "cancel",
    description: "Cancel The Current Duel!",
    duel: true,
    battle: true, 
    run: async (client, interaction, color) => {
        let check = client.battles.find(r => r.id == interaction.user.id)
        if(!check && !client.battles.find(r => r.id1 == interaction.user.id)) {
            return interaction.reply({ content: `You Are Not Currently in A Battle.`})
        } else {
            let index = client.battles.indexOf(check)
            if(index < 0) client.battles.indexOf(client.battles.find(r => r.id1 == interaction.user.id))
            if(index > -1) {
                client.battles.splice(index, 1)
                return interaction.reply(`Successfully Cancelled The Current Battle.`)
            }
        }
    }
}