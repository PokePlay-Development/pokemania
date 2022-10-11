const User = require("../../models/user.js")


module.exports = {
    name: `delete`,
    description: `Delete A User Account!`,
    developer: true,
    admin: true,
    options: [
        {"User": { name: `mention`, description: `Mention A User You Wish To Delete!`, required: true }}
    ],
    run: async (client, interaction, color) => {
        let mention = interaction.options.getUser("mention")
        let user = await User.findOne({ id: mention.id })
        if(!user) {
            return interaction.reply({ content: `The Mentioned User Have Not Picked A Starter Yet.`})
        }
        User.findOneAndDelete({ id: mention.id }, async (err, res) => {
            if(err) return interaction.reply(`${err}`)
            if(res) return interaction.reply({ content: `Successfully Deleted The User Account of \`${mention.tag}\``})
        })
    }
}