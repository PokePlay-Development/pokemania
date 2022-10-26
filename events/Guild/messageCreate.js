const config = require("../../settings.json")
const Guild = require("../../models/guild.js");
const guild = require("../../models/guild.js");
module.exports = async (client, message) => {
    if(config.messageContentCommands.status == true) {
        if(message.author.bot) return;
        let prefix;
        if(message.channel.type == "dm") {
            prefix = "p!"
        } else {
            let guild = await Guild.findOne({ id: message.guild.id })
            if(!guild) {
                prefix = config.messageContentCommands.prefix
            } else {
                prefix = guild.prefix
            }
        }
        const args = message.content.slice(prefix.length).trim().split(/ +/).filter(Boolean);
        const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
        if(!cmd || cmd.length == 0) return
        let command = client.commands.get(cmd);
        if(!command) command = client.commands.get(client.aliases.get(cmd));
        if (command) {
            try {
                let color = require("../../settings.json").embeds.color || "RANDOM";
                command.run(client, message, args, color, guild);
            } catch (e) {
                console.log(String(e.stack).bgRed)
            }
        }
    }
}