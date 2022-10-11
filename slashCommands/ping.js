module.exports = {
    name: "ping",
    description: "get the Ping of The Bot.",
    run: async (client, interaction) => {
        let ping = new Date() - interaction.createdTimestamp;
        return interaction.reply({
            content: `🏓 Pong! The Ping is **${ping}ms**.`
        })
    }
}