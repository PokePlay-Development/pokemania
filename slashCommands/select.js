const User = require("../models/user.js")

module.exports = {
    name: "select",
    description: "Select A Pokémon!",
    options: [
        {"Integer": { name: `slot_id`, description: `Specify The Slot ID of the Pokémon You Wish To Select!`, required: true }}
    ],
    run: async (client, interaction) => {
        const options = interaction.options;
        let slot_id = options.getInteger("slot_id")
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Picked A Starter Pokémon Yet, Run \`/start\` Command To Pick A Starter.`})
        let poke = user.pokemons[slot_id - 1];
        if(!poke) return interaction.reply({ content: `The Slot ID, you provided is either empty, or invalid.` })
        user.selected = [poke];
        await user.save()
        return interaction.reply({ content: `Successfully Selected Your, **__${poke.name}__ of Level ${poke.level}.**`})
    }
}