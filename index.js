const Cluster = require('discord-hybrid-sharding');

const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
    totalShards: 'auto', // or 'auto'
    /// Check below for more options
    shardsPerClusters: 3,
    // totalClusters: 7,
    mode: 'process', // you can also choose "worker"
    token: "MTAyMTY1NjIzNzc0MzU1MDQ4NQ.GfkRTy.lF921MernUOQD6mj5LV8764hF_TE9Ti6Cfygco",
});

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });