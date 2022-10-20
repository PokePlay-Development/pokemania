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
        let user = await User.findOne({ id: interaction.user.id })
        if (!user) {
            return interaction.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter.` })
        }
        let difficulty = interaction.options.getString("difficulty")
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
            level = getRandomNumberBetween(1, 20)
            hp = getRandomNumberBetween(1, 11)
            def = getRandomNumberBetween(1, 11)
            spdef = getRandomNumberBetween(1, 11)
            atk = getRandomNumberBetween(1, 11)
            spatk = getRandomNumberBetween(1, 11)
            spdef = getRandomNumberBetween(1, 11)
            speed = getRandomNumberBetween(1, 11)
        }
        if (difficulty == "medium") {
            let random_name = legend[Math.floor(Math.random() * legend.length)];
            random_name = random_name.toLowerCase().replace(/ /g, "-")
            name = random_name;
            level = getRandomNumberBetween(20, 50)
            hp = getRandomNumberBetween(11, 21)
            def = getRandomNumberBetween(11, 21)
            spdef = getRandomNumberBetween(11, 21)
            atk = getRandomNumberBetween(11, 21)
            spatk = getRandomNumberBetween(11, 21)
            spdef = getRandomNumberBetween(11, 21)
            speed = getRandomNumberBetween(11, 21)
        }
        if (difficulty = "hard") {
            let chance = getRandomNumberBetween(1, 100)
            if (chance > 50) {
                let random_name = legend[Math.floor(Math.random() * legend.length)];
                random_name = random_name.toLowerCase().replace(/ /g, "-")
                name = random_name;
            } else {
                let random_name = mythic[Math.floor(Math.random() * mythic.length)];
                random_name = random_name.toLowerCase().replace(/ /g, "-")
                name = random_name;
            }
            level = getRandomNumberBetween(50, 100)
            hp = getRandomNumberBetween(21, 31)
            def = getRandomNumberBetween(21, 31)
            spdef = getRandomNumberBetween(21, 31)
            atk = getRandomNumberBetween(21, 31)
            spatk = getRandomNumberBetween(21, 31)
            spdef = getRandomNumberBetween(21, 31)
            speed = getRandomNumberBetween(21, 31)
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
        await interaction.reply({ content: `Finding A pokemon For You To Battle...`, ephemeral: true })
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).catch(e => { return interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`) })
            .then(res => res.json()).catch(e => { return interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`) })
            .then(async data => {
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
                            collector.on("collect", async (click) => {
                                if (click.customId == "flee") {
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
                                } else if (click.customId == "pass") {
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
                                            let stab = 1
                                            let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
                                            if (pokemon_type.includes(mv.type.name)) {
                                                stab = 1.2;
                                            }
                                            let accuracy_wheel = getRandomNumberBetween(1, 100)
                                            let dodged = 1;
                                            if (mv.accuracy <= accuracy_wheel) {
                                                dodged = 0.25;
                                            }
                                            let modifier = stab * dodged;
                                            aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
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
                                                    if (mav.accuracy <= accuracy_wheel) {
                                                        dodged = 0.25;
                                                    }
                                                    let modifier = stab * dodged;
                                                    aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
                                                    let _power = mav.power !== null ? mav.power : 0;
                                                    let _attack = _atkTotal;
                                                    if (mav.damage_class == "special") _attack = _spatkTotal;
                                                    let _defence = defTotal;
                                                    if (mv.damage_class == "special") _defence = spdefTotal;
                                                    let _stab = 1;
                                                    let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
                                                    if (_pokemon_type.includes(mav.type.name)) {
                                                        _stab = 1.2;
                                                    }
                                                    let _accuracy_wheel = getRandomNumberBetween(1, 100)
                                                    let _dodged = 1;
                                                    if (mv.accuracy <= _accuracy_wheel) {
                                                        _dodged = 0.25;
                                                    }
                                                    let _modifier = _stab * _dodged;
                                                    damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the player's damage.
                                                    if (speedTotal <= _speedTotal) { // ai's first move...
                                                        hp1 = hp1 - aidamage
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
                                                        } else { // player survived, now it's player's turn
                                                            hp2 = hp2 - damage;
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
                                                                let amt = 100
                                                                if (difficulty == "easy") {
                                                                    amt = 100;
                                                                } else if (difficulty == "medium") {
                                                                    amt = 500;
                                                                } else if (difficulty == "hard") {
                                                                    amt = 800;
                                                                }
                                                                user.credits += amt;
                                                                await user.save()
                                                                await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
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
                                                        hp2 = hp2 - damage;
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
                                                            let amt = 100
                                                            if (difficulty == "easy") {
                                                                amt = 100;
                                                            } else if (difficulty == "medium") {
                                                                amt = 500;
                                                            } else if (difficulty == "hard") {
                                                                amt = 800;
                                                            }
                                                            user.credits += amt;
                                                            await user.save()
                                                            await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
                                                        } else { // if the ai survived...
                                                            hp1 = hp1 - aidamage;
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
                        battle_ai();
                    })
            }).catch(e => { return interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`) })
    }
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}