const { Client, Collection, Intents, MessageButton, MessageActionRow, MessageAttachment, MessageEmbed } = require("discord.js");
const Discord = require("discord.js")
const settings = require("./settings.json")
const colors = require("colors")
const Cluster = require("discord-hybrid-sharding")
const fetch = require("node-fetch");
const client = new Client({
    intents: [Discord.Intents.FLAGS.GUILDS,
    //Discord.Intents.FLAGS.GUILD_MEMBERS,
    //Discord.Intents.FLAGS.GUILD_BANS,
    //Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    //Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    //Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    //Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    //Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        //Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        //Discord.Intents.FLAGS.DIRECT_MESSAGES,
        //Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        //Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    shards: Cluster.data.SHARD_LIST, // An array of shards that will get spawned
    shardCount: Cluster.data.TOTAL_SHARDS, // Total number of shards
})
client.battles = new Array();
client.cooldowns = new Collection();
client.slashCommands = new Collection();
client.cluster = new Cluster.Client(client);
if (client.cluster.maintenance) console.log(`Bot on maintenance mode with ${client.cluster.maintenance}`);
if (settings.messageContentCommands.status == true) {
    client.commands = new Collection();
    client.aliases = new Collection();
    ['antiCrash', 'events', 'slashCommands', 'commands']
        .filter(Boolean)
        .forEach(item => {
            require(`./handlers/${item}`)(client);
        })
} else {
    ['antiCrash', 'events', 'slashCommands']
        .filter(Boolean)
        .forEach(item => {
            require(`./handlers/${item}`)(client);
        })
}
client.login(settings.token).catch(e => {
    console.log(`[Error]`.red, `${e}`.green)
})
/**
 * @INFO
 * SPAWN SYSTEM AHEAD
 * @INFO
 */
const Guild = require("./models/guild");
const fs = require("node:fs")
const Spawner = require("./models/spawner");
const Spawn = require("./models/spawn");
const Canvas = require("canvas");
const common = fs.readFileSync(`${process.cwd()}/db/common.txt`).toString().trim().split("\n").map(r => r.trim());
const legends = fs.readFileSync(`${process.cwd()}/db/legends.txt`).toString().trim().split("\n").map(r => r.trim());
const mythics = fs.readFileSync(`${process.cwd()}/db/mythics.txt`).toString().trim().split("\n").map(r => r.trim());
const beasts = fs.readFileSync(`${process.cwd()}/db/ub.txt`).toString().trim().split("\n").map(r => r.trim());
const alolan = fs.readFileSync(`${process.cwd()}/db/alola.txt`).toString().trim().split("\n").map(r => r.trim());
const galarian = fs.readFileSync(`${process.cwd()}/db/galar.txt`).toString().trim().split("\n").map(r => r.trim());
client.on("messageCreate", async message => {
    // make a pokemon spawning system in discord channels
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    let guild = await Guild.findOne({ id: message.guild.id });
    if(!guild) return await new Guild({ id: message.guild.id }).save();
    if (message.content.toLowerCase().startsWith(guild.prefix)) return;
    let spawner = await Spawner.findOne({ id: message.guild.id });
    if (!spawner) await new Spawner({ id: message.guild.id }).save();
    spawner = await Spawner.findOne({ id: message.guild.id });
    if (spawner.disabled == true) return;
    if (spawner.count >= 45) {
        spawner.count = 0;
        spawner.total_spawns += 1;
        await spawner.save();
        let type = await rarity();
        if (type == "common") type = common;
        if (type == "legends") type = legends;
        if (type == "mythic") type = mythics;
        if (type == "ub") type = beasts;
        if (type == "alolan") type = alolan;
        if (type == "galarian") type = galarian;
        let pokemon = type[Math.floor(Math.random() * type.length)];
        pokemon = pokemon.replace(/ /g, "-").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
            .then(res => res.json())
            .then(async data => {
                let channel = message.channel;
                if (spawner.channels.length > 0) {
                    channel = message.guild.channels.cache.get(spawner.channels[Math.floor(Math.random() * spawner.channels.length)]);
                    if (!channel) {
                        let find = false;
                        for (let i = 0; i < spawner.channels.length; i++) {
                            let c = message.guild.channels.cache.get(spawner.channels[i]);
                            if (c) {
                                channel = c;
                                find = true;
                                break;
                            }
                        }
                    }
                    if (!channel) channel = message.channel;
                    let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
                    const row = [new MessageActionRow().addComponents([
                        battle
                    ])]
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
                    const canvas = Canvas.createCanvas(1920, 1080);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage(bg)
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);
                    const avatar = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`)
                    context.drawImage(avatar, 600, 250, 800, 800);
                    const attachment = new MessageAttachment(canvas.toBuffer(), 'pokemon.png');
                    let spawn = await Spawn.findOne({ id: channel.id });
                    if (!spawn) {
                        await new Spawn({
                            id: channel.id,
                            pokename: data.name,
                            pokeid: data.id
                        }).save()
                    } else {
                        spawn.pokename = data.name;
                        spawn.pokeid = data.id
                        await spawn.save()
                    }
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`A wild pokémon has appeared!`)
                        .setColor(require("./settings.json").embeds.color)
                        .setImage(`attachment://pokemon.png`)
                        .setDescription(`Guess the pokémon and type \`${guild.prefix}catch <pokémon>\` to catch it!`)
                    await channel.send({
                        embeds: [embed],
                        components: row,
                        files: [attachment]
                    })
                } else {
                    let channel = message.channel;
                    let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
                    const row = [new MessageActionRow().addComponents([
                        battle
                    ])]
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
                    const canvas = Canvas.createCanvas(1920, 1080);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage(bg)
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);
                    const avatar = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`)
                    context.drawImage(avatar, 600, 250, 800, 800);
                    const attachment = new MessageAttachment(canvas.toBuffer(), 'pokemon.png');
                    let spawn = await Spawn.findOne({ id: channel.id });
                    if (!spawn) {
                        await new Spawn({
                            id: channel.id,
                            pokename: data.name,
                            pokeid: data.id
                        }).save()
                    } else {
                        spawn.pokename = data.name;
                        spawn.pokeid = data.id
                        await spawn.save()
                    }
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`A wild pokémon has appeared!`)
                        .setColor(require("./settings.json").embeds.color)
                        .setImage(`attachment://pokemon.png`)
                        .setDescription(`Guess the pokémon and type \`${guild.prefix}catch <pokémon>\` to catch it!`)
                    await channel.send({
                        embeds: [embed],
                        components: row,
                        files: [attachment]
                    })
                }
            })
    } else {
        spawner.count += 1;
        await spawner.save()
    }
})

client.on("ready", async () => {
    let channels = ["1029068107710480384", "1029068477908140198", "1029068516894187600"];
    setInterval(async function () {
        channels.forEach(async cid => {
            let guild = client.guilds.cache.get("922488011097251840");
            if (guild) {
                let channel = guild.channels.cache.get(cid)
                if (channel) {
                    let type = await rarity();
                    if (type == "common") type = common;
                    if (type == "legends") type = legends;
                    if (type == "mythic") type = mythics;
                    if (type == "ub") type = beasts;
                    if (type == "alolan") type = alolan;
                    if (type == "galarian") type = galarian;
                    let pokemon = type[Math.floor(Math.random() * type.length)];
                    pokemon = pokemon.replace(/ /g, "-").toLowerCase();
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
                        .then(res => res.json())
                        .then(async data => {
                            let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
                            const row = [new MessageActionRow().addComponents([
                                battle
                            ])]
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
                            const canvas = Canvas.createCanvas(1920, 1080);
                            const context = canvas.getContext('2d');
                            const background = await Canvas.loadImage(bg)
                            context.drawImage(background, 0, 0, canvas.width, canvas.height);
                            const avatar = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`)
                            context.drawImage(avatar, 600, 250, 800, 800);
                            const attachment = new MessageAttachment(canvas.toBuffer(), 'pokemon.png');
                            let spawn = await Spawn.findOne({ id: channel.id });
                            if (!spawn) {
                                await new Spawn({
                                    id: channel.id,
                                    pokename: data.name,
                                    pokeid: data.id
                                }).save()
                            } else {
                                spawn.pokename = data.name;
                                spawn.pokeid = data.id
                                await spawn.save()
                            }
                            let embed = new Discord.MessageEmbed()
                                .setTitle(`A wild pokémon has appeared!`)
                                .setColor(require("./settings.json").embeds.color)
                                .setImage(`attachment://pokemon.png`)
                                .setDescription(`Guess the pokémon and type \`${"p!"}catch <pokémon>\` to catch it!`)
                            await channel.send({
                                embeds: [embed],
                                components: row,
                                files: [attachment]
                            })
                        })
                }
            }
        })
    }, 60000)
})
function rarity() {
    let rareChance = getRandomNumberBetween(1, 101)
    if (rareChance < 70) return 'common'
    if ((rareChance > 70) && (rareChance > 74)) return 'legends'
    if ((rareChance > 73) && (rareChance < 77)) return 'mythic'
    if ((rareChance > 76) && (rareChance < 80)) return 'ub'
    if ((rareChance > 79) && (rareChance < 83)) return 'galarian'
    if ((rareChance > 82) && (rareChance < 86)) return 'alolan'
    else return 'common'
}
async function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}