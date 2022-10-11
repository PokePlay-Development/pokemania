const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    version
} = require("discord.js")
const os = require("node:os")
const Os = require("os-utils")
const User = require("../models/user.js")
module.exports = {
    name: "stats",
    description: "Shows The Bot's Statistics.",
    run: async (client, interaction, color) => {
        await interaction.deferReply();
        let guild_count;
        let current_cluster_id = client.cluster.id;
        let total_clusters = client.cluster.count;
        
        client.cluster
        .broadcastEval(`this.guilds.cache.size`)
        .then(results => { guild_count = results.reduce((prev, val) => prev + val, 0)});
        let user = await User.find();
        let total_users = user.length
        Os.cpuUsage(async function (usage) {
            let e = Os.freememPercentage();
            e = e.toPrecision(2)
            let date = new Date();
            let timestamp = date.getTime() - Math.floor(client.uptime)
            let embed = new MessageEmbed()
            .setTitle(`Bot Statistics`)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: `Current Cluster: ${current_cluster_id}, Containing Shards: ${[...client.cluster.ids.keys()].map(r => `#${r}`).join(", ")}`})
            .setThumbnail(client.user.displayAvatarURL({ format: "png" }))
            .addField(`Node.js Version`, `\`${process.version}\``, true)
            .addField(`Discord.js Version`, `\`${version}\``, true)
            .addField(`Total Servers`, `\`${guild_count}\``, true)
            .addField(`Total Users`, `${total_users}`, true)
            .addField(`Host`, `${os.hostname} - ${os.platform}`, true)
            .addField(`Arch`, `${os.arch}`, true)
            .addField(`Free Memory`, `\`${e}%\``, true)
            .addField(`CPU Usage`, `\`${usage.toPrecision(2)}%\``, true)
            .addField(`Last Outage`, `<t:${Math.floor(timestamp/1000)}:R>`, true)
            .addField(`Started On`, `<t:${Math.floor(1640008680844/1000)}:R>`, true)
            .addField(`Total Clusters`, `${total_clusters}`)
            return await interaction.editReply({ embeds: [embed] })
        });
    }
}
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}