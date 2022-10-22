const { MessageButton, MessageActionRow } = require("discord.js");
const User = require("../models/user.js")
module.exports = {
    name: `buy`,
    description: `Buy Something From The Shop.`,
    options: [
        {"StringChoices": { name: "item", description: "What Item You Wish To Buy?", required: true, choices: [
            ["greatball", "greatball"],
            ["ultraball", "ultraball"],
            ["masterball", "masterball"],
            ["crystals", "crystals"],
            ["destiny_knot", "destiny_knot"],
            ["ultra_destiny_knot", "ultra_destiny_knot"],
            ["summon", "summon"],
            ["nest", "nest"]
        ]}},
        {"Integer": { name: "ammount", description: "How Much Of That Item You Wish To Buy?", required: true }}
    ],
    run: async (client, interaction, color, support, guild) => {
        let _language = guild.language;
		let language = require(`../languages/english.js`)
		if(_language.toLowerCase() == "english") language = require(`${process.cwd()}/languages/english.js`);
		if(_language.toLowerCase() == "hindi") language = require(`${process.cwd()}/languages/hindi.js`);
        const { options } = interaction;
        let item = options.getString("item")
        let amt = options.getInteger("ammount")
        let user = await User.findOne({ id: interaction.user.id })
        if (!user) return interaction.reply({ content: `${language.no_starter_picked}` })
        if (amt < 0) return interaction.reply({
            content: `${language.amt_greater_than_0}`
        })
        let accept = new MessageButton().setStyle("SUCCESS").setCustomId("accept").setLabel("accept")
        let decline = new MessageButton().setStyle("DANGER").setCustomId("decline").setLabel("decline")
        const row = [new MessageActionRow().addComponents([accept, decline])]
        let content = "Are You Sure You Wish To Purchase {amt}x **{item}** For **{price}** {currency}?\n*This Transaction is Non Reversable And Non Refundable!*"
        const filter = i => {
            if(i.user.id == interaction.user.id) return true;
            else return i.reply({ content: `You Are Not Permitted To Interact With This Button.`, ephemeral: true })
        }
        if(item == "greatball") {
            let total = 1000 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "GreatBall(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    //if(total > user.credits) return;
                    user.greatball += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **greatball(s)** For **${total}** Credits.`})
                }
            })
        }
        if(item == "ultraball") {
            let total = 5000 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "UltraBall(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    //if(total > user.credits) return;
                    user.ultraball += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **UltraBall(s)** For **${total}** Credits.`})
                }
            })
        }
        if(item == "masterball") {
            let total = 7000 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "MasterBall(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    //if(total > user.credits) return;
                    user.masterball += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **MasterBall(s)** For **${total}** Credits.`})
                    if(user.q2 == false) {
                        user.q2 = true;
                        user.credits += 2000;
                        await user.save()
                        await interaction.followUp({ content: `You Have Completed The Second Quest **To Purchase A Master Ball** And Have Been Rewarded With 2000 Credits.`})
                    }
                }
            })
        }
        if(item == "crystals") {
            let total = 100 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "Crystal(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    //if(total > user.credits) return;
                    user.crystals += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **Crystal(s)** For **${total}** Credits.`})
                }
            })
        }
        if(item == "destiny_knot") {
            let total = 150 * amt;
            if(total > user.crystals) return interaction.reply({ content: `You Don't have Enough Crystals To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "destiny_knot(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Crystals"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.crystals = user.crystals - total;
                    //if(total > user.crystals) return;
                    user.destiny_knot += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **Destiny_Knot(s)** For **${total}** Crystals.`})
                }
            })
        }
        if(item == "ultra_destiny_knot") {
            let total = 350 * amt;
            if(total > user.crystals) return interaction.reply({ content: `You Don't have Enough Crystals To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "ultra_destiny_knot(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Crystals"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.crystals = user.crystals - total;
                    //if(total > user.crystals) return;
                    user.ultra_destiny_knot += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **Ultra_Destiny_Knot(s)** For **${total}** Crystals.`})
                }
            })
        }
        if(item == "summon") {
            let total = 10000 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "Summon(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    user.summons += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **summon(s)** For **${total}** Crystals.`})
                }
            })
        }
        if(item == "nest") {
            let total = 5000 * amt;
            if(total > user.credits) return interaction.reply({ content: `You Don't have Enough Credits To Perform This Action.`, ephemeral: true })
            let msg = await interaction.channel.send({ content: content.replace("{item}", "Nest(s)").replace("{amt}", amt).replace("{price}", total).replace("{currency}", "Credits"), components: row })
            await interaction.deferReply();
            const collector = await msg.createMessageComponentCollector({
                filter,
                max: 1,
                time: 15000
            })
            collector.on("collect", async (click) => {
                click.deferUpdate()
                if(click.customId == "decline") {
                    await interaction.editReply({ content: `Successfully Declined Your Request.`})
                } else {
                    user.credits = user.credits - total;
                    user.nest += amt;
                    await user.save()
                    await interaction.editReply({ content: `Successfully Purchased ${amt}x **Nest(s)** For **${total}** Credits.`})
                }
            })
        }
    }
}