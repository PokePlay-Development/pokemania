const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require('discord.js');
const User = require('../models/user');

module.exports = {
    name: 'quest',
    description: 'Check Out Your Quests!',
    run: async (client, interaction, color) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) {
            return interaction.reply(`You Have Not Started Yet, Please Start By Running \`/start\` Command!`)
        }
        let quests = [
            {
                quest: "Catch 10 Pokemons! <.>".replace(`<.>`, user.q1 == true ? "✅" : ""),
                reward: 1000
            },
            {
                quest: "Buy A MasterBall! <.>".replace(`<.>`, user.q2 == true ? "✅" : ""),
                reward: 2000
            },
            {
                quest: "Breed Your First Pokemon! <.>".replace(`<.>`, user.q3 == true ? "✅" : ""),
                reward: 3000
            },
            {
                quest: "Win An AI Battle in Hard Mode! <.>".replace(`<.>`, user.q4 == true ? "✅" : ""),
                reward: 4000
            },
            {
                quest: `Summon Your First Pokemon! <.>`.replace(`<.>`, user.q5 == true ? "✅" : ""),
                reward: 4000
            },
            {
                quest: `Hatch An Egg! <.>`.replace(`<.>`, user.q6 == true ? "✅" : ""),
                reward: 5000
            }
        ]
        let embed = new MessageEmbed()
        .setTitle(`Welcome To Your Quests!`)
        .setDescription(`Here You Can See Your Quests And Complete Them To Get Rewards!\n**Note:** These Quests When Finished, will get reseted every 24 hrs!`)
        .setColor(color)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        
        quests.forEach(quest => {
            let index = quests.indexOf(quest);
            index = index + 1;
            if(index == 1 && user.q1 !== true) {
            embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            } else if(index == 2 && user.q2 !== true) {
                embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            } else if(index == 3 && user.q3 !== true) {
                embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            } else if(index == 4 && user.q4 !== true) {
                embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            } else if(index == 5 && user.q5 !== true) {
                embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            } else if(index == 6 && user.q6 !== true) {
                embed.addField(`<a:crate_open:1033286893175046154> ${quest.quest}`, `Reward: \`${quest.reward}\` Credits!`)
            }
        })
        await interaction.reply({ embeds: [embed] })
    }
}