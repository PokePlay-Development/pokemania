const {
    MessageEmbed,
    MessageButton,
    MessageSelectMenu,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
const fetch = require("node-fetch")
module.exports = {
    name: "pokemon",
    description: `Get The List of Your Pokémons!`,
    run: async (client, interaction, color, support, guild) => {
        let user = await User.findOne({ id: interaction.user.id });
        if (!user) {
            return interaction.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter!`})
        }
        let pokemons = user.pokemons1;
        if (pokemons.length <= 0) {
            return interaction.reply({ content: `You Have No Pokémons!`})
        }
        let pokemon = await chunk(pokemons, 10);
        let page = 1;
        let index = page - 1;
        let embed = new MessageEmbed()
        .setTitle(`Your Pokémons - At The Center`)
        .setColor(color)
        .setDescription(pokemon[index].map((p, i) => `<:pokeball:1009446798567419965> \`#${i + 1}\` • ${p.name} • Level: ${p.level} • ${p.totalIV}%${p.gender == "male" ? " • <:male:1034399643875938314>" : ""}${p.gender == "female" ? " • <a:female:1034399688872443944>" : ""}${p.gender == "none" ? " • <:genderless:1034399780903845968>" : ""}${p.shiny == true ? ",✨" : ""}`).join("\n"))
        .setFooter({ text: `Page ${page} of ${pokemon.length}` })
        
        let row = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setStyle("SUCCESS")
            .setCustomId("fastback")
            .setEmoji("⏪"),
            new MessageButton()
            .setCustomId("back")
            .setStyle("PRIMARY")
            .setEmoji("◀️"),
            new MessageButton()
            .setStyle("SECONDARY")
	    .setCustomId("home")
            .setEmoji("🏠"),
            new MessageButton()
            .setCustomId("next")
            .setStyle("PRIMARY")
            .setEmoji("▶️"),
            new MessageButton()
            .setStyle("SUCCESS")
            .setCustomId("fastforward")
            .setEmoji("⏩"),
        ])
        let nrow = new MessageActionRow()
        .addComponents([
            new MessageSelectMenu()
            .setCustomId("filters")
            .setPlaceholder("Filter Pokémons")
            .setMinValues(1)
            .setMaxValues(4)
            .addOptions([
                {
                    label: "Filter By Shiny",
                    value: "filter_shiny",
                    description: "Filter Pokémons By Shiny",
                    emoji: "✨"
                },
                {
                    label: "Filter By Name",
                    value: "filter_name",
                    description: "Filter Pokémons By Name",
                    emoji: "📝"
                },
                {
                    label: "Sort By Level",
                    value: "sort_level",
                    description: "Sort Pokémons By Level",
                },
                {
                    label: "Sort By IV",
                    value: "sort_iv",
                    description: "Sort Pokémons By IV",
                }
            ])
        ])
        await interaction.reply({ content: `Success!`, ephemeral: true })
        let msg = await interaction.followUp({ embeds: [embed], components: [row, nrow] })
        const filter = i => {
            if(i.user.id == interaction.user.id) return true;
            else return i.reply({ content: `This Button is Not For You!`, ephemeral: true })
        }
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
        collector.on("end", async (collected) => {
            await msg.edit({ components: [] })
        })
        collector.on("collect", async i => {
            i.deferUpdate();
            if (i.customId == "fastback") {
                page = 1;
                index = page - 1;
                embed.setDescription(pokemon[index].map((p, i) => `<:pokeball:1009446798567419965> \`#${i + 1}\` • ${p.name} • Level: ${p.level} • ${p.totalIV}%${p.gender == "male" ? " • <:male:1034399643875938314>" : ""}${p.gender == "female" ? " • <a:female:1034399688872443944>" : ""}${p.gender == "none" ? " • <:genderless:1034399780903845968>" : ""}${p.shiny == true ? ",✨" : ""}`).join("\n"))
                embed.setFooter({ text: `Page ${page} of ${pokemon.length}` })
                await msg.edit({ embeds: [embed] })
            } else if (i.customId == "back") {
                if (page == 1) return i.reply({ content: `You Are Already On The First Page!`, ephemeral: true })
                page--;
                if(page > 1) page = pokemon.length;
                index = page - 1;
                embed.setDescription(pokemon[index].map((p, i) => `<:pokeball:1009446798567419965> \`#${i + 1}\` • ${p.name} • Level: ${p.level} • ${p.totalIV}%${p.gender == "male" ? " • <:male:1034399643875938314>" : ""}${p.gender == "female" ? " • <a:female:1034399688872443944>" : ""}${p.gender == "none" ? " • <:genderless:1034399780903845968>" : ""}${p.shiny == true ? ",✨" : ""}`).join("\n"))
                embed.setFooter({ text: `Page ${page} of ${pokemon.length}` })
                await msg.edit({ embeds: [embed] })
            } else if (i.customId == "home") {
                await msg.edit({ components: [] })
                return collector.stop();
            } else if (i.customId == "next") {
                page++;
                if(page > pokemon.length) page = 1;
                index = page - 1;
                embed.setDescription(pokemon[index].map((p, i) => `<:pokeball:1009446798567419965> \`#${i + 1}\` • ${p.name} • Level: ${p.level} • ${p.totalIV}%${p.gender == "male" ? " • <:male:1034399643875938314>" : ""}${p.gender == "female" ? " • <a:female:1034399688872443944>" : ""}${p.gender == "none" ? " • <:genderless:1034399780903845968>" : ""}${p.shiny == true ? ",✨" : ""}`).join("\n"))
                embed.setFooter({ text: `Page ${page} of ${pokemon.length}` })
                await msg.edit({ embeds: [embed] })
            } else if (i.customId == "fastforward") {
                page = pokemon.length;
                index = page - 1;
                embed.setDescription(pokemon[index].map((p, i) => `<:pokeball:1009446798567419965> \`#${i + 1}\` • ${p.name} • Level: ${p.level} • ${p.totalIV}%${p.gender == "male" ? " • <:male:1034399643875938314>" : ""}${p.gender == "female" ? " • <a:female:1034399688872443944>" : ""}${p.gender == "none" ? " • <:genderless:1034399780903845968>" : ""}${p.shiny == true ? ",✨" : ""}`).join("\n"))
                embed.setFooter({ text: `Page ${page} of ${pokemon.length}` })
                await msg.edit({ embeds: [embed] })
            }
        })
    }
}
async function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}