const settings = require("../../settings.json")
const {
    MessageEmbed,
    MessageAttachment,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const fetch = require("node-fetch")
const fs = require("node:fs")
const color = require("../../settings.json").embeds.color
const Spawn = require("../../models/spawn.js")
const Spawner = require("../../models/spawner.js")
const Canvas = require("canvas")
const User = require("../../models/user.js")
const { bgWhite } = require("colors")
const common = fs.readFileSync("./db/common.txt").toString().trim().split("\n").map(r => r.trim());
const alolan = fs.readFileSync("./db/alola.txt").toString().trim().split("\n").map(r => r.trim());
const mythic = fs.readFileSync("./db/mythics.txt").toString().trim().split("\n").map(r => r.trim());
const legend = fs.readFileSync("./db/legends.txt").toString().trim().split("\n").map(r => r.trim());
const event = common;
const levelup = require("../../db/levelup.js")
const ub = fs.readFileSync("./db/ub.txt").toString().trim().split("\n").map(r => r.trim());
const galarian = fs.readFileSync("./db/galar.txt").toString().trim().split("\n").map(r => r.trim());
module.exports = async (client, message) => {
    if (message.author.bot) return;
    let user = await User.findOne({ id: message.author.id })
    if (user) {
        if (user.selected[0]) {
            let new_pokemons = []
            user.pokemons.forEach(item => {
                delete item.xp;
                new_pokemons.push(item)
            })
            let index;
            if (new_pokemons.length == user.pokemons.length) {
                delete user.selected[0].xp
                index = new_pokemons.find(r => JSON.stringify(r) === JSON.stringify(user.selected[0]))
                if (index) {
                    index = new_pokemons.indexOf(index)
                }
            }
            if (index > -1) {
                let pk = user.pokemons[index]
                let _user = await User.findOne({ id: message.author.id })
                _user.pokemons[index].xp += getRandomNumberBetween(1, 30)
                _user.markModified(`pokemons`)
                await _user.save()
                //console.log(_user.pokemons[index].xp)
                fetch(`https://pokeapi.co/api/v2/pokemon/${pk.name}`)
                    .then(res => res.json())
                    .then(async deta => {
                        user = await User.findOne({ id: message.author.id })
                        pk = user.pokemons[index]
                        let pokemon = pk;
                        let level = pokemon.level;
                        let required_xp = Math.floor(((deta.base_experience * (level - 1)) / 10) + deta.base_experience);
                        if (isNaN(required_xp)) required_xp = 1;
                        //console.log("Required Xp", required_xp)
                        let xp = pokemon.xp;
                        if (user.pokemons[index].xp >= required_xp) {
                            let levelr = levelup.find(r => r.name == pokemon.name)
                            if (levelr) {
                                levelr = levelr.levelup
                                if (pokemon.level >= levelr) { // evolved.
                                    fetch(`https://pokeapi.co/api/v2/pokemon/${levelup.find(r => r.name == pokemon.name).evo}`)
                                        .then(res => res.json())
                                        .then(async data => {
                                            let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
                                            let name = data.name;
                                            let poke = user.pokemons[index];
                                            poke.level += 1;
                                            poke.xp = 0;
                                            poke.url = url;
                                            user.pokemons[index] = poke;
                                            //console.log(user)
                                            user.markModified(`pokemons`)
                                            await User.findOneAndUpdate({ id: message.author.id }, user)
                                            //console.log("triggered levelup")
                                            await message.channel.send({
                                                embeds: [new MessageEmbed()
                                                    .setTitle(`Congratulations, **__${client.users.cache.get(user.id).username}!__**`)
                                                    .setColor(color)
                                                    .setThumbnail(url)
                                                    .setDescription(`Your **__${pokemon.name}__** Just Leveled Up To  Level**${pokemon.level}!**\nIt Have Just Evolved Into A **__${data.name}__!**`)]
                                            })
                                        }).catch(e => { return e })
                                } else {
                                    let poke = user.pokemons[index];
                                    poke.level += 1;
                                    poke.xp = 0;
                                    user.pokemons[index] = poke;
                                    //console.log(user)
                                    user.markModified(`pokemons`)
                                    await User.findOneAndUpdate({ id: message.author.id }, user)
                                    //console.log("triggered levelup")
                                    await message.channel.send({
                                        embeds: [new MessageEmbed()
                                            .setTitle(`Congratulations, **__${client.users.cache.get(user.id).username}!__**`)
                                            .setColor(color)
                                            .setDescription(`Your **__${pokemon.name}__** Just Leveled Up To  Level**${pokemon.level}!**`)]
                                    })
                                }
                            } else {
                                let poke = user.pokemons[index];
                                poke.level += 1;
                                poke.xp = 0;
                                user.pokemons[index] = poke;
                                //console.log(user)
                                user.markModified(`pokemons`)
                                await User.findOneAndUpdate({ id: message.author.id }, user)
                                //console.log("triggered levelupv2")
                                await message.channel.send({
                                    embeds: [new MessageEmbed()
                                        .setTitle(`Congratulations, **__${client.users.cache.get(user.id).username}!__**`)
                                        .setColor(color)
                                        .setDescription(`Your **__${pokemon.name}__** Just Leveled Up To  Level**${pokemon.level}!**`)]
                                })
                            }
                        }
                    })
            }
        }
    }
    let spawner = await Spawner.findOne({ id: message.guild.id })
    if (!spawner) await new Spawner({ id: message.guild.id }).save()
    spawner = await Spawner.findOne({ id: message.guild.id })
    if (spawner.count >= 25 && spawner.disabled !== true) {
        spawner.count = 0;
        spawner.total_spawns += 1
        await spawner.save()
        var gen = pickRandom();
        var type = common;
        if (gen == "common") type = common;
        if (gen == "event") type = event;
        if (gen == "alolan") type = alolan;
        if (gen == "mythic") type = mythic;
        if (gen == "legend") type = legend;
        if (gen == "ub") type = ub;
        if (gen == "galarian") type = galarian;
        const random = type[Math.floor(Math.random() * type.length)];
        var name = random.trim().split(/ +/g).join("-").toLowerCase();
        var Name = name
        if (name.startsWith("alolan-")) {
            name = name.replace("alolan-", "");
            Name = `${name}-alola`
            name = random;
        }
        // pikachu-royal
        // magearna-lady
        // snow-queen-glaceon
        // eevee-princess
        var nche;
        let named = name
        if (name == "meloetta-commoner") named = "commoner" // id = 10233
        if (name == "pikachu-royal") named = "pikachu"// id = 10229
        if (name == "magearna-lady") named = "magearna"// id = 10230
        if (name == "snow-queen-glaceon") named = "glaceon"// id = 10231
        if (name == "eevee-princess") named = "eevee" // id = 10232
        let url = `https://pokeapi.co/api/v2/pokemon/${named}`
        fetch(url).catch(e => { return })
            .then(res => res.json()).catch(e => { return })
            .then(async data => {
                //console.log("Spawned!")
                const canvas = Canvas.createCanvas(1920, 1080);
                const context = canvas.getContext('2d');
                let guild = message.guild;
                let channel = message.channel;
                let type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toUpperCase())).join(" | ")
                let Type = type;
                let bg = "https://i.imgur.com/1JD6G5s.png"
                if (Type.toLowerCase().startsWith("bug")) bg = "https://i.imgur.com/9gtCCSL.jpg", shadow = true;
                if (Type.toLowerCase().startsWith("water")) bg = "https://i.imgur.com/fIBJHlf.png", shadow = true;
                if (Type.toLowerCase().startsWith("rock")) bg = "https://i.imgur.com/jf3dmak.png", y = 120, shadow = true;
                if (Type.toLowerCase().startsWith("flying")) bg = "https://i.imgur.com/j6TVvAU.png", shadow = true;
                if (Type.toLowerCase().startsWith("grass")) bg = "https://i.imgur.com/1JD6G5s.png", shadow = true;
                if (Type.toLowerCase().startsWith("normal")) bg = "https://i.imgur.com/SZP9smN.png", shadow = true;
                if (Type.toLowerCase().startsWith("steel")) bg = "https://i.imgur.com/ilx1zh0.png", shadow = true;
                if (Type.toLowerCase().startsWith("ice")) bg = "https://i.imgur.com/o5W9KH5.png", shadow = true;
                if (Type.toLowerCase().startsWith("ground")) bg = "https://i.imgur.com/ysrcar4.png", shadow = true;
                if (Type.toLowerCase().startsWith("ghost")) bg = "https://i.imgur.com/U2aNhgS.jpg", shadow = true;
                if (Type.toLowerCase().startsWith("figthing")) bg = "https://i.imgur.com/SZP9smN.png", shadow = true;
                if (Type.toLowerCase().startsWith("dark")) bg = "https://i.imgur.com/U2aNhgS.jpg", shadow = true;
                if (Type.toLowerCase().startsWith("dragon")) bg = "https://i.imgur.com/7vyIMW1.png", shadow = true;
                let _backtext = "https://i.imgur.com/SEbnXx2.png";
                const background = await Canvas.loadImage(bg)
                const Bg = await Canvas.loadImage(_backtext)
                context.drawImage(background, 0, 0, canvas.width, canvas.height);
                let img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
                const avatar = await Canvas.loadImage(img)
                context.drawImage(avatar, 500, 400, 700, 700);
                context.drawImage(Bg, 0, 0, canvas.width, canvas.height)
                context.fillStyle = "white"
                context.font = "bold 70px Arial";
                context.fillText(`Oh Look! A ${data.name} Came From Wild!`, 100, 160)
                const attachment = new MessageAttachment(canvas.toBuffer(), "pokemon.png")
                let throw_ball = new MessageButton().setStyle("SUCCESS").setCustomId("throw_ball").setLabel("Throw Ball")
                let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
                const row = [new MessageActionRow().addComponents([
                    throw_ball,
                    battle
                ])]
                if (spawner.channels.length !== 0) {
                    let cid = spawner.channels[Math.floor(Math.random() * spawner.channels.length)]
                    let spawn = await Spawn.findOne({ id: cid })
                    if(spawn) {
                        Spawn.findOneAndDelete({ id: cid })
                    }
                    await new Spawn({ id: cid, pokename: data.name, pokeid: data.id }).save()
                    let channel = message.guild.channels.cache.get(cid)
                    if (channel) {
                        let _msg = await channel.send({
                            files: [attachment],
                            embeds: [new MessageEmbed()
                                .setTitle(`A Wild Pokémon Has Appeared!`)
                                .setColor(color)
                                .setDescription(`Throw A **Pokéball** To Catch The Pokémon!`)
                                .setImage(`attachment://pokemon.png`)],
                            components: row
                        })
                    }
                } else if (spawner.channels.length == 0) {
                    await new Spawn({ id: message.channel.id, pokename: data.name, pokeid: data.id }).save()
                    let spawn = await Spawn.findOne({ id: message.channel.id })
                    if(spawn) {
                        Spawn.findOneAndDelete({ id: message.channel.id })
                    }
                    let _msg = await message.channel.send({
                        files: [attachment],
                        embeds: [new MessageEmbed()
                            .setTitle(`A Wild Pokémon Has Appeared!`)
                            .setColor(color)
                            .setDescription(`Throw A **Pokéball** To Catch The Pokémon!`)
                            .setImage(`attachment://pokemon.png`)],
                        components: row
                    })
                }
            }).catch(e => { return })
    } else {
        spawner.count = spawner.count + 1
        await spawner.save()
    }



    // Command Handling Etc.
    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();
    let prefix = settings.messageContentCommands.prefix
    let args = message.content.slice(prefix.length).trim().split(/ +/).filter(Boolean);
    let command = args.length > 0 ? args.shift().toLowerCase() : null;
    if (!command || command.length == 0) return;
    let cmd;
    cmd = client.commands.get(command);
    if (!cmd) cmd = client.commands.get(client.aliases.get(cmd));
    if (cmd) {
        try {
            cmd.run(client, message, args)
        } catch (e) {
            console.log(`[Error]`.red, `MESSAGE EVENT ERROR`.white, `\n${String(e.stack)}`)
        }
    }
}
function pickRandom() {
    let rareChance = getRandomNumberBetween(1, 101)
    if (rareChance < 70) return 'common'
    if ((rareChance > 70) && (rareChance > 74)) return 'legends'
    if ((rareChance > 73) && (rareChance < 77)) return 'mythics'
    if ((rareChance > 76) && (rareChance < 80)) return 'ub'
    if ((rareChance > 79) && (rareChance < 83)) return 'galarian'
    if ((rareChance > 82) && (rareChance < 86)) return 'alolan'
    else return 'event'
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
async function calculate_required_xp(level, pokemon) {
    let res;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then(res => res.json())
        .then(async data => {
            console.log(data.base_experience)
            let output = Math.floor(((data.base_experience * (level - 1)) / 10) + data.base_experience);
            output = null ? 1 : output;
            output = undefined ? 1 : output;
            output = output <= 0 ? 1 : output
            res = output
            console.log(output)
            return res;
        })
}