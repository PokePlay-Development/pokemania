const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const Trade = require("../../models/trade.js")
const User = require("../../models/user.js")

module.exports = {
    name: "cancel",
    trade: true,
    description: "Cancel Your Trade.",
    run: async (client, interaction, color) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Yet, Run \`/start\` command to pick a starter.`})
        let trade = await Trade.findOne({ id1: interaction.user.id });
        let _trade = await Trade.findOne({ id2: interaction.user.id });
        if(!trade && !_trade) return interaction.reply(`You Are Not Already Trading With Someone!`)
        if(trade) {
            Trade.findOneAndDelete({ id1: interaction.user.id }, async (err, res) => {
                if(res) return interaction.reply(`Sucessfully Cancelled The Trade.`)
            })
        }
        if(_trade) {
            Trade.findOneAndDelete({ id2: interaction.user.id }, async (err, res) => {
                if(res) return interaction.reply(`Sucessfully Cancelled The Trade.`)
            })
        }
    }
}