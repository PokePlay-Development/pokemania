const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const ms = require("ms")
const User = require("../../models/user")
module.exports = {
    name: "eval",
    description: "Evaluate Some Code [Developer Only]",
    developer: true,
    options: [
        {"String": { name: "code", description: "The Code To Be Evaluated.", required: true }},
        {"StringChoices": { name: "ephemeral", description: "Runs The Command Privately.", required: true, choices: [["true", "true"], ["false", "false"]] }}
    ],
    run: async (client, interaction, color, support, guild) => {
        let ephemeral = interaction.options.getString("ephemeral")
        if(ephemeral == "true") ephemeral = true
        if(ephemeral == "false") ephemeral = false
        const code = interaction.options.getString("code");
        await interaction.deferReply({ ephemeral: ephemeral });
        await eval(`(async() => { ${code} })()`).then(async (evaled) => {
            let time = new Date(), ping = new Date() - interaction.createdTimestamp, executed = []
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
            const embed = new MessageEmbed()
            .setTitle(`Code Evaluation | Powered By **Node.JS**`)
            .setColor(color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addField(`Input`, `\`\`\`javascript\n${code.substr(0, 1024)}\n\`\`\``)
            .setFooter({ text: `Ping: ${ping}ms`})
            if(evaled.length > 1024) {
                embed.addField(`Output`, `The Output is Longer Than 1024 Charecters, Results In DM?`)
            } else {
                embed.addField(`Output`, `\`\`\`js\n${evaled}\n\`\`\``)
            }
            if(evaled.length > 1024) {
                let row;
                if(ephemeral == false) {
                    let in_dm = new MessageButton().setStyle("SUCCESS").setCustomId("indm").setLabel("Dm Results")
                    let delete_msg = new MessageButton().setStyle("DANGER").setCustomId("delete_msg").setLabel("Delete Message")
                    row = [new MessageActionRow().addComponents([in_dm, delete_msg])]
                } else {
                    let in_dm = new MessageButton().setStyle("SUCCESS").setCustomId("indm").setLabel("Dm Results")
                    row = [new MessageActionRow().addComponents([in_dm])]
                }
                let msg = await interaction.editReply({ embeds: [embed], components: row })
                const filter = i => {
                    if(i.user.id == interaction.user.id) return true;
                    else return i.reply({ content: `This Button is Only For Command Executer.`, ephemeral: true })
                }
                const collector = msg.createMessageComponentCollector({
                    filter,
                    time: 30000
                })
                collector.on("collect", async (click) => {
                    click.deferUpdate()
                    if(click.customId == "delete_msg") {
                        await msg.delete()
                    }
                    if(click.customId == "indm") {
                        let output_arr = evaled.toString().match(/(.|[\r\n]){1,1980}/g)
                        output_arr.forEach((item) => {
                            interaction.user.send(`\`\`\`js\n${item}\`\`\``)
                        })
                    }
                })
            } else {
                let row;
                if(ephemeral == false) {
                    let in_dm = new MessageButton().setStyle("SUCCESS").setCustomId("indm").setLabel("Dm Results")
                    let delete_msg = new MessageButton().setStyle("DANGER").setCustomId("delete_msg").setLabel("Delete Message")
                    row = [new MessageActionRow().addComponents([in_dm, delete_msg])]
                } else {
                    let in_dm = new MessageButton().setStyle("SUCCESS").setCustomId("indm").setLabel("Dm Results")
                    row = [new MessageActionRow().addComponents([in_dm])]
                }
                let msg = await interaction.editReply({ embeds: [embed], components: row })
                const filter = i => {
                    if(i.user.id == interaction.user.id) return true;
                    else return i.reply({ content: `This Button is Only For Command Executer.`, ephemeral: true })
                }
                const collector = msg.createMessageComponentCollector({
                    filter,
                    time: 30000
                })
                collector.on("collect", async (click) => {
                    click.deferUpdate()
                    if(click.customId == "delete_msg") {
                        await msg.delete()
                    }
                    if(click.customId == "indm") {
                        interaction.user.send(`\`\`\`js\n${evaled.toString()}\`\`\``)
                    }
                })
            }
        }).catch(async e => {
            let msg = await interaction.editReply({ content: `\`\`\`js\n${e}\`\`\``, components: [new MessageActionRow().addComponents([new MessageButton().setStyle("SUCCESS").setCustomId("get_code").setLabel("Get Code In DMs.")])]})
            const collector = await msg.createMessageComponentCollector({
                time: 15000
            })
            collector.on("collect", async (click) => {
                let arr = code.match(/(.|[\r\n]){1,1980}/g);
                click.deferUpdate();
                interaction.followUp({ content: `Successfully Sent Codes In Your Dms!`, ephemeral: true })
                try {
                    arr.forEach((item) => {
                        click.user.send(`\`\`\`js\n${item}\`\`\``)
                    })
                } catch (e) {
                    interaction.followUp({ content: `${e}`, ephemeral: true })
                }
            })
        })
    }
}