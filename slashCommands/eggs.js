const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
let emojis = [
    { name: "no_knot", value: "<:no_knot_egg:1027140086095151134>" },
    { name: "destiny_knot", value: "<:destiny_knot_egg:1027140153120141374>" },
    { name: "ultra_destiny_knot", value: "<:ultra_destiny_egg:1027140177224814622>" }
]
module.exports = {
    name: "eggs",
    description: "Check Your Eggs!",
    options: [
        {"Integer": { name: "info", description: `Give The Egg ID Which's Stats You Wish To See!`, required: false }}
    ],
    run: async (client, interaction, color, support, guild) => {
        const options = interaction.options
        let info = options.getInteger("info")
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Your Journey Yet,\nType \`/start\` To Start Your Journey.` })
        if(info) {
            let egg = user.eggs[info - 1]
            if(!egg) return interaction.reply(`Unable To Find The Egg With That ID.`)
            let stats_array = new Array();
            stats_array.push(`**HP:** - **(${egg.hp}/31)**`)
            stats_array.push(`**Attack:** - **(${egg.atk}/31)**`)
            stats_array.push(`**Defence:** - **(${egg.def}/31)**`)
            stats_array.push(`**Sp. Atk:** - **(${egg.spatk}/31)**`)
            stats_array.push(`**Sp. Def:** - **(${egg.spdef}/31)**`)
            stats_array.push(`**Speed:** - **(${egg.speed}/31)**`)
            stats_array.push(`**Total IV:** **${egg.totalIV}%**`)
            let embed = new MessageEmbed()
            .setThumbnail("https://www.pngmart.com/files/12/Single-Easter-Egg-PNG-HD.png")
            .setTitle(`${egg.name}'s Egg`)
            .setColor(color)
            .setFooter({ text: `Showing Egg With ID: #${info}`})
            .setTimestamp()
            .setDescription(`**__Level:__** \`${egg.level}\`\n**__Nature:__** \`${egg.nature}\``)
            .addField(`**__Statistics__**`, `${stats_array.join("\n")}`)
            .addField(`**__Other__**`, `**__Held Items:__** ${egg.helditem.length > 0 ? egg.helditem : "no Item"}`)
            return interaction.reply({ embeds: [embed] })
        }
        let eggs = user.eggs.map(r => `\`#${user.eggs.indexOf(r) + 1}\` **${emojis.find(item => item.name === r.helditem) ? emojis.find(item => item.name === r.helditem).value : emojis.find(item => item.name === "no_knot").value} ${r.name} - ${r.totalIV}%**`)
        let embed = new MessageEmbed()
        .setTitle(`Your Eggs`)
        .setDescription(`Eggs When Hatched Give Berth To New Pokémons! Knots Are Used To Increase The Rates Of Increase In stats.`)
        .setTimestamp()
        .addField(`Your Knots`,`**${emojis[1].value} Destiny Knots:** \`${user.destiny_knot}\`\n**${emojis[2].value} Ultra Destiny Knots:** \`${user.ultra_destiny_knot}\``)
        .setColor(color)
        .addFields(
            { name: "Your Eggs", value: `${eggs.length > 0 ? `${eggs.join("\n")}` : "*You Don't Own Any Eggs! Breed Pokémons To Gain Some Eggs!"}`}
        )
        return interaction.reply({ embeds: [embed] })
    }
}