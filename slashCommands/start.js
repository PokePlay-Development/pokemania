const {
    MessageEmbed,
    MessageAttachment
} = require("discord.js")
module.exports = {
    name: `start`,
    description: `Start Your Journey!`,
    run: async (client, interaction, color, support, guild) => {
        let attachment = new MessageAttachment(`https://thumbs.gfycat.com/DefenselessPoisedArizonaalligatorlizard-max-1mb.gif`, `ball.gif`)
        let _language = guild.language;
		let language = require(`../languages/english.js`)
		if(_language.toLowerCase() == "english") language = require(`${process.cwd()}/languages/english.js`);
		if(_language.toLowerCase() == "hindi") language = require(`${process.cwd()}/languages/hindi.js`);
        let embed = new MessageEmbed()
        .setTitle(`${language.welcome_to_world}`)
        .setColor(color)
        .setThumbnail(`attachment://ball.gif`)
        .setTimestamp()
        .setDescription(`${language.welcome_intro}`)
        .addFields(
            { name: `Kanto - Generation - 1`, value: `\`Bulbasaur | Charmander | Squirtle\``},
			{ name: `Johto - Generation - 2`, value: `\`Chikorita | Cyndaquil | Totodile\``},
			{ name: `Hoenn - Generation - 3`, value: `\`Treecko | Torchic | Mudkip\``},
			{ name: `Sinnoh - Generation - 4`, value: `\`Turtwig | Chimchar | Piplup\``},
			{ name: `Unova - Generation - 5`, value: `\`Snivy | Tepig | Oshawott\``},
			{ name: `Kalos - Generation - 6`, value: `\`Chespin | Fennekin | Froakie\``},
			{ name: `Alola - Generation - 7`, value: `\`Rowlet | Litten | Popplio\``},
			{ name: `Galar - Generation - 8`, value: `\`Grookey | Scorbunny | Sobble\``}
        )
        return await interaction.reply({ embeds: [embed], files: [attachment]  })
    }
}