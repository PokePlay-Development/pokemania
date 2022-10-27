const User = require("../../models/user");
module.exports = async (client) => {
    console.log(`[LOGGED INTO CLIENT]`.green, `Logged Into `.white + `${client.user.tag}`.green)
    require("mongoose").connect("mongodb+srv://JazzZ:MypsBxFasrtQ0ZKs@mewcord.9giqjvb.mongodb.net/?retryWrites=true&w=majority").then(() => {
        console.log(`[DATABASE]`.green, `Successfully Connected To The Database`.bold.cyan)
    }).catch(e => {
        console.log(`[DATABASE]`.red, `${e}`.bold.yellow)
    })
    client.user.setActivity(`/pokemon • pokemania.bot`, {type: 'PLAYING'});
    async function check_time_and_rest_quest() {
        var date = new Date();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        let seconds = date.getSeconds();
        if(hour == 24 && minutes == 0 && seconds == 10) {
            console.log(`[QUESTS]`.green, `Resetting Quests...`.bold.cyan)
            let users = await User.find({})
            users.forEach(async user => {
                user.q1 = false;
                user.q2 = false;
                user.q3 = false;
                user.q4 = false;
                user.q5 = false;
                user.q6 = false;
                user.qcaught = 0;
                await user.save()
            })
        } else {
            console.log(`[QUESTS]`.green, `It's Not Time To Reset Quests Yet!`.bold.cyan)
            setTimeout(async function () {
                check_time_and_rest_quest();
                console.log(`[QUESTS]`.green, `Checking Quests!`.bold.cyan)
            }, 1000)
        }
    }
}