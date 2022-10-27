const User = require("../../models/user")
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const Spawn = require("../../models/spawn");
const cooldown = new Set();
module.exports = {
    name: "hint",
    description: "Get a hint for the pokemon",
    run: async (client, message, args) => {
        if(cooldown.has(message.channel.id)) {
			return await message.react("⏰")
		} else {
			cooldown.add(message.channel.id)
			setTimeout(function () {
				cooldown.delete(message.channel.id)
			}, 7000)
		}
        let user = await User.findOne({ id: message.author.id });
        if (!user) {
            return message.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter!`})
        }
        let spawn = await Spawn.findOne({ id: message.channel.id });
        if(!spawn) return;
        let name = spawn.pokename;
        name = name.split("");
        for(let i = 0; i < name.length; i++) {
            let chance = getRandomNumberBetween(1, 10);
            if(chance > 5) {
                name[i] = "\\_";
            }
        }
        name = name.join("");
        return message.channel.send({ content: `The Wild Pokémon is ${name}`})
    }
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}