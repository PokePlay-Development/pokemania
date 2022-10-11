const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
module.exports = {
    name: `shop`,
    description: `Check Out Our Shop!`,
    run: async (client, interaction, color, support, guild) => {
        let _language = guild.language;
		let language = require(`../languages/english.js`)
		if(_language.toLowerCase() == "english") language = require(`${process.cwd()}/languages/english.js`);
		if(_language.toLowerCase() == "hindi") language = require(`${process.cwd()}/languages/hindi.js`);
        await interaction.reply({ content: `Success!`, ephemeral: true })
        let ball_embed = new MessageEmbed()
        .setTitle(`${language.shop_pokeball}`)
        .setDescription(`${language.poke_ball_descrip}`)
        .setTimestamp()
        .setColor(color)
        .addFields(
            { name: `\u200B`, value: `${language.shop_pokeball_price}`}
        )
        .setThumbnail(`https://thumbs.gfycat.com/DefenselessPoisedArizonaalligatorlizard-max-1mb.gif`)
        let forward = new MessageButton().setStyle("PRIMARY").setCustomId("forward").setEmoji("▶️")
        let backward = new MessageButton().setStyle("PRIMARY").setCustomId("backward").setEmoji("◀️")
        const row = [new MessageActionRow().addComponents([backward, forward])]
        let msg = await interaction.channel.send({
            embeds: [ball_embed],
            components: row
        })
        const filter = i => {
            if(i.user.id == interaction.user.id) return true;
            else return i.reply({ content: `This Button is Not For You!`})
        }
        let crystal_embed = new MessageEmbed()
        .setTitle(`<:crystal:1022156445434781788> Shop Crystals!`)
        .setDescription(`Crystals Are The Second Currency Of The Game, Which Can Be Used For Trading Various Other Stuffs, Crystals Value More Than Credits!`)
        .setTimestamp()
        .setColor(color)
        .addFields(
            { name: `\u200B`, value: `**Item:** Crystals | **Price:** \`100 Credits\``}
        )
        let knot_embed = new MessageEmbed()
        .setTitle(`Shop Hatching Items!`)
        .setDescription(`Default Success Rate: **__25%__** \nKnots Are Used In Breeding And Increase Your Boost Rate As Well As Nerf Your Rates of Decreasing IVs.`)
        .setColor(color)
        .addFields(
            { name: `<:destiny_knot_egg:1027140153120141374> Destiny Knot`, value: `**__Price:__** \`150\` **Crystals** | **__45%__** Success Rate`},
            { name: `<:ultra_destiny_egg:1027140177224814622> Ultra Destiny Knot`, value: `**__Price:__** \`350\` **Crystals** | **__60%__** Success Rate`},
            { name: `Nest`, value: `**__Price:__** \`5,000\` Credits | Required For Hatching 1 Egg.`}
        )
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 15000
        })
        let index = 0;
        let pages = new Array(ball_embed, crystal_embed, knot_embed)
        collector.on("collect", async (click) => {
            collector.resetTimer();
            click.deferUpdate();
            if(click.customId == "forward") {
                index++;
                if(index >= pages.length) {
                    index = 0
                }
                await msg.edit({ embeds: [pages[index]] })
            } else {
                index--;
                if(index < 0) {
                    index = pages.length - 1;
                }
                await msg.edit({ embeds: [pages[index]] })
            }
        })
    }
}