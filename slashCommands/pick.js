const Pokemon = require("../classes/pokemon.js")
const { instanceToPlain } = require("class-transformer")
const User = require("../models/user.js")
const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
} = require("discord.js")
let starters = [
    "bulbasaur",
    "charmander",
    "squirtle",
    "chikorita",
    "cyndaquil",
    "totodile",
    "treecko",
    "torchic",
    "mudkip",
    "turtwig",
    "chimchar",
    "piplup",
    "snivy",
    "tepig",
    "oshawott",
    "chespin",
    "fennekin",
    "froakie",
    "rowlet",
    "litten",
    "popplio",
    "grookey",
    "scorbunny",
    "sobble"
]
const fetch = require("node-fetch")
module.exports = {
    name: `pick`,
    description: `pick your starter to start your journey.`,
    options: [
        {"StringChoices": { name: "pokémon", description: "Name The pokémon you Wish To Choose!", required: true, choices: [
            [ 'bulbasaur', 'bulbasaur' ],
            [ 'charmander', 'charmander' ],
            [ 'squirtle', 'squirtle' ],
            [ 'chikorita', 'chikorita' ],
            [ 'cyndaquil', 'cyndaquil' ],
            [ 'totodile', 'totodile' ],
            [ 'treecko', 'treecko' ],
            [ 'torchic', 'torchic' ],
            [ 'mudkip', 'mudkip' ],
            [ 'turtwig', 'turtwig' ],
            [ 'chimchar', 'chimchar' ],
            [ 'piplup', 'piplup' ],
            [ 'snivy', 'snivy' ],
            [ 'tepig', 'tepig' ],
            [ 'oshawott', 'oshawott' ],
            [ 'chespin', 'chespin' ],
            [ 'fennekin', 'fennekin' ],
            [ 'froakie', 'froakie' ],
            [ 'rowlet', 'rowlet' ],
            [ 'litten', 'litten' ],
            [ 'popplio', 'popplio' ],
            [ 'grookey', 'grookey' ],
            [ 'scorbunny', 'scorbunny' ],
            [ 'sobble', 'sobble' ]
          ]}},
    ],
    run: async (client, interaction, color, support, guild) => {
        let _language = guild.language;
		let language = require(`../languages/english.js`)
		if(_language.toLowerCase() == "english") language = require(`${process.cwd()}/languages/english.js`);
		if(_language.toLowerCase() == "hindi") language = require(`${process.cwd()}/languages/hindi.js`);
        await interaction.deferReply();
        let options = interaction.options;
        let name = options.getString("pokémon")
        let user = await User.findOne({ id: interaction.user.id })
        if(user) {
            return await interaction.editReply({ content: `${language.already_started}`})
        }
        if(!starters.includes(name.toLowerCase())) {
            return await interaction.editReply({ content: `${language.invalid_starter_pokemon_name}`, ephemeral: true })
        }
        fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(res => res.json()).catch(e => { return interaction.editReply({ content: String(e) })})
        .then(async data => {
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.name}`)
            .then(res => res.json())
            .then(async deta => {
                let genarray = new Array("male", "female")
                let gender = genarray[Math.floor(Math.random() * 2)];
                if(deta.gender_rate < 0) gender = "none";
                let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
                let poke = new Pokemon({ gender: gender, name: `${data.name}`, level: Math.floor(Math.random() * 45), index: 1, url: url, shiny: false, rarity: 'normal' })
                poke = instanceToPlain(poke)
                await new User({ id: interaction.user.id }).save()
                user = await User.findOne({ id: interaction.user.id })
                if(user) {
                    user.pokemons.push(poke)
                    user.markModified(`pokemons`)
                    await user.save()
                    await interaction.editReply({ embeds: [new MessageEmbed()
                    .setTitle(`${language.pokemon_choosed_title.replace("{name}", data.name)}`)
                    .setDescription(`${language.to_see_all_poke}`)
                    .setThumbnail(`${url}`)
                    .setColor(color)
                    .addFields(
                        { name: `${language.question_for_trainer_title}`, value: `${language.reffered_question}` }
                    )] })
                    let accept = new MessageButton().setStyle("SUCCESS").setCustomId("accept").setLabel(`Yes`)
                    let decline = new MessageButton().setStyle("DANGER").setCustomId("decline").setLabel("No")
                    const row = [new MessageActionRow().addComponents([accept, decline])]
                    let msg = await interaction.channel.send({ components: row })
                    const filter = i => {
                        if(i.user.id == interaction.user.id) return true;
                        else return i.reply({ content: `${language.button_not_for_you}`, ephemeral: true })
                    }
                    const collector = msg.createMessageComponentCollector({
                        filter,
                        max: 1,
                        time: 15000
                    })
                    collector.on("collect", async (click) => {
                        if(click.customId == "decline") {
                            click.deferUpdate()
                            await interaction.channel.send({ embeds: [new MessageEmbed()
                            .setTitle(`${language.welcome_to_world}`)
                            .setColor(color)
                            .setDescription(`${language.pick_warn}`)
                            .addFields({ name: `${language.quick_tour_title}`, value: `${language.quick_tour_guide}`})]})
                        } else {
                            click.deferUpdate()
                            await interaction.channel.send({ embeds: [new MessageEmbed()
                                .setTitle(`${language.welcome_to_world}`)
                                .setColor(color)
                                .setDescription(`${language.pick_warn}`)
                                .addFields({ name: `${language.quick_tour_title}`, value: `${language.quick_tour_guide}`})]})
                            await interaction.channel.send({ content: `${language.please_run_reffered}`})
                        }
                    })
                }
            })
        })
    }
}