const {
    MessageEmbed
} = require("discord.js")
module.exports = {
    name: "invite",
    description: "Invite the bot to your server",
    run: async (client, interaction, color, support, guild) => {
        let invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=388168`;
        let embed = new MessageEmbed()
            .setTitle(`Invite ${client.user.username} To Your Server`)
            .setColor(color)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "Invite Bot", value: `[\`Invite ${client.user.username} Here!\`](${invite})` },
                { name: "Support Server", value: `[\`Join ${client.user.username}'s Support Server!\`](${support})` }
            )
        return interaction.reply({ embeds: [embed] })
    }
}