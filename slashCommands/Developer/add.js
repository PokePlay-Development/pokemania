const User = require("../../models/user.js")

module.exports = {
    name: `add`,
    description: `Add Someting To A Registered User.`,
    developer: true,
    admin: true,
    options: [
        {"User": { name: "mention", description: `Mention The User You Wish To Add Something.`, required: true }},
        {"Integer": { name: "ammount", description: "How Much of That Item You Wish To Add!", required: true }},
        {"StringChoices": { name: "item", description: "Finally, What Item You Wish To Add!", required: true, choices: [
            ["credits", "credits"],
            ["crystals", "crystals"],
            ["greatball", "greatball"],
            ["ultraball", "ultraball"],
            ["masterball", "masterball"],
            ["summons", "summons"],
        ]}}
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true })
        const options = interaction.options;
        let item = options.getString("item")
        let ammount = options.getInteger("ammount")
        let user = options.getUser("mention")
        if(!user) {
            let id = options.getString("user_id")
            if(!id) id = interaction.user.id;
            user = client.users.cache.get(id) || interaction.guild.users.cache.get(id).user;
            if(!user) {
                return await interaction.editReply({ content: `Unable To Find The Specified User!` })
            }
        }
        let _user = await User.findOne({ id: user.id });
        if(!_user) return await interaction.editReply({ content: `The Mentioned User Have Not Picked Their Starter Yet.`})
        item = item.toLowerCase().replace(/ /g, "")
        if(item == "credits") _user.credits += ammount;
        if(item == "crystals") _user.crystals += ammount;
        if(item == "greatball") _user.greatball += ammount;
        if(item == "ultraball") _user.ultraball += ammount;
        if(item == "masterball") _user.masterball += ammount;
        if(item == "summons") _user.summons += ammount;
        await _user.save();
        return await interaction.editReply({ content: `Successfully Added \`${ammount.toLocaleString()}\` To <@${user.id}>.`, ephemeral: true })
    }
}