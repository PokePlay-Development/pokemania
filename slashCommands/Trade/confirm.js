const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const Trade = require("../../models/trade.js")
const User = require("../../models/user.js")
module.exports = {
    name: "confirm",
    description: "Execute The Trade.",
    run: async (client, interaction, color) => {
        let trade = await Trade.findOne({ id1: interaction.user.id });
        let _trade = await Trade.findOne({ id2: interaction.user.id });
        if (!trade && !_trade) return interaction.reply(`You Are Not in A Trade.`)
        if (trade) {
            if (trade.confirm1 == true && trade.confirm2 !== true) {
                return interaction.reply(`You Have Already Confirmed The Trades.`)
            }
            if (trade.confirm1 !== true && trade.confirm2 !== true) {
                trade.confirm1 = true;
                await trade.save()
                let first_array = new Array();
                if (trade.credit1 > 0) first_array.push(`${trade.credit1} Credits`)
                if (trade.summon1 > 0) first_array.push(`${trade.summon1} Summons`)
                if (trade.crystal1 > 0) first_array.push(`${trade.crystal1} Crystals`)
                if (trade.pokemon1.length > 0) first_array.push(`${trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
                let second_array = new Array();
                if (trade.credit2 > 0) second_array.push(`${trade.credit2} Credits`)
                if (trade.summon2 > 0) second_array.push(`${trade.summon2} Summons`)
                if (trade.crystal2 > 0) second_array.push(`${trade.crystal2} Crystals`)
                if (trade.pokemon2.length > 0) second_array.push(`${trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
                if (second_array.length < 1) second_array.push(`No Items Added.`)
                if (first_array.length < 1) first_array.push(`No Items Added.`)
                interaction.reply({ content: `Success!`, ephemeral: true })
                return interaction.channel.send({
                    embeds: [new MessageEmbed()
                        .setTitle(`Trade Between ${trade.tag1} And ${trade.tag2}`)
                        .setColor(color)
                        .setTimestamp()
                        .setDescription(`Successfully Confirmed The Trade.`)
                        .addFields(
                            { name: `🟢 ${trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                            { name: `🔴 ${trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                        )],
                    components: [new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                                .setStyle("SUCCESS")
                                .setCustomId("confirm_trade")
                                .setLabel("Confirm Trade"),
                            new MessageButton()
                                .setStyle("DANGER")
                                .setCustomId("decline_trade")
                                .setLabel("Cancel Trade")
                        ])]
                })
            }
            let user = await User.findOne({ id: trade.id1 });
            let _user = await User.findOne({ id: trade.id2 });
            user.credits = user.credits - trade.credit1;
            user.summons = user.summons - trade.summon1;
            user.crystals = user.crystals - trade.crystal1;
            user.credits += trade.credit2;
            user.summons += trade.summon2;
            user.crystals += trade.crystal2;
            let user_poke = user.pokemons;
            let user_poke1 = _user.pokemons;
            trade.pokemon1.forEach(poke => {
                user_poke1.push(poke)
                let index = user_poke.indexOf(poke)
                if (index > -1) {
                    user_poke.splice(index, 1)
                }
            })
            trade.pokemon2.forEach(poke => {
                user_poke.push(poke)
                let index = user_poke1.indexOf(poke)
                if (index > -1) {
                    user_poke1.splice(index, 1)
                }
            })
            _user.credits = user.credits - trade.credit2;
            _user.crystals = user.crystals - trade.crystal2;
            user.summons = user.summons - trade.summon2;
            _user.credits += trade.credit1;
            _user.summons += trade.summon1;
            _user.crystals += trade.crystal1;
            _user.pokemons = user_poke1;
            user.pokemons = user_poke;
            user.markModified(`pokemons`)
            _user.markModified(`pokemons`)
            await user.save()
            await _user.save()
            let first_array = new Array();
            if (trade.credit1 > 0) first_array.push(`${trade.credit1} Credits`)
            if (trade.summon1 > 0) first_array.push(`${trade.summon1} Summons`)
            if (trade.crystal1 > 0) first_array.push(`${trade.crystal1} Crystals`)
            if (trade.pokemon1.length > 0) first_array.push(`${trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            let second_array = new Array();
            if (trade.credit2 > 0) second_array.push(`${trade.credit2} Credits`)
            if (trade.summon2 > 0) second_array.push(`${trade.summon2} Summons`)
            if (trade.crystal2 > 0) second_array.push(`${trade.crystal2} Crystals`)
            if (trade.pokemon2.length > 0) second_array.push(`${trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            if (second_array.length < 1) second_array.push(`No Items Added.`)
            if (first_array.length < 1) first_array.push(`No Items Added.`)
            interaction.reply({ content: `Success!`, ephemeral: true })
            let msg = await interaction.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle(`Trade Between ${trade.tag1} And ${trade.tag2}`)
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`Successfully Executed The Trade.`)
                    .addFields(
                        { name: `🟢 ${trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                        { name: `🟢 ${trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                    )]
            })
            Trade.findOneAndDelete({ id1: interaction.user.id }, async (err, res) => {
                if (res) await msg.react("✅")
                if (err) await msg.react("❌")
            })
        } else if (_trade) {
            if (_trade.confirm2 == true && _trade.confirm1 !== true) {
                return interaction.reply({ content: `You Have Already Confirmed The Trades.`, ephemeral: true })
            }
            if (_trade.confirm2 !== true && _trade.confirm1 !== true) {
                _trade.confirm2 = true;
                await _trade.save()
                let first_array = new Array();
                if (_trade.credit1 > 0) first_array.push(`${_trade.credit1} Credits`)
                if (_trade.summon1 > 0) first_array.push(`${_trade.summon1} Summons`)
                if (_trade.crystal1 > 0) first_array.push(`${_trade.crystal1} Crystals`)
                if (_trade.pokemon1.length > 0) first_array.push(`${_trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
                let second_array = new Array();
                if (_trade.credit2 > 0) second_array.push(`${_trade.credit2} Credits`)
                if (_trade.summon2 > 0) second_array.push(`${_trade.summon2} Summons`)
                if (_trade.crystal2 > 0) second_array.push(`${_trade.crystal2} Crystals`)
                if (_trade.pokemon2.length > 0) second_array.push(`${_trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
                if (second_array.length < 1) second_array.push(`No Items Added.`)
                if (first_array.length < 1) first_array.push(`No Items Added.`)
                interaction.reply({ content: `Success!`, ephemeral: true })
                return interaction.channel.send({
                    embeds: [new MessageEmbed()
                        .setTitle(`Trade Between ${_trade.tag1} And ${_trade.tag2}`)
                        .setColor(color)
                        .setTimestamp()
                        .setDescription(`Successfully Confirmed The Trade.`)
                        .addFields(
                            { name: `🔴 ${_trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                            { name: `🟢 ${_trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                        )],
                    components: [new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                                .setStyle("SUCCESS")
                                .setCustomId("confirm_trade")
                                .setLabel("Confirm Trade"),
                            new MessageButton()
                                .setStyle("DANGER")
                                .setCustomId("decline_trade")
                                .setLabel("Cancel Trade")
                        ])]
                })
            }
            let user = await User.findOne({ id: _trade.id1 });
            let _user = await User.findOne({ id: _trade.id2 });
            user.credits = user.credits - _trade.credit1;
            user.summons = user.summons - _trade.summon1;
            user.crystals = user.crystals - _trade.crystal1;
            user.credits += _trade.credit2;
            user.summons += _trade.summon2;
            user.crystals += _trade.crystal2;
            let user_poke = user.pokemons;
            let user_poke1 = _user.pokemons;
            _trade.pokemon1.forEach(poke => {
                user_poke1.push(poke)
                let index = user_poke.indexOf(poke)
                if (index > -1) {
                    user_poke.splice(index, 1)
                }
            })
            _trade.pokemon2.forEach(poke => {
                user_poke.push(poke)
                let index = user_poke1.indexOf(poke)
                if (index > -1) {
                    user_poke1.splice(index, 1)
                }
            })
            _user.credits = _user.credits - _trade.credit2;
            _user.crystals = _user.crystals - _trade.crystal2;
            user.summons = user.summons - _trade.summon2;
            _user.credits += _trade.credit1;
            _user.summons += _trade.summon1;
            _user.crystals += _trade.crystal1;
            _user.pokemons = user_poke1;
            user.pokemons = user_poke;
            user.markModified(`pokemons`)
            _user.markModified(`pokemons`)
            await user.save()
            await _user.save()
            let first_array = new Array();
            if (_trade.credit1 > 0) first_array.push(`${_trade.credit1} Credits`)
            if (_trade.summon1 > 0) first_array.push(`${_trade.summon1} Summons`)
            if (_trade.crystal1 > 0) first_array.push(`${_trade.crystal1} Crystals`)
            if (_trade.pokemon1.length > 0) first_array.push(`${_trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            let second_array = new Array();
            if (_trade.credit2 > 0) second_array.push(`${_trade.credit2} Credits`)
            if (_trade.summon2 > 0) second_array.push(`${_trade.summon2} Summons`)
            if (_trade.crystal2 > 0) second_array.push(`${_trade.crystal2} Crystals`)
            if (_trade.pokemon2.length > 0) second_array.push(`${_trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            if (second_array.length < 1) second_array.push(`No Items Added.`)
            if (first_array.length < 1) first_array.push(`No Items Added.`)
            interaction.reply({ content: `Success!`, ephemeral: true })
            let msg = await interaction.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle(`Trade Between ${_trade.tag1} And ${_trade.tag2}`)
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`Successfully Executed The Trade.`)
                    .addFields(
                        { name: `🟢 ${_trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                        { name: `🟢 ${_trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                    )]
            })
            Trade.findOneAndDelete({ id2: interaction.user.id }, async (err, res) => {
                if (res) await msg.react("✅")
                if (err) await msg.react("❌")
            })
        }
    }
}