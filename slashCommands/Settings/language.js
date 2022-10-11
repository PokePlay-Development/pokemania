module.exports = {
    name: "language",
    description: "Change The Default Language For This Server",
    options: [
        {"StringChoices": { name: `language`, description: `choose from our variety of languages!`, required: true, choices: [["english", "english"], ["hindi", "hindi"]]}}
    ],
    administrator: true,
    run: async (client, interaction, color, support, guild) => {
        let enlang = require("../../languages/english.js")
        let inlang = require("../../languages/hindi.js")
        const { options } = interaction;
        let language = options.getString("language")
        if(language == "english") {
            guild.language = "english"
            await guild.save()
            return interaction.reply({ content: `${enlang.now_talk_in}`})
        }
        if(language == "hindi") {
            guild.language = "hindi"
            await guild.save()
            return interaction.reply({ content: `${inlang.now_talk_in}`})
        }
    }
}