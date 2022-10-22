const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const User = require("../models/user")
const Egg = require("../classes/egg.js")
const { instanceToPlain } = require("class-transformer")
const fetch = require("node-fetch")
let ivarray = [
    "hp",
    "atk",
    "speed",
    "def",
    "spatk",
    "spdef"
]
module.exports = {
    name: "breed",
    description: "Breed Your Pokémons!",
    cooldown: 1,
    options: [
        {"Integer": { name: "male_id", description: "give the slot ID where The Male Pokémon is!", required: true }},
        {"Integer": { name: "female_id", description: "give the slot ID where The Female Pokémon is!", required: true }},
        {"StringChoices": { name: "held_item", description: `held_items Used For Breeding.`, required: false, choices: [["destiny_knot", "destiny_knot"], ["ultra_destiny_knot", "ultra_destiny_knot"]]}}
    ],
    run: async (client, interaction, color, support, guild) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Your Journey Yet, Run \`/start\` Command To Start Your Journey!` })
        if(user.credits < 500) return interaction.reply(`You Need 500 Credits To Breed A Pokémon!`)
        if(user.eggs.length >= 10) return interaction.reply(`You Can Hold Only Upto **10** Eggs At A Time!`)
        const { options } = interaction;
        const male_id = options.getInteger("male_id")
        const female_id = options.getInteger("female_id")
        if(female_id < 0 || female_id > 6) return interaction.reply({ content: `Please Specify Valid Pokémon IDs.`, ephemeral: true })
        if(female_id < 0 || female_id > 6) return interaction.reply({ content: `Please Specify Valid Pokémon IDs.`, ephemeral: true })
        if(male_id == female_id) return interaction.reply({ content: `Male And Female Pokémon IDs Cannot Be Same!`})
        let male_poke = user.pokemons[male_id - 1];
        let female_poke = user.pokemons[female_id - 1];
        if(!male_poke) return interaction.reply(`The Slot ${male_id} is Empty!`)
        if(!female_poke) return interaction.reply(`The Slot ${female_id} is Empty!`)
        if(male_poke.gender == "none" && male_poke.name !== "ditto") {
            return interaction.reply(`The Male Pokémon ID You Specified is GenderLess And is Not A Ditto.`)
        }
        if(female_poke.gender == "none" && female_poke.name !== "ditto") {
            return interaction.reply(`The Female Pokémon ID You Specified is GenderLess And is Not A Ditto.`)
        }
        if(male_poke.gender !== "male" && male_poke.name !== "ditto") {
            return interaction.reply(`The Male ID You Specified is Not Male.`)
        }
        if(female_poke.gender !== "female" && female_poke.name !== "ditto") {
            return interaction.reply(`The Female ID You Specified is Not Male.`)
        }
        let held_item = options.getString("held_item")
        if(held_item == "destiny_knot" && user.destiny_knot < 1) {
            return interaction.reply(`You Dont Have Enough \`${held_item.replace(/_/g, " ")}(s)\` To Perform This Action`)
        }
        if(held_item == "ultra_destiny_knot" && user.ultra_destiny_knot < 1) {
            return interaction.reply(`You Dont Have Enough \`${held_item.replace(/_/g, " ")}(s)\` To Perform This Action`)
        }
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${male_poke.name}`)
        .then(res => res.json())
        .then(async male => {
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${female_poke.name}`)
            .then(res => res.json())
            .then(async female => {
		if((male_poke.name !== female_poke.name) && (male_poke.name !== "ditto" || female_poke.name !== "ditto")) return interaction.reply({ content: `The Pokémons Cannot Be Breeded Because They Both Are Not of The Same Breed / Ditto.` })
                let male_egg_groups = male.egg_groups.map(r => r.name);
                let female_egg_groups = female.egg_groups.map(r => r.name)
                if(!findCommonElement(male_egg_groups, female_egg_groups)) {
                    if(!male_egg_groups.includes("ditto") && !female_egg_groups.includes("ditto")) {
                        return interaction.reply(`The Pokémons Specified Are Not of The Same Egg Group / Ditto.`)
                    }
                }
                await interaction.deferReply()
                let chance = 30;
                if(held_item && held_item == "destiny_knot") chance = 50;
                if(held_item && held_item == "ultra_destiny_knot") chance = 80;
                let wheel = getRandomNumberBetween(1, 100)
                let fail = false;
                if(wheel > chance) fail = true;
                let poke;
                if(fail === true) {
                    let hp = male_poke.hp;
                    let atk = male_poke.atk;
                    let def = male_poke.def;
                    let spatk = male_poke.spatk;
                    let spdef = male_poke.spdef;
                    let speed = male_poke.speed;
                    let choosen = false;
                    let choosed = ""
                    while (choosen !== true) {
                        let find = ivarray[Math.floor(Math.random() * ivarray.length)]
                        if(find == "hp") {
                            if(hp !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "atk") {
                            if(atk !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "def") {
                            if(def !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "spdef") {
                            if(spdef !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "spatk") {
                            if(spatk !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "speed") {
                            if(speed !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(hp <= 10 && def <= 10 && atk <= 10 && spdef <= 10 && spatk <= 10 && speed <= 10) {
                            choosen = true;
                            choosed = null
                        }
                    }
                    if(choosed !== null) {
                        if(choosed == "hp") {
                            hp = hp - getRandomNumberBetween(1, 5)
                            if(hp < 1) hp = 1
                        }
                        if(choosed == "atk") {
                            atk = atk - getRandomNumberBetween(1, 5)
                            if(atk < 1) atk = 1
                        }
                        if(choosed == "def") {
                            def = def - getRandomNumberBetween(1, 5)
                            if(def < 1) def = 1
                        }
                        if(choosed == "spatk") {
                            spatk = spatk - getRandomNumberBetween(1, 5)
                            if(spatk < 1) spatk = 1
                        }
                        if(choosed == "spdef") {
                            spdef = spdef - getRandomNumberBetween(1, 5)
                            if(spdef < 1) spdef = 1
                        }
                        if(choosed == "speed") {
                            speed = speed - getRandomNumberBetween(1, 5)
                            if(speed < 1) speed = 1
                        }
                    }
                    let gender;
                    if(female_poke.name == "ditto") {
                        gender = "none"
                    } else {
                        let genders = ['male', 'female']
                        let cho = genders[Math.floor(Math.random() * genders.length)]
                        gender = cho
                    }
                    poke = new Egg({ gender: gender, shiny: false, name: female_poke.name, url: female_poke.url, level: 1, hp: hp, atk: atk, def: def, spatk: spatk, spdef: spdef, speed: speed, helditem: held_item ? held_item : "no_knot" })
                } else {
                    let hp = male_poke.hp;
                    let atk = male_poke.atk;
                    let def = male_poke.def;
                    let spatk = male_poke.spatk;
                    let spdef = male_poke.spdef;
                    let speed = male_poke.speed;
                    let choosen = false;
                    let choosed = ""
                    while (choosen !== true) {
                        let find = ivarray[Math.floor(Math.random() * ivarray.length)]
                        if(find == "hp") {
                            if(hp !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "atk") {
                            if(atk !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "def") {
                            if(def !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "spdef") {
                            if(spdef !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "spatk") {
                            if(spatk !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(find == "speed") {
                            if(speed !== 31) {
                                choosen = true;
                                choosed = find
                            }
                        }
                        if(hp >= 31 && def >= 31 && atk >= 31 && spdef >= 31 && spatk >= 31 && speed >= 31) {
                            choosen = true;
                            choosed = null
                        }
                    }
                    if(choosed !== null) {
                        if(choosed == "hp") {
                            hp = hp + getRandomNumberBetween(1, 5)
                            if(held_item) hp = hp + 2
                            if(hp > 31) hp = 31
                        }
                        if(choosed == "atk") {
                            atk = atk + getRandomNumberBetween(1, 5)
                            if(held_item) atk = atk + 2
                            if(atk > 31) atk = 31
                        }
                        if(choosed == "def") {
                            def = def + getRandomNumberBetween(1, 5)
                            if(held_item) def = def + 2
                            if(def > 31) def = 31
                        }
                        if(choosed == "spatk") {
                            spatk = spatk + getRandomNumberBetween(1, 5)
                            if(held_item) spatk = spatk + 2
                            if(spatk > 31) spatk = 31
                        }
                        if(choosed == "spdef") {
                            spdef = spdef + getRandomNumberBetween(1, 5)
                            if(held_item) spdef = spdef + 2
                            if(spdef > 31) spdef = 31
                        }
                        if(choosed == "speed") {
                            speed = speed + getRandomNumberBetween(1, 5)
                            if(held_item) speed = speed + 2
                            if(speed > 31) speed = 31
                        }
                    }
                    let gender;
                    if(female_poke.name == "ditto") {
                        gender = "none"
                    } else {
                        let genders = ['male', 'female']
                        let cho = genders[Math.floor(Math.random() * genders.length)]
                        gender = cho
                    }
                    poke = new Egg({ gender: gender, shiny: false, name: female_poke.name, url: female_poke.url, level: 1, hp: hp, atk: atk, def: def, spatk: spatk, spdef: spdef, speed: speed, helditem: held_item ? held_item : "" })
                }
                if(held_item && held_item == "destiny_knot") user.destiny_knot = user.destiny_knot - 1;
                if(held_item && held_item == "ultra_destiny_knot") user.ultra_destiny_knot = user.ultra_destiny_knot - 1;
                poke = instanceToPlain(poke)
                user.eggs.push(poke)
                user.credits = user.credits - 500
                await user.save()
                if(user.q3 == false) {
                    user = await User.findOne({ id: interaction.user.id })
                    user.q3 = true
                    user.credits += 3000;
                    await user.save()
                    await interaction.channel.send(`**${interaction.user.username}**, you have successfully Breeded an egg, Completing the quest. You have been rewarded with 3000 credits.`)
                }
                return interaction.editReply({ content: `You Have **Successfully** Recieved The Egg!`})
            })
        })
    }
}
/*
constructor(object) {
        this.xp = 1;
        this.name = object.name;
        this.price = 0;
        this.id = null;
        this.event = false;
        this.level = object.level;
        this.gender = object.gender;
        this.index = object.index;
        this.url = object.url;
        this.hp =  object.hp;
		this.atk = object.atk;
		this.def = object.def;
		this.spatk = object.spatk;
		this.spdef = object.spdef;
		this.speed = object.speed;
        this.moves = [];
        this.helditem = object.helditem;
        this.shiny = object.shiny;
        this.rarity = object.rarity;
        this.nature = natures[Math.floor(Math.random() * natures.length)];
        let totaliv = ((this.hp + this.atk + this.def + this.spatk + this.spdef + this.speed) / 186) * 100;
        this.totalIV = (totaliv.toFixed(1));
    }
*/
function findCommonElement(array1, array2) {
    for(let i = 0; i < array1.length; i++) {
        for(let j = 0; j < array2.length; j++) {
            if(array1[i] === array2[j]) {
                return true;
            }
        }
    }
    return false;
}
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}