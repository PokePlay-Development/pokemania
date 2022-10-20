const {
    MessageEmbed
} = require("discord.js")
const User = require("../models/user.js")

module.exports = {
    name: `balance`,
    description: `Check Your balance.`,
    trade: true,
    run: async (client, interaction, color, support, guild) => {
        await interaction.deferReply();
        let user = await User.findOne({ id: interaction.user.id })
        let _language = guild.language;
		let language = require(`../languages/english.js`)
		if(_language.toLowerCase() == "english") language = require(`${process.cwd()}/languages/english.js`);
		if(_language.toLowerCase() == "hindi") language = require(`${process.cwd()}/languages/hindi.js`);
        if(!user) {
            return await interaction.editReply({ content: `${language.no_starter_picked}` })
        } else {
            let credits = user.credits.toLocaleString();
            let crystals = user.crystals.toLocaleString();
            let pokeballs = {
                masterball: user.masterball.toLocaleString(),
                ultraball: user.ultraball.toLocaleString(),
                greatball: user.greatball.toLocaleString()
            }
            await interaction.editReply({
                embeds: [new MessageEmbed()
                .setColor(color)
                .setTitle(`${interaction.user.username}'s Credits`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`\`${credits}\` Credits\n\`${crystals}\` Crystals`)
                .addFields(
                    { name: `<:pokeball:1022147275339870259> PokéBalls`, value: `**MasterBalls: \`${pokeballs.masterball}\` | UltraBalls: \`${pokeballs.ultraball}\` | GreatBalls: \`${pokeballs.greatball}\`**`}
                )]
            })
        }
    }
}