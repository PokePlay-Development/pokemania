const { Client, Collection, Intents } = require("discord.js");
const settings = require("./settings.json")
const colors = require("colors")
let client;
const Cluster = require("discord-hybrid-sharding")
if(settings.messageContentCommands.status == true) {
    client = new Client({
        shards: Cluster.data.SHARD_LIST, // An array of shards that will get spawned
        shardCount: Cluster.data.TOTAL_SHARDS, // Total number of shards
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.MESSAGE_CONTENT
        ]
    })
} else {
    client = new Client({
        shards: Cluster.data.SHARD_LIST, // An array of shards that will get spawned
        shardCount: Cluster.data.TOTAL_SHARDS, // Total number of shards
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            //Intents.FLAGS.MESSAGE_CONTENT
        ]
    })
}
client.cooldowns = new Collection();
client.slashCommands = new Collection();
client.cluster = new Cluster.Client(client);
if (client.cluster.maintenance) console.log(`Bot on maintenance mode with ${client.cluster.maintenance}`);
if(settings.messageContentCommands.status == true) {
    client.commands = new Collection();
    client.aliases = new Collection();
    ['antiCrash', 'events', 'slashCommands']
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