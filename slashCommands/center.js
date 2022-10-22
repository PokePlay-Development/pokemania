const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageSelectMenu
} = require("discord.js")
const User = require("../models/user.js")
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: "center",
    trade: true,
    description: "Check Your Pokemons At Pokemon Center.",
    options: [
        { "Integer": { name: "info_poke", description: "poke id of the pokemon you wish to info.", required: false } }
    ],
    run: async (client, interaction, color) => {
        return interaction.reply(`Sorry But This Command is Currently Under Construction.`)
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Yet, Pick A Starter Pokemon First!`})
        const { options } = interaction;
        let poke_id = options.getInteger("info_poke")
        if (!poke_id) {
            const btnrow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setStyle("PRIMARY")
                        .setCustomId("fast_backward")
                        .setEmoji("⏪"),
                    new MessageButton()
                        .setStyle("PRIMARY")
                        .setCustomId("backward")
                        .setEmoji("◀️"),
                    new MessageButton()
                        .setStyle("PRIMARY")
                        .setCustomId("forward")
                        .setEmoji("▶️"),
                    new MessageButton()
                        .setStyle("PRIMARY")
                        .setCustomId("fast_forward")
                        .setEmoji("⏩"),
                    new MessageButton()
                        .setStyle("SUCCESS")
                        .setDisabled(true)
                        .setLabel("Filter Pokemons")
                        .setCustomId("filter_poke")
                )
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('sort_poke_decrease')
                        .setPlaceholder('Sort Pokemons In Decreasing Order.')
                        .setMinValues(1)
                        .setMaxValues(6)
                        .addOptions([
                            {
                                label: 'Filter By Speed',
                                description: 'Sort Pokemons By Speed.',
                                value: 'sort_speed',
                                emoji: "<:custom_arrow_down:1029731655683936276>"
                            },
                            {
                                label: 'Filter By HP',
                                description: 'Sort Pokemons By HP.',
                                value: 'sort_hp',
                                emoji: "<:custom_arrow_down:1029731655683936276>"
                            },
                            {
                                label: "Filter By Defence",
                                emoji: "<:custom_arrow_down:1029731655683936276>",
                                value: "sort_def",
                                description: "Sort Pokemons By Defence"
                            },
                            {
                                label: "Filter By Attack",
                                emoji: "<:custom_arrow_down:1029731655683936276>",
                                value: "sort_atk",
                                description: "Sort Pokemons By Attack."
                            },
                            {
                                label: "Filter By Sp. Atk",
                                emoji: "<:custom_arrow_down:1029731655683936276>",
                                value: "sort_spatk",
                                description: "Sort Pokemons By Sp. Atk"
                            },
                            {
                                label: "Filter By Sp. Def",
                                emoji: "<:custom_arrow_down:1029731655683936276>",
                                value: "sort_spdef",
                                description: "Sort Pokemons By Sp. Def"
                            }
                        ])
                );
                const second_row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('sort_poke_increase')
                        .setPlaceholder('Sort Pokemons In Increasing Order.')
                        .setMinValues(1)
                        .setMaxValues(6)
                        .addOptions([
                            {
                                label: 'Filter By Speed',
                                description: 'Sort Pokemons By Speed.',
                                value: 'sort_speed',
                                emoji: "<:custom_arrow_up:1029731489333641276>"
                            },
                            {
                                label: 'Filter By HP',
                                description: 'Sort Pokemons By HP.',
                                value: 'sort_hp',
                                emoji: "<:custom_arrow_up:1029731489333641276>"
                            },
                            {
                                label: "Filter By Defence",
                                emoji: "<:custom_arrow_up:1029731489333641276>",
                                value: "sort_def",
                                description: "Sort Pokemons By Defence"
                            },
                            {
                                label: "Filter By Attack",
                                emoji: "<:custom_arrow_up:1029731489333641276>",
                                value: "sort_atk",
                                description: "Sort Pokemons By Attack."
                            },
                            {
                                label: "Filter By Sp. Atk",
                                emoji: "<:custom_arrow_up:1029731489333641276>",
                                value: "sort_spatk",
                                description: "Sort Pokemons By Sp. Atk"
                            },
                            {
                                label: "Filter By Sp. Def",
                                emoji: "<:custom_arrow_up:1029731489333641276>",
                                value: "sort_spdef",
                                description: "Sort Pokemons By Sp. Def"
                            }
                        ])
            );
            await interaction.reply({ content: `Success!`, ephemeral: true })
            let page = 1;
            let poke = user.pokemons1
            let pokemons = chunk(poke, 15)
            let pages;
            if(poke.length <= 0) {
                pages = []
            } else {
                pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
            }
            let embed = new MessageEmbed()
            .setColor(color)
            .setDescription(`You Can Filter Your Pokemons By Choosing The Select Menues.`)
            .setTitle(`Your Pokemons - Pokemon Center`)
            .setTimestamp()
            .setFooter(`Requested By: ${interaction.user.tag}`)
            .addField(`Your Pokemons`, `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`)
            let msg = await interaction.channel.send({
                embeds: [embed],
                components: [_components]
            })
            const filter = i => {
                if(i.user.id == interaction.user.id) return true;
                else return i.reply({ content: `You Don't Have Permission To Interact With This Button/Menu.`})
            }
            const collector = msg.createMessageComponentCollector({
                filter,
                time: 30000
            })
            collector.on("collect", async (click) => {
                collector.resetTimer()
                if(!click.isButton()) { // checking if collected is a button or not.
                    if(click.customId == "sort_poke_increase") {
                        click.deferUpdate()
                        let filters = click.values;
                        let done_check = 0;
                        filters.forEach(value => {
                            if(value == "sort_speed") {
                                poke = poke.sort((x, y) => y.speed - x.speed)
                                done_check = done_check + 1
                            }
                            if(value == "sort_hp") {
                                poke = poke.sort((x, y) => y.hp - x.hp)
                                done_check = done_check + 1
                            }
                            if(value == "sort_def") {
                                poke = poke.sort((x, y) => y.def - x.def)
                                done_check = done_check + 1
                            }
                            if(value == "sort_atk") {
                                poke = poke.sort((x, y) => y.atk - x.atk)
                                done_check = done_check + 1
                            }
                            if(value == "sort_spdef") {
                                poke = poke.sort((x, y) => y.spdef - x.spdef)
                                done_check = done_check + 1
                            }
                            if(value == "sort_spatk") {
                                poke = poke.sort((x, y) => y.spatk - x.spatk)
                                done_check = done_check + 1
                            }
                        })
                        pokemons = chunk(poke, 15)
                        let components = [btnrow, row, second_row]
                        if(poke.length <= 15) components = [row, second_row];

                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ components: components, embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    } else {
                        click.deferUpdate()
                        let filters = click.values;
                        let done_check = 0;
                        filters.forEach(value => {
                            if(value == "sort_speed") {
                                poke = poke.sort((x, y) => x.speed - y.speed)
                                done_check = done_check + 1
                            }
                            if(value == "sort_hp") {
                                poke = poke.sort((x, y) => x.hp - y.hp)
                                done_check = done_check + 1
                            }
                            if(value == "sort_def") {
                                poke = poke.sort((x, y) => x.def - y.def)
                                done_check = done_check + 1
                            }
                            if(value == "sort_atk") {
                                poke = poke.sort((x, y) => x.atk - y.atk)
                                done_check = done_check + 1
                            }
                            if(value == "sort_spdef") {
                                poke = poke.sort((x, y) => x.spdef - y.spdef)
                                done_check = done_check + 1
                            }
                            if(value == "sort_spatk") {
                                poke = poke.sort((x, y) => x.spatk - y.spatk)
                                done_check = done_check + 1
                            }
                        })
                        pokemons = chunk(poke, 15)
                        let components = [btnrow, row, second_row]
                        if(poke.length <= 15) components = [row, second_row];
                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ components: components, embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    }
                } else {
                    click.deferUpdate()
                    if(click.customId == "forward") {
                        page++;
                        if(page > pages.length) page = 1;
                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    } else if(click.customId == "backward") {
                        page--;
                        if(page < 1) page = pages.length;
                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    } else if(click.customId == "fast_forward") {
                        page = pages.length;
                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    } else if(click.customId == "fast_backward") {
                        page = 1;
                        pages = pokemons[page - 1].map(r => `**\`#${user.pokemons.indexOf(r) + 1}\` | __${r.shiny == true ? "✨ " : ""}${r.name}${r.nick ? `(${r.nick})` : ""}__ | ${r.totalIV}% | Level: ${r.level}**`).join("\n")
                        await click.message.edit({ embeds: embed.setFields({ name: "Your Pokemons", value: `${user.pokemons1.length > 0 ? `${pages}` : `You Don't Have Any Pokemons in The Center.`}`}) })
                    }
                }
            })
        }
    }
}
function chunk(array, chunkSize) {
    const temp = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      temp.push(array.slice(i, i + chunkSize));
    }
    return temp;
}