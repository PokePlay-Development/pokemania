const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageAttachment
} = require("discord.js")
const Canvas = require("canvas")
const fs = require("node:fs")
const fetch = require("node-fetch")
const User = require("../../models/user.js");
const Pokemon = require("../../classes/pokemon2.js");
const { instanceToPlain } = require("class-transformer");
const common = fs.readFileSync(`${process.cwd()}/db/common.txt`).toString().trim().split("\n").map(r => r.trim());
const mix = fs.readFileSync(`${process.cwd()}/db/mix.txt`).toString().trim().split("\n").map(r => r.trim());
const alolan = fs.readFileSync(`${process.cwd()}/db/alola.txt`).toString().trim().split(`\n`).map(r => r.trim());
const mythic = fs.readFileSync(`${process.cwd()}/db/mythics.txt`).toString().trim().split(`\n`).map(r => r.trim());
const legend = fs.readFileSync(`${process.cwd()}/db/legends.txt`).toString().trim().split(`\n`).map(r => r.trim());
const event = common;
const levelup = require(`${process.cwd()}/db/levelup.js`)
const ub = fs.readFileSync(`${process.cwd()}/db/ub.txt`).toString().trim().split(`\n`).map(r => r.trim());
const galarian = fs.readFileSync(`${process.cwd()}/db/galar.txt`).toString().trim().split(`\n`).map(r => r.trim());
module.exports = {
    name: "ai",
    description: "Battle With The Artificial Inteligence!",
    options: [
        {
            "StringChoices": {
                name: "difficulty", description: "easy, medium or hard. which one's suits you trainer?", required: true, choices: [
                    ["easy", "easy"],
                    ["medium", "medium"],
                    ["hard", "hard"]
                ]
            }
        }
    ],
    run: async (client, interaction, color) => {
        const { options } = interaction;
        let user = await User.findOne({ id: interaction.user.id })
        if (!user) {
            return interaction.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter.` })
        }
        let difficulty = options.getString("difficulty")
        let name = ""
        let level = 1;
        let hp;
        let def;
        let spdef;
        let atk;
        let spatk;
        let speed;
        if (difficulty == "easy") {
            let random_name = common[Math.floor(Math.random() * common.length)];
            random_name = random_name.toLowerCase().replace(/ /g, "-")
            name = random_name;
            level = getRandomNumberBetween(10, 20)
            hp = getRandomNumberBetween(5, 15)
            def = getRandomNumberBetween(5, 15)
            spdef = getRandomNumberBetween(5, 15)
            atk = getRandomNumberBetween(5, 15)
            spatk = getRandomNumberBetween(5, 15)
            speed = getRandomNumberBetween(5, 15)
        } else if (difficulty == "medium") {
            let random_name = legend[Math.floor(Math.random() * legend.length)];
            random_name = random_name.toLowerCase().replace(/ /g, "-")
            name = random_name;
            level = getRandomNumberBetween(20, 30)
            hp = getRandomNumberBetween(15, 25)
            def = getRandomNumberBetween(15, 25)
            spdef = getRandomNumberBetween(15, 25)
            atk = getRandomNumberBetween(15, 25)
            spatk = getRandomNumberBetween(15, 25)
            speed = getRandomNumberBetween(15, 25)
        } else if (difficulty = "hard") {
            let random_name = mix[Math.floor(Math.random() * mix.length)];
            random_name = random_name.toLowerCase().replace(/ /g, "-");
            name = random_name;
            level = getRandomNumberBetween(30, 51)
            hp = getRandomNumberBetween(25, 31)
            def = getRandomNumberBetween(25, 31)
            spdef = getRandomNumberBetween(25, 31)
            atk = getRandomNumberBetween(25, 31)
            spatk = getRandomNumberBetween(25, 31)
            speed = getRandomNumberBetween(25, 31)
        }
        let selected = user.selected[0]
        if (!selected) return interaction.reply(`You Have Not Selected Any Pokemon Yet.`)
        let pokemon = user.pokemons
        let poke = user.pokemons.find(r => {
            delete r.xp;
            delete user.selected[0].xp;
            delete r.level;
            delete user.selected[0].level;
            return JSON.stringify(r) === JSON.stringify(user.selected[0])
        })
        let index = user.pokemons.indexOf(poke)
        user = await User.findOne({ id: interaction.user.id })
        pokemon = user.pokemons[index] // the player's pokemon
        //console.log(name)
        if (!pokemon) return interaction.reply(`You Have Not Selected Any Pokemon Yet.`)
        await interaction.reply({ content: `Finding A pokemon For You To Battle...`, ephemeral: true })
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).catch(e => { interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`); return console.log(String(e.stack)) })
            .then(res => res.json()).catch(e => { interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!\n${e}`); return console.log(String(e.stack)) })
            .then(async data => {
                if (client.battles.find(r => r.id == interaction.user.id)) {
                    return interaction.editReply(`You Are Already In A Battle!`)
                } else {
                    client.battles.push({ id: interaction.user.id, id2: client.user.id, type: "ai" })
                }
                let _pokemon = new Pokemon({ name: data.name, level: level, hp: hp, def: def, atk: atk, spdef: spdef, spatk: spatk, speed: speed })
                _pokemon = instanceToPlain(_pokemon) // AI's Op Pokemon.
                //console.log(_pokemon)
                await interaction.editReply(`:white_check_mark: Successfully Found The Pokemon, And The Pokemon Is: **__${_pokemon.name}__**`)
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
                    .then(res => res.json())
                    .then(async _data => {
                        let opponent_moves = await data.moves.filter(async r => {
                            if (r.version_group_details[0].move_learn_method.name == "level-up") return r;
                        }).filter(async r => {
                            if (r.version_group_details[0].level_learned_at <= _pokemon.level) {
                                return r;
                            }
                        }).map(r => r.move.name)
                        let my_moves = pokemon.moves;
                        if (my_moves.length < 1) return interaction.followUp(`You Have Not Selected Any Moves.`)
                        // getting ai's stats.
                        //console.log(data.stats)
                        let hpBase = data.stats[0].base_stat;
                        let atkBase = data.stats[1].base_stat;
                        let defBase = data.stats[2].base_stat;
                        let spatkBase = data.stats[3].base_stat;
                        let spdefBase = data.stats[4].base_stat;
                        let speedBase = data.stats[5].base_stat;
                        let hpTotal = Math.floor(Math.floor((2 * hpBase + _pokemon.hp + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
                        let atkTotal = Math.floor(Math.floor((2 * atkBase + _pokemon.atk + 0) * _pokemon.level / 100 + 5) * 0.9);
                        let defTotal = Math.floor(Math.floor((2 * defBase + _pokemon.def + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
                        let spatkTotal = Math.floor(Math.floor((2 * spatkBase + _pokemon.spatk + (0 / 4)) * _pokemon.level / 100 + 5) * 1.1);
                        let spdefTotal = Math.floor(Math.floor((2 * spdefBase + _pokemon.spdef + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
                        let speedTotal = Math.floor(Math.floor((2 * speedBase + _pokemon.speed + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
                        // getting the player's stats
                        //console.log(_data)
                        let _hpBase = _data.stats[0].base_stat;
                        let _atkBase = _data.stats[1].base_stat;
                        let _defBase = _data.stats[2].base_stat;
                        let _spatkBase = _data.stats[3].base_stat;
                        let _spdefBase = _data.stats[4].base_stat;
                        let _speedBase = _data.stats[5].base_stat;
                        let _hpTotal = Math.floor(Math.floor((2 * _hpBase + pokemon.hp + (0 / 4)) * pokemon.level / 100 + 5) * 1);
                        let _atkTotal = Math.floor(Math.floor((2 * _atkBase + pokemon.atk + 0) * pokemon.level / 100 + 5) * 0.9);
                        let _defTotal = Math.floor(Math.floor((2 * _defBase + pokemon.def + (0 / 4)) * pokemon.level / 100 + 5) * 1);
                        let _spatkTotal = Math.floor(Math.floor((2 * _spatkBase + pokemon.spatk + (0 / 4)) * pokemon.level / 100 + 5) * 1.1);
                        let _spdefTotal = Math.floor(Math.floor((2 * _spdefBase + pokemon.spdef + (0 / 4)) * pokemon.level / 100 + 5) * 1);
                        let _speedTotal = Math.floor(Math.floor((2 * _speedBase + pokemon.speed + (0 / 4)) * pokemon.level / 100 + 5) * 1);

                        const canvas = Canvas.createCanvas(1920, 920);
                        const context = canvas.getContext('2d');
                        const bg = await Canvas.loadImage("https://i.imgur.com/z4fpgV3.png")
                        context.drawImage(bg, 0, 0, canvas.width, canvas.height)
                        const player1 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${_data.id}.png`).catch(async (e) => {
                            await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${_data.id}.png`)
                        })
                        context.drawImage(player1, 50, 500, 700, 700)
                        const player2 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${data.id}.png`)
                        context.drawImage(player2, 1050, 10, 700, 700)
                        const attachment = new MessageAttachment(canvas.toBuffer(), `battle.png`)
                        let hp1 = _hpTotal;
                        let hp2 = hpTotal;
                        async function battle_ai() {
                            if(!client.battles.find(r => r.id == interaction.user.id)) return;
                            let msg = await interaction.channel.send({
                                embeds: [new MessageEmbed()
                                    .setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
                                    .setDescription(`Click On The Below Button To Choose Your Moves.`)
                                    .addFields(
                                        { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                        { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                    )
                                    .setImage(`attachment://battle.png`)
                                    .setColor(color)],
                                files: [attachment]
                            })
                            let row = new MessageActionRow()
                            my_moves.forEach(async move => {
                                row.addComponents([new MessageButton().setStyle("SUCCESS").setCustomId(move).setLabel(String(move))])
                            })
                            let _row = new MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                        .setStyle("DANGER")
                                        .setLabel("Flee")
                                        .setCustomId("flee")
                                        .setEmoji("🚫"),
                                    new MessageButton()
                                        .setStyle("SECONDARY")
                                        .setLabel("Pass Turn")
                                        .setCustomId("pass")
                                        .setEmoji("🤝")
                                ])
                            let _msg = await interaction.user.send({
                                embeds: [new MessageEmbed()
                                    .setTitle(`Choose Your Moves`)
                                    .addFields({ name: `Having Trouble?`, value: `Consider Joining Our Support [\`Server\`](https://discord.gg/D8Sp38rSfh)!` })
                                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`Click on The Below Buttons To Choose Your Moves.`)
                                    .setImage(`attachment://battle.png`)
                                    .setColor(color)
                                ],
                                files: [attachment],
                                components: [row, _row]
                            }).catch(async e => { await interaction.channel.send(`Unable To Send Message To The User ${interaction.user.tag}, Are Ther DMs Open?\n${e}`) })
                            const collector = _msg.createMessageComponentCollector({
                                max: 1,
                                time: 30000
                            })
                            collector.on("end", async collected => {
                                if(collected.size == 0) {
                                    await interaction.channel.send({
                                        embeds: [new MessageEmbed()
                                        .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                        .setDescription(`**${interaction.user.tag}** Has Been **__Defeated__** By **${client.user.tag}** Since They Did Not Respond!`)
                                        .addFields(
                                            { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                            { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                        )
                                        .setImage(`attachment://battle.png`)
                                        .setColor(color)],
                                        files: [attachment]
                                    })
                                    let client_battle = client.battles.find(battle => battle.id == interaction.user.id && battle.type == "ai")
                                    if(client_battle) {
                                        client.battles.splice(client.battles.indexOf(client_battle), 1)
                                    }
                                }
                            })
                            collector.on("collect", async (click) => {
                                if(!client.battles.find(r => r.id == interaction.user.id)) return;
                                if (click.customId == "flee") {
                                    if(!client.battles.find(r => r.id == interaction.user.id)) return;
                                    await click.reply({
                                        ephemeral: true,
                                        embeds: [new MessageEmbed()
                                            .setTitle(`Successfully Choosed Your Turn!`)
                                            .setColor(color)
                                            .setTimestamp()
                                            .addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
                                            .setDescription(`You Choosed To **Flee** From The Battle!`)]
                                    })
                                    await interaction.channel.send({
                                        files: [attachment],
                                        embeds: [new MessageEmbed()
                                            .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                            .setColor(color)
                                            .setTimestamp()
                                            .addFields(
                                                { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                            )
                                            .setImage(`attachment://battle.png`)
                                            .setDescription(`**${interaction.user.username}** Choosed To Flee From The Battle!\nThe Winner is **${client.user.tag}!**`)]
                                    })
                                    let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                    if (client_battle) {
                                        client.battles.splice(client.battles.indexOf(client_battle), 1)
                                    }
                                } else if (click.customId == "pass") {
                                    if(!client.battles.find(r => r.id == interaction.user.id)) return;
                                    fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
                                        .then(res => res.json())
                                        .then(async mv => { // m
                                            await click.reply({
                                                ephemeral: true,
                                                embeds: [new MessageEmbed()
                                                    .setTitle(`Successfully Choosed Your Turn!`)
                                                    .setColor(color)
                                                    .setTimestamp()
                                                    .addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
                                                    .setDescription(`You Choosed To **Pass** Your Turn To The Opponent.`)]
                                            })
                                            let flavour_text = [`${interaction.user.username} Choosed To **Pass** Their Turn!`, `${client.user.username} Choosed The Move \`${mv.name}\``]
                                            let power = mv.power !== null ? mv.power : 0
                                            let attack = atkTotal // ai's attack iv.
                                            if (mv.damage_class == "special") attack = spatkTotal;
                                            let defence = defTotal // player's defence
                                            if (mv.damage_class == "special") defence = _spdefTotal
                                            let accuracy_wheel = getRandomNumberBetween(1, 100)
                                            let dodged = 1;
                                            if (mv.accuracy <= accuracy_wheel) {
                                                dodged = 0.25;
                                            }
                                            let type = 1;
                                            if (data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase())).includes(mv.type.name)) {
                                                type = 1.2;
                                            }
                                            let stab = 1;
                                            if (mv.type.name == data.types[0].type.name) stab = 1.5;
                                            let critical = 1;
                                            if (mv.crit_rate == 1) {
                                                let chance = getRandomNumberBetween(1, 100)
                                                if (chance <= 50) {
                                                    critical = 2;
                                                }
                                            }
                                            let modifier = stab * type * dodged * critical;
                                            aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
                                            if (mv.effect_chance !== null) {
                                                if (mv.effect_chance >= getRandomNumberBetween(1, 100)) {
                                                    flavour_text.push(`${client.user.username}'s Pokemon Inflicted **${mv.meta.ailment.name}**`)
                                                    aidamage += getRandomNumberBetween(1, 20)
                                                }
                                            }
                                            hp1 = hp1 - aidamage;
                                            // checking the survival.
                                            await interaction.channel.send({
                                                embeds: [new MessageEmbed()
                                                    .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                    .setColor(color)
                                                    .setTimestamp()
                                                    .setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**`)]
                                            })
                                            if (hp1 < 1) {
                                                await interaction.channel.send({
                                                    files: [attachment],
                                                    embeds: [new MessageEmbed()
                                                        .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                                        .setColor(color)
                                                        .setTimestamp()
                                                        .addFields(
                                                            { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                            { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                                        )
                                                        .setImage(`attachment://battle.png`)
                                                        .setDescription(`**${interaction.user.username}** Choosed To Pass Their Turn And...\nThe Winner is **${client.user.tag}!**`)]
                                                })
                                                let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                                if (client_battle) {
                                                    client.battles.splice(client.battles.indexOf(client_battle), 1)
                                                }
                                            } else {
                                                battle_ai();
                                            }
                                        })
                                } else { // here comes the final part, when a specific move is choosen.
                                    fetch(`https://pokeapi.co/api/v2/move/${click.customId}`)
                                        .then(res => res.json())
                                        .then(async mav => {
                                            fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
                                                .then(res => res.json())
                                                .then(async mv => {
                                                    await click.reply({
                                                        ephemeral: true,
                                                        embeds: [new MessageEmbed()
                                                            .setTitle(`Successfully Choosed Your Turn!`)
                                                            .setColor(color)
                                                            .setTimestamp()
                                                            .addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
                                                            .setDescription(`You Choosed The Move \`${click.customId}\``)]
                                                    })
                                                    let flavour_text = [`${interaction.user.username} Choosed The Move \`${click.customId}\``, `${client.user.username} Choosed The Move \`${mv.name}\``]
                                                    let power = mv.power !== null ? mv.power : 0
                                                    let attack = atkTotal // ai's attack iv.
                                                    if (mv.damage_class == "special") attack = spatkTotal;
                                                    let defence = _defTotal // player's defence
                                                    if (mv.damage_class == "special") defence = _spdefTotal
                                                    let stab = 1
                                                    let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
                                                    if (pokemon_type.includes(mv.type.name)) {
                                                        stab = 1.2;
                                                    }
                                                    let accuracy_wheel = getRandomNumberBetween(1, 100)
                                                    let dodged = 1;
                                                    if (mv.accuracy <= accuracy_wheel) {
                                                        dodged = 0.25;
                                                        flavour_text[1] = `${client.user.username} choosed the move \`${mv.name}\` but it missed!`
                                                    }
                                                    let type = 1;
                                                    if (data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase())).includes(mv.type.name)) {
                                                        type = 1.2;
                                                    }
                                                    let heal = mv.healing
                                                    let critical = 1;
                                                    if (mv.crit_rate == 1) {
                                                        let chance = getRandomNumberBetween(1, 100)
                                                        if (chance < 50) {
                                                            critical = 2;
                                                        }
                                                    }
                                                    let modifier = stab * type * dodged * critical;
                                                    aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
                                                    if (mv.effect_chance !== null && mv.meta.ailment.name !== "none") {
                                                        if (mv.effect_chance >= getRandomNumberBetween(1, 100)) {
                                                            flavour_text.push(`${client.user.username}'s Pokemon Inflicted **${mv.meta.ailment.name}**`)
                                                            aidamage += getRandomNumberBetween(1, 20)
                                                        }
                                                    }
                                                    let _power = mav.power !== null ? mav.power : 0;
                                                    let _attack = _atkTotal;
                                                    if (mav.damage_class == "special") _attack = _spatkTotal;
                                                    let _defence = defTotal;
                                                    if (mav.damage_class == "special") _defence = spdefTotal;
                                                    let _stab = 1;
                                                    let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
                                                    if (_pokemon_type.includes(mav.type.name)) {
                                                        _stab = 1.2;
                                                    }
                                                    let _accuracy_wheel = getRandomNumberBetween(1, 100)
                                                    let _dodged = 1;
                                                    if (mav.accuracy <= _accuracy_wheel) {
                                                        _dodged = 0.25;
                                                        flavour_text[0] = `${interaction.user.username} choosed the move \`${click.customId}\` but it missed!`
                                                    }
                                                    let _type = 1;
                                                    if (_data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase())).includes(mav.type.name)) {
                                                        _type = 1.2;
                                                    }
                                                    let _critical = 1;
                                                    if (mav.crit_rate == 1) {
                                                        let chance = getRandomNumberBetween(1, 100)
                                                        if (chance <= 7) {
                                                            _critical = 2;
                                                        }
                                                    }
                                                    let _modifier = _stab * _dodged * _type * _critical;
                                                    damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the player's damage.
                                                    if (mav.effect_chance !== null && mav.meta.ailment.name !== "none") {
                                                        if (mav.effect_chance >= getRandomNumberBetween(1, 100)) {
                                                            flavour_text.push(`${interaction.user.username}'s Pokemon Inflicted **${mav.meta.ailment.name}**`)
                                                            damage += getRandomNumberBetween(1, 20) // add the damage.
                                                        }
                                                    }
                                                    if (speedTotal <= _speedTotal) { // ai's first move...
                                                        let flinch = getRandomNumberBetween(1, 100)
                                                        if (mav.flinch_chance !== null || mav.flinch_chance !== 0) {
                                                            if (mav.flinch_chance >= flinch) {
                                                                flavour_text.push(`${client.user.username}'s Pokemon Flinched!`)
                                                            } else {
                                                                hp1 = hp1 - aidamage
                                                                let _heal = mv.healing;
                                                                if (_heal !== null && _heal > 0) {
                                                                    hp2 = hp2 + _heal;
                                                                    flavour_text.push(`${client.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                }
                                                            }
                                                        } else {
                                                            hp1 = hp1 - aidamage
                                                            let _heal = mv.healing;
                                                            if (_heal !== null && _heal > 0) {
                                                                hp2 = hp2 + _heal;
                                                                flavour_text.push(`${client.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                            }
                                                        }
                                                        if (hp1 < 1) {
                                                            await interaction.channel.send({
                                                                embeds: [new MessageEmbed()
                                                                    .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                    .setColor(color)
                                                                    .setTimestamp()
                                                                    .setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
                                                            })
                                                            await interaction.channel.send({
                                                                files: [attachment],
                                                                embeds: [new MessageEmbed()
                                                                    .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                                                    .setColor(color)
                                                                    .setTimestamp()
                                                                    .addFields(
                                                                        { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                                        { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                                                    )
                                                                    .setImage(`attachment://battle.png`)
                                                                    .setDescription(`The Winner is **${client.user.tag}!**`)]
                                                            })
                                                            let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                                            if (client_battle) {
                                                                client.battles.splice(client.battles.indexOf(client_battle), 1)
                                                            }
                                                        } else { // player survived, now it's player's turn
                                                            let flinch = getRandomNumberBetween(1, 100)
                                                            if (mv.flinch_chance !== null || mv.flinch_chance !== 0) {
                                                                if (mv.flinch_chance >= flinch) {
                                                                    flavour_text.push(`${interaction.user.username}'s Pokemon Flinched!`)
                                                                } else {
                                                                    hp2 = hp2 - damage
                                                                    let _heal = mav.healing;
                                                                    if (_heal !== null && _heal > 0) {
                                                                        hp1 = hp1 + _heal;
                                                                        flavour_text.push(`${interaction.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                    }
                                                                }
                                                            } else {
                                                                hp2 = hp2 - damage
                                                                let _heal = mav.healing;
                                                                if (_heal !== null && _heal > 0) {
                                                                    hp1 = hp1 + _heal;
                                                                    flavour_text.push(`${interaction.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                }
                                                            }
                                                            if (hp2 < 1) {
                                                                await interaction.channel.send({
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
                                                                })
                                                                await interaction.channel.send({
                                                                    files: [attachment],
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .addFields(
                                                                            { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                                            { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                                                        )
                                                                        .setImage(`attachment://battle.png`)
                                                                        .setDescription(`The Winner is **${interaction.user.tag}!**`)]
                                                                })
                                                                let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                                                if (client_battle) {
                                                                    client.battles.splice(client.battles.indexOf(client_battle), 1)
                                                                }
                                                                let amt = 50
                                                                if (difficulty == "easy") {
                                                                    amt = 50;
                                                                } else if (difficulty == "medium") {
                                                                    amt = 100;
                                                                } else if (difficulty == "hard") {
                                                                    amt = 350;
                                                                    if(user.q4 !== true) {
                                                                        user.q2 = true;
                                                                        user.credits += 4000;
                                                                        await interaction.channel.send(`**${interaction.user.username}** has completed the **__Hard__** difficulty of the **__AI Battle__** and has been rewarded with **4000** credits!`)
                                                                    }
                                                                }
                                                                user.credits += amt;
                                                                await user.save()
                                                                await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!**`)
                                                            } else { // both survived, send info and redo the battle function
                                                                await interaction.channel.send({
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
                                                                })
                                                                await battle_ai();
                                                            }
                                                        }
                                                    } else { // player's first move!
                                                        //hp2 = hp2 - damage;
                                                        let flinch = getRandomNumberBetween(1, 100)
                                                        if (mv.flinch_chance !== null || mv.flinch_chance !== 0) {
                                                            if (mv.flinch_chance >= flinch) {
                                                                flavour_text.push(`${interaction.user.username}'s Pokemon Flinched!`)
                                                            } else {
                                                                hp2 = hp2 - damage
                                                                let _heal = mav.healing;
                                                                if (_heal !== null && _heal > 0) {
                                                                    hp1 = hp1 + _heal;
                                                                    flavour_text.push(`${interaction.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                }
                                                            }
                                                        } else {
                                                            hp2 = hp2 - damage
                                                            let _heal = mav.healing;
                                                            if (_heal !== null && _heal > 0) {
                                                                hp1 = hp1 + _heal;
                                                                flavour_text.push(`${interaction.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                            }
                                                        }
                                                        if (hp2 < 1) {
                                                            await interaction.channel.send({
                                                                embeds: [new MessageEmbed()
                                                                    .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                    .setColor(color)
                                                                    .setTimestamp()
                                                                    .setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
                                                            })
                                                            await interaction.channel.send({
                                                                files: [attachment],
                                                                embeds: [new MessageEmbed()
                                                                    .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                                                    .setColor(color)
                                                                    .setTimestamp()
                                                                    .addFields(
                                                                        { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                                        { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                                                    )
                                                                    .setImage(`attachment://battle.png`)
                                                                    .setDescription(`The Winner is **${interaction.user.tag}!**`)]
                                                            })
                                                            let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                                            if (client_battle) {
                                                                client.battles.splice(client.battles.indexOf(client_battle), 1)
                                                            }
                                                            let amt = 100
                                                            if (difficulty == "easy") {
                                                                amt = 50;
                                                            } else if (difficulty == "medium") {
                                                                amt = 100;
                                                            } else if (difficulty == "hard") {
                                                                amt = 350;
                                                                if(user.q4 !== true) {
                                                                    user.q2 = true;
                                                                    user.credits += 4000;
                                                                    await interaction.channel.send(`**${interaction.user.username}** has completed the **__Hard__** difficulty of the **__AI Battle__** and has been rewarded with **4000** credits!`)
                                                                } // we don't have it lol. you have to make the message command stuff. have fun :) find me in start.js command file.
                                                            }
                                                            user.credits += amt;
                                                            await user.save()
                                                            await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!**`)
                                                        } else { // if the ai survived...
                                                            let flinch = getRandomNumberBetween(1, 100)
                                                            if (mav.flinch_chance !== null || mav.flinch_chance !== 0) {
                                                                if (mav.flinch_chance >= flinch) {
                                                                    flavour_text.push(`${client.user.username}'s Pokemon Flinched!`)
                                                                } else {
                                                                    hp1 = hp1 - aidamage
                                                                    let _heal = mv.healing;
                                                                    if (_heal !== null && _heal > 0) {
                                                                        hp2 = hp2 + _heal;
                                                                        flavour_text.push(`${client.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                    }
                                                                }
                                                            } else {
                                                                hp1 = hp1 - aidamage
                                                                let _heal = mv.healing;
                                                                if (_heal !== null && _heal > 0) {
                                                                    hp2 = hp2 + _heal;
                                                                    flavour_text.push(`${client.user.username}'s Pokemon Healed **${_heal}** HP`)
                                                                }
                                                            }
                                                            if (hp1 < 1) {
                                                                await interaction.channel.send({
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
                                                                })
                                                                await interaction.channel.send({
                                                                    files: [attachment],
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .addFields(
                                                                            { name: `${interaction.user.username}'s side`, value: `\`${hp1 > 1 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
                                                                            { name: `${client.user.username}'s side`, value: `\`${hp2 > 1 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
                                                                        )
                                                                        .setImage(`attachment://battle.png`)
                                                                        .setDescription(`The Winner is **${client.user.tag}!**`)]
                                                                })
                                                                let client_battle = client.battles.find(r => r.id == interaction.user.id && r.type == "ai")
                                                                if (client_battle) {
                                                                    client.battles.splice(client.battles.indexOf(client_battle), 1)
                                                                }
                                                            } else { // if both survived then...
                                                                await interaction.channel.send({
                                                                    embeds: [new MessageEmbed()
                                                                        .setTitle(`🛡️ **__Battle Information.__** 🛡️`)
                                                                        .setColor(color)
                                                                        .setTimestamp()
                                                                        .setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
                                                                })
                                                                await battle_ai();
                                                            }
                                                        }
                                                    }
                                                })
                                        })
                                }
                            })
                        }
                        if(!client.battles.find(r => r.id == interaction.user.id)) return;
                        battle_ai();
                    })
            }).catch(e => { interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!\n${e}`); return console.log(String(e.stack)) })
    }
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}