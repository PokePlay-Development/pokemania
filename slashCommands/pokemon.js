const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user.js")
const fetch = require("node-fetch")
module.exports = {
    name: "pokemon",
    description: "Get The List Of Your Pokémons / Get Information About Them!",
    trade: true,
    options: [
        {"StringChoices": { name: "info", description: `Get The Information of Your Pokémon in A Specific Slot.`, required: false, choices: [
            ["slot_1", "slot_1"],
            ["slot_2", "slot_2"],
            ["slot_3", "slot_3"],
            ["slot_4", "slot_4"],
            ["slot_5", "slot_5"],
            ["slot_6", "slot_6"]
        ]}}
    ],
    run: async (client, interaction, color, support, guild) => {
        await interaction.deferReply({ ephemeral: true });
        let er;
        let user = await User.findOne({ id: interaction.user.id });
        const options = interaction.options;
        if(!user) return interaction.reply({ content: `You Have Not Picked Your Starter Pokémon yet!`})
        let slot = options.getString("info")
        if(!slot) {
            let embed = new MessageEmbed()
            .setTitle("Your Pokémon Slots")
            .setTimestamp()
            .setDescription(`These Pokémons Are The Pokémons Which You Carry With Yourself Most of The Time! Only The Pokémons in These 6 Slots Can Be Used For Battles. Rest Are Set to Pokémon Centers.`)
            .setColor(color)
            for(let i = 0;i < 6;i++) {
                let poke = user.pokemons[i];
                if(poke) {
                    embed.addFields({ name: `Slot ${i + 1}`, value: `**${poke.name}, ${poke.totalIV}%**`, inline: true })
                } else {
                    embed.addFields({ name: `Slot ${i + 1}`, value: `Empty Slot.`, inline: true })
                }
            }
            await interaction.editReply({ content: `Success!` })
            return await interaction.followUp({ embeds: [embed] })
        } else {
            if(slot == "slot_1") slot = 1;
            if(slot == "slot_2") slot = 2;
            if(slot == "slot_3") slot = 3;
            if(slot == "slot_4") slot = 4;
            if(slot == "slot_5") slot = 5;
            if(slot == "slot_6") slot = 6;
            let poke = user.pokemons[slot - 1];
            if(!poke) return await interaction.editReply({ content: `No Pokémon Found.` })
            fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`)
            .then(res => res.json())
            .then(async data => {
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${poke.name}`)
                .then(res => res.json())
                .then(async form => {
		    let required_xp = Math.floor(((data.base_experience * (poke.level - 1)) / 10) + data.base_experience);
                    if(isNaN(required_xp)) required_xp = 1;
                    let gender = poke.gender;
                    if(gender == "none") gender = "<:genderless:1026774283273383987>";
                    if(gender == "male") gender = "<:male:1026774356094881824>";
                    if(gender == "female") gender = "<:female:1026774408670494762>";
                    let level = poke.level,
			        hp = poke.hp,
			        atk = poke.atk,
			        def = poke.def,
			        spatk = poke.spatk,
			        spdef = poke.spdef,
			        speed = poke.speed,
		            xp = poke.xp,
		            url = poke.url,
		            shiny = poke.shiny,
			        nature = poke.nature,
                    egg_group = form.egg_groups.map(r => `${r.name}`);
                    let hpBase = data.stats[0].base_stat;
				    let atkBase = data.stats[1].base_stat;
				    let defBase = data.stats[2].base_stat;
				    let spatkBase = data.stats[3].base_stat;
				    let spdefBase = data.stats[4].base_stat;
				    let speedBase = data.stats[5].base_stat;
                    let hpTotal = Math.floor(Math.floor((2 * hpBase + hp + (0 / 4)) * level / 100 + 5) * 1);
				    let atkTotal = Math.floor(Math.floor((2 * atkBase + atk + 0) * level / 100 + 5) * 0.9);
				    let defTotal = Math.floor(Math.floor((2 * defBase + def + (0 / 4)) * level / 100 + 5) * 1);
				    let spatkTotal = Math.floor(Math.floor((2 * spatkBase + spatk + (0 / 4)) * level / 100 + 5) * 1.1);
				    let spdefTotal = Math.floor(Math.floor((2 * spdefBase + spdef + (0 / 4)) * level / 100 + 5) * 1);
				    let speedTotal = Math.floor(Math.floor((2 * speedBase + speed + (0 / 4)) * level / 100 + 5) * 1);
                    let stats_array = new Array();
                    stats_array.push(`**HP:** \`${hpTotal}\` - **(${hp}/31)**`)
                    stats_array.push(`**Attack:** \`${atkTotal}\` - **(${atk}/31)**`)
                    stats_array.push(`**Defence:** \`${defTotal}\` - **(${def}/31)**`)
                    stats_array.push(`**Sp. Atk:** \`${spatkTotal}\` - **(${spatk}/31)**`)
                    stats_array.push(`**Sp. Def:** \`${spdefTotal}\` - **(${spdef}/31)**`)
                    stats_array.push(`**Speed:** \`${speedTotal}\` - **(${speed}/31)**`)
                    stats_array.push(`**Total IV:** **${poke.totalIV}%**`)
                    let types = new Array();
                    data.types.forEach(type => {
                        let _name = type.type.name;
                        if(_name == "fire") types.push("<:fire_type:1027123355612090419>")
                        if(_name == "water") types.push("<:water_type:1027123415326412870>")
                        if(_name == "normal") types.push("<:normal_type:1027123722454310932>")
                        if(_name == "grass") types.push("<:grass_type:1027123491406872617>")
                        if(_name == "ground") types.push("<:ground_type:1027124114126815262>")
                        if(_name == "flying") types.push("<:flying_type:1027124211459829781>")
                        if(_name == "electric") types.push("<:electric_type:1027123799373664298>")
                        if(_name == "poison") types.push("<:poison_type:1027124002919043112>")
                        if(_name == "ice") types.push("<:ice_type:1027123864326643772>")
                        if(_name == "fighting") types.push("<:fighting_type:1027123932014329927>")
                        if(_name == "psychic") types.push("<:psychic_type:1027124282842689537>")
                        if(_name == "bug") types.push("<:bug_type:1027124337905504267>")
                        if(_name == "rock") types.push("<:rock_type:1027124413998583900>")
                        if(_name == "ghost") types.push("<:ghost_type:1027124475642257408>")
                        if(_name == "dark") types.push("<:dark_type:1027124529698439198>")
                        if(_name == "dragon") types.push("<:dragon_type:1027124583192592384>")
                        if(_name == "steel") types.push("<:Steel_type:1027126327683338280>")
                        if(_name == "fairy") types.push("<:fairy_type:1027124717682970686>")
                    })
                    let embed = new MessageEmbed()
                    .setTitle(`${gender} ${interaction.user.username}'s ___${poke.shiny == true ? "✨" : ""}${data.name}___`)
                    .setColor(color)
                    .setFooter({ text: `Showing Your Pokémon in The Slot #${slot}` })
                    .setTimestamp()
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setImage(url)
                    .setDescription(`**XP:** ${user.pokemons[slot - 1].xp}/${required_xp}\n**__Level:__** \`${level}\`\n**__Nature:__** \`${nature}\`\n**__Egg Group:__** **${egg_group.join(", ")}**\n**__Types:__** ${types.join(", ")}`)
                    .addFields(
                        { name: `___Stats:___`, value: `${stats_array.join("\n")}` },
                        { name: `___Others:___`, value: `**__Held Items:__** **\`${poke.helditem.length > 0 ? `${poke.helditem.join(", ")}` : "\u200B"}\`**\n**__Moves Learnt:__** **\`${poke.moves.length > 0 ? `${poke.moves.join(", ")}*` : "\u200B"}\`**` }
                    )
                    await interaction.editReply({ content: `Success!`})
                    return await interaction.followUp({ embeds: [embed] })
                }).catch(async (e) => {
                    let gender = poke.gender;
                    if(gender == "none") {
                        gender = "<:genderless:1026774283273383987>";
                    } else if(gender == "male") {
                        gender = "<:male:1026774356094881824>";
                    } else if(gender == "female") {
                        gender = "<:female:1026774408670494762>";
                    } else {
                        gender = "<:genderless:1026774283273383987>"
                    }
                    let level = poke.level,
			        hp = poke.hp,
			        atk = poke.atk,
			        def = poke.def,
			        spatk = poke.spatk,
			        spdef = poke.spdef,
			        speed = poke.speed,
		            xp = poke.xp,
		            url = poke.url,
		            shiny = poke.shiny,
			        nature = poke.nature;
                    egg_group = ["no-eggs"]
                    let hpBase = data.stats[0].base_stat;
				    let atkBase = data.stats[1].base_stat;
				    let defBase = data.stats[2].base_stat;
				    let spatkBase = data.stats[3].base_stat;
				    let spdefBase = data.stats[4].base_stat;
				    let speedBase = data.stats[5].base_stat;
                    let hpTotal = Math.floor(Math.floor((2 * hpBase + hp + (0 / 4)) * level / 100 + 5) * 1);
				    let atkTotal = Math.floor(Math.floor((2 * atkBase + atk + 0) * level / 100 + 5) * 0.9);
				    let defTotal = Math.floor(Math.floor((2 * defBase + def + (0 / 4)) * level / 100 + 5) * 1);
				    let spatkTotal = Math.floor(Math.floor((2 * spatkBase + spatk + (0 / 4)) * level / 100 + 5) * 1.1);
				    let spdefTotal = Math.floor(Math.floor((2 * spdefBase + spdef + (0 / 4)) * level / 100 + 5) * 1);
				    let speedTotal = Math.floor(Math.floor((2 * speedBase + speed + (0 / 4)) * level / 100 + 5) * 1);
                    let stats_array = new Array();
                    stats_array.push(`**HP:** \`${hpTotal}\` - **(${hp}/31)**`)
                    stats_array.push(`**Attack:** \`${atkTotal}\` - **(${atk}/31)**`)
                    stats_array.push(`**Defence:** \`${defTotal}\` - **(${def}/31)**`)
                    stats_array.push(`**Sp. Atk:** \`${spatkTotal}\` - **(${spatk}/31)**`)
                    stats_array.push(`**Sp. Def:** \`${spdefTotal}\` - **(${spdef}/31)**`)
                    stats_array.push(`**Speed:** \`${speedTotal}\` - **(${speed}/31)**`)
                    stats_array.push(`**Total IV:** **${poke.totalIV}%**`)
                    let types = new Array();
                    data.types.forEach(type => {
                        let _name = type.type.name;
                        if(_name == "fire") types.push("<:fire_type:1027123355612090419>")
                        if(_name == "water") types.push("<:water_type:1027123415326412870>")
                        if(_name == "normal") types.push("<:normal_type:1027123722454310932>")
                        if(_name == "grass") types.push("<:grass_type:1027123491406872617>")
                        if(_name == "ground") types.push("<:ground_type:1027124114126815262>")
                        if(_name == "flying") types.push("<:flying_type:1027124211459829781>")
                        if(_name == "electric") types.push("<:electric_type:1027123799373664298>")
                        if(_name == "poison") types.push("<:poison_type:1027124002919043112>")
                        if(_name == "ice") types.push("<:ice_type:1027123864326643772>")
                        if(_name == "fighting") types.push("<:fighting_type:1027123932014329927>")
                        if(_name == "psychic") types.push("<:psychic_type:1027124282842689537>")
                        if(_name == "bug") types.push("<:bug_type:1027124337905504267>")
                        if(_name == "rock") types.push("<:rock_type:1027124413998583900>")
                        if(_name == "ghost") types.push("<:ghost_type:1027124475642257408>")
                        if(_name == "dark") types.push("<:dark_type:1027124529698439198>")
                        if(_name == "dragon") types.push("<:dragon_type:1027124583192592384>")
                        if(_name == "steel") types.push("<:Steel_type:1027126327683338280>")
                        if(_name == "fairy") types.push("<:fairy_type:1027124717682970686>")
                    })
                    let embed = new MessageEmbed()
                    .setTitle(`${gender} ${interaction.user.username}'s ___${poke.shiny == true ? "✨" : ""}${data.name}___`)
                    .setColor(color)
                    .setFooter({ text: `Showing Your Pokémon in The Slot #${slot}` })
                    .setTimestamp()
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setImage(url)
                    .setDescription(`**__Level:__** \`${level}\`\n**__Nature:__** \`${nature}\`\n**__Egg Group:__** **${egg_group.join(", ")}**\n**__Types:__** ${types.join(", ")}`)
                    .addFields(
                        { name: `___Stats:___`, value: `${stats_array.join("\n")}` },
                        { name: `___Others:___`, value: `**__Held Items:__** **\`${poke.helditem.length > 0 ? `${poke.helditem.join(", ")}` : "\u200B"}\`**\n**__Moves Learnt:__** **\`${poke.moves.length > 0 ? `${poke.moves.join(", ")}*` : "\u200B"}\`**` }
                    )
                    await interaction.editReply({ content: `Success!`})
                    return await interaction.followUp({ embeds: [embed] })
                })
            })
        }
    }
}