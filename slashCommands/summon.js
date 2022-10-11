const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageAttachment
} = require("discord.js")
const User = require("../models/user.js")
const fetch = require("node-fetch")
const Canvas = require("canvas")
const Spawn = require("../models/spawn.js")
const Spawner = require("../models/spawner.js")
module.exports = {
    name: "summon",
    description: `Summon A Pokémon Using Your Summon Credits!`,
    options: [
        {"String": { name: "pokemon", description: `Name of The Pokémon Which You Wish To Summon!`, required: false }}
    ],
    run: async (client, interaction, color, support, guild) => {
        let name = interaction.options.getString("pokemon");
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Yet! Type \`/start\` To Pick Your Starter Pokémon!`})
        if(!name) {
            let embed = new MessageEmbed()
            .setTitle(`Summon Pokémons! | ${client.user.username}`)
            .setDescription(`Summons Are Forms of Credits Which Are Used To Summon A Pokémon of Your Choice!`)
            .setColor(color)
            .setTimestamp()
            .addField(`**__Your Summons: ${user.summons}__**`, `**__Price:__** \`10,000\` *Credits*`)
            return interaction.reply({ embeds: [embed] })
        } else {
            fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`).catch(() => {
                return interaction.reply({ content: `Unable To Find That Pokémon!`})
            })
            .then(res => res.json()).catch(() => {
                return interaction.reply({ content: `Unable To Find That Pokémon!`})
            })
            .then(async data => {
                if(user.summons < 1) return interaction.reply({ content: `Sorry! You Don't Own Enough Summons To Summon A Pokémon!`})
                let check = await check_ban(data.name);
                if(check == true) return interaction.reply({ content: `Sorry! That Pokémon Cannot Be Summoned!`})            
                user.summons = user.summons - 1;
                await user.save()
                await interaction.deferReply({ ephemeral: true });
                const canvas = Canvas.createCanvas(1920, 1080);
			    const context = canvas.getContext('2d');
                let spawn = await Spawn.findOne({ id: interaction.channel.id })
                if (spawn) {
                    await Spawn.findOneAndDelete({ id: interaction.channel.id })
                }
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
			    context.drawImage(avatar, 1000, 400, 700, 700);
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
                await new Spawn({ id: interaction.channel.id, pokename: data.name, pokeid: data.id }).save()
                    let _msg = await interaction.channel.send({
                        files: [attachment],
                        embeds: [new MessageEmbed()
                            .setTitle(`A Wild Pokémon Has Appeared!`)
                            .setColor(color)
                            .setDescription(`Throw A **Pokéball** To Catch The Pokémon!`)
                            .setImage(`attachment://pokemon.png`)],
                        components: row
                    })
                await interaction.editReply({ content: `Successfully Summoned A ${data.name}`})
            }).catch(() => {
                return interaction.editReply({ content: `Unable To Summon The Pokémon, Please Run The Command Again!`})
            })
        }
    }
}
async function check_ban(name) {
    let bans = [
        "-mega",
        "-primal",
        "-speed",
        "-origin",
        "-gmax"
    ];
    let flag = false;
    bans.forEach(item => {
        if(name.includes(item)) flag = true;
    })
    return flag;
}