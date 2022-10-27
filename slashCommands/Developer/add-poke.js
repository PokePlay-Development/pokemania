const User = require("../../models/user.js")
const Pokemon = require("../../classes/pokemon2.js")
const { instanceToPlain } = require("class-transformer")
const fetch = require("node-fetch")
module.exports = {
    name: `add-poke`,
    description: `Add a pokemon To A Registered User.`,
    developer: true,
    admin: true,
    options: [
        {"User": { name: "user", description: "Mention The User To Add The Pokemon To!", required: true }},
        {"String": { name: "name", description: "The Name Of The Pokemon!", required: true }},
        {"Integer": { name: "level", description: "The Level Of The Pokemon!", required: true }},
        {"Integer": { name: "hp", description: "The HP Of The Pokemon! max: 31", required: true }},
        {"Integer": { name: "atk", description: "The Attack Of The Pokemon! max: 31", required: true }},
        {"Integer": { name: "def", description: "The Defense Of The Pokemon! max: 31", required: true }},
        {"Integer": { name: "spatk", description: "The Special Attack Of The Pokemon! max: 31", required: true }},
        {"Integer": { name: "spdef", description: "The Special Defense Of The Pokemon! max: 31", required: true }},
        {"Integer": { name: "speed", description: "The Speed Of The Pokemon! max: 31", required: true }},
        {"StringChoices": {
            name: "shiny",
            description: "Is The Pokemon Shiny?",
            required: true,
            choices: [
                ["Yes", "yes"],
                ["No", "no"]
            ]
        }}
    ],
    run: async (client, interaction) => {
        const { options } = interaction;
        let mention = options.getUser("user");
        let name = options.getString("name");
        let level = options.getInteger("level");
        let hp = options.getInteger("hp");
        let atk = options.getInteger("atk");
        let def = options.getInteger("def");
        let spatk = options.getInteger("spatk");
        let spdef = options.getInteger("spdef");
        let speed = options.getInteger("speed");
        let shiny = options.getString("shiny");
	if(shiny == "yes") shiny = true;
	if(shiny == "no") shiny = false;
        if(hp > 31 || atk > 31 || def > 31 || spatk > 31 || spdef > 31 || speed > 31) {
            return interaction.reply(`One Of The Stats Is Greater Than 31!`)
        }
        let user = await User.findOne({ id: mention.id })
        if(!user) {
            return interaction.reply(`The Mentioned User Is Not Registered!`)
        }
        fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().replace(/ /g, "-")}`)
        .then(res => res.json()).catch(e => { return interaction.reply(`The Pokemon You Mentioned Does Not Exist!`) })
        .then(async json => {
            let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${json.id}.png`;
	    if(shiny == true) url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${json.id}.png`
            let poke = new Pokemon({ name: json.name, level: level, hp: hp, atk: atk, def: def, spatk: spatk, spdef: spdef, speed: speed, shiny: shiny, url: url });
            user.pokemons.push(instanceToPlain(poke))
            user.markModified("pokemons")
            await user.save()
            return interaction.reply({ content: `Added A **${poke.name}** Level **${poke.level}** To **${mention.username}**!`, ephemeral: true })
        })
    }
}