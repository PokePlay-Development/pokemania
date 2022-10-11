module.exports = async (client) => {
    console.log(`[LOGGED INTO CLIENT]`.green, `Logged Into `.white + `${client.user.tag}`.green)
    require("mongoose").connect("mongodb+srv://JazzZ:MypsBxFasrtQ0ZKs@mewcord.9giqjvb.mongodb.net/?retryWrites=true&w=majority").then(() => {
        console.log(`[DATABASE]`.green, `Successfully Connected To The Database`.bold.cyan)
    }).catch(e => {
        console.log(`[DATABASE]`.red, `${e}`.bold.yellow)
    })
    
}