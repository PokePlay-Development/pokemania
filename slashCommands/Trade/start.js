const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const Trade = require("../../models/trade.js")
const User = require("../../models/user.js")

module.exports = {
    name: "start",
    description: "Start Trades With A User!",
    trade: true,
    options: [
        {"User": { name: "member", description: "Mention The Member You Wish To Trade!", required: true }}
    ],
    run: async (client, interaction, color) => {
        const { options } = interaction;
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Yet, Run \`/start\` command to pick a starter.`})
        let mention = options.getUser("member")
        if(mention.bot) return interaction.reply({ content: `You Cannot Trade With A Bot User.`})
        if(mention.id == interaction.user.id) return interaction.reply({ content: `You Cannot Trade With Yourself`, ephemeral: true })
        let _user = await User.findOne({ id: mention.id })
        if(!_user) return interaction.reply({ content: `The Mentioned User Have Not Started Yet!`})
        let trade = await Trade.findOne({ id1: interaction.user.id });
        let _trade = await Trade.findOne({ id2: interaction.user.id });
        if(trade || _trade) return interaction.reply(`You Are Already Trading With Someone!`)
        trade = await Trade.findOne({ id1: mention.id });
        _trade = await Trade.findOne({ id2: mention.id });
        if(trade || _trade) return interaction.reply(`The Mentioned User Already Trading With Someone!`)
        await interaction.deferReply({ ephemeral: true });
        let msg = await interaction.channel.send({
            content: `<@${mention.id}>, You Are Requested For A Trade With <@${interaction.user.id}>!`,
            components: [new MessageActionRow()
            .addComponents([
                new MessageButton()
                .setStyle("SUCCESS")
                .setCustomId("accept")
                //.setDisabled(true)
                .setLabel("accept"),
                new MessageButton()
                .setStyle("DANGER")
                .setCustomId("decline")
                .setLabel("decline")
            ])]
        })
        const filter = i => {
            if(i.user.id == mention.id) return true;
            else return i.reply({ content: `You Are Not Allowed To Interact With This Button.`, ephemeral: true })
        }
        const collector = msg.createMessageComponentCollector({
            filter,
            max: 1,
            time: 30000
        })
        collector.on("collect", async (click) => {
            click.deferUpdate()
            msg.delete()
            if(click.customId == "decline") {
                interaction.editReply(`Successfully Declined The Request.`)
            } else {
                trade = await Trade.findOne({ id1: interaction.user.id });
                _trade = await Trade.findOne({ id2: interaction.user.id });
                if(trade || _trade) return interaction.editReply(`You Are Already Trading With Someone!`)
                trade = await Trade.findOne({ id1: mention.id });
                _trade = await Trade.findOne({ id2: mention.id });
                if(trade || _trade) return interaction.editReply(`The Mentioned User Already Trading With Someone!`)
                await new Trade({ id1: interaction.user.id, id2: mention.id, tag1: interaction.user.tag, tag2: click.user.tag, username1: interaction.user.username, username2: click.user.username }).save()
                interaction.channel.send({
                    embeds: [new MessageEmbed()
                    .setTitle(`Trade Between ${interaction.user.tag} And ${mention.tag}`)
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`The Trade Between The Users Have Successfully Begun!`)
                    .addFields(
                        { name: `🔴 ${interaction.user.username}'s side`, value: `No Items Added.`, inline: true },
                        { name: `🔴 ${mention.username}'s side`, value: `No Items Added.`, inline: true }
                    )],
                    components: [new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setStyle("SUCCESS")
                        .setCustomId("confirm_trade")
                        //.setDisabled(true)
                        .setLabel("Confirm Trade"),
                        new MessageButton()
                        .setStyle("DANGER")
                        .setCustomId("decline_trade")
                        .setLabel("Cancel Trade")
                    ])]
                })
                await interaction.editReply(`Success!`)
            }
        })
        collector.on("end", async (collected) => {
            if(collected.size == 0) {
                await msg.delete()
                interaction.editReply(`Request Timed Out.`)
                interaction.channel.send(`The Request Sent By **${interaction.user.tag}** For A Trade With **${mention.tag}** Timed Out.`)
            }
        })
    }
}