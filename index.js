const Cluster = require('discord-hybrid-sharding');
const { token } = require("./settings.json")
const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
    totalShards: 'auto', // or 'auto'
    /// Check below for more options
    shardsPerClusters: 1,
    totalClusters: 1,
    mode: 'process', // you can also choose "worker"
    token: token,
});

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });
