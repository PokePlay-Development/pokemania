const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js");
const Trade = require("../models/trade");
const User = require("../models/user");
const { color } = require("../settings.json").embeds;
module.exports = {
    run: async (client, interaction) => {
        let check = await User.findOne({ id: interaction.user.id });
        if(!check) return interaction.reply({ content: `You Have Not Started Yet, Type \`/start\` To Pick A Starter!`, ephemeral: true });
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
            user.credits -= trade.credit1;
            user.summons -= trade.summon1;
            user.crystals -= trade.crystal1;
            user.credits += trade.credit2;
            user.summons += trade.summon2;
            user.crystals += trade.crystal2;
            _user.summons += trade.summon1;
            _user.crystals += trade.crystal1;
            _user.credits += trade.credit1;
            _user.credits -= trade.credit2;
            _user.summons -= trade.summon2;
            _user.crystals -= trade.crystal2;
            let done = false;
            let len = trade.pokemon1.length;
            let pokemons = user.pokemons;
            pokemons = pokemons.filter(r => {
                let e = JSON.stringify(r);
                let poke = trade.pokemon1.find(k => e == JSON.stringify(k));
                if (!poke) {
                    return r;
                }
            })
            let _pokemons = _user.pokemons;
            _pokemons = _pokemons.filter(r => {
                let e = JSON.stringify(r);
                let poke = trade.pokemon2.find(k => e == JSON.stringify(k));
                if (!poke) {
                    return r;
                }
            })
            if (pokemons.length + trade.pokemon2.length > 50) {
                return interaction.channel.send({ content: `You Can't Trade More Than 50 Pokemons!`, ephemeral: true })
            }
            if (_pokemons.length + trade.pokemon1.length > 50) {
                return interaction.channel.send({ content: `You Can't Trade More Than 50 Pokemons!`, ephemeral: true })
            }
            trade.pokemon2.forEach(r => {
                pokemons.push(r)
            })
            trade.pokemon1.forEach(r => {
                _pokemons.push(r)
            })
            _user.pokemons = _pokemons;
            user.pokemons = pokemons;
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
            user.credits -= _trade.credit1;
            user.summons -= _trade.summon1;
            user.crystals -= _trade.crystal1;
            user.credits += _trade.credit2;
            user.summons += _trade.summon2;
            user.crystals += _trade.crystal2;
            _user.summons += _trade.summon1;
            _user.crystals += _trade.crystal1;
            _user.credits += _trade.credit1;
            _user.credits -= _trade.credit2;
            _user.summons -= _trade.summon2;
            _user.crystals -= _trade.crystal2;
            let done = false;
            let len = _trade.pokemon1.length;
            let pokemons = user.pokemons;
            pokemons = pokemons.filter(r => {
                let e = JSON.stringify(r);
                let poke = _trade.pokemon1.find(k => e == JSON.stringify(k));
                if (!poke) {
                    return r;
                }
            })
            let _pokemons = _user.pokemons;
            _pokemons = _pokemons.filter(r => {
                let e = JSON.stringify(r);
                let poke = _trade.pokemon2.find(k => e == JSON.stringify(k));
                if (!poke) {
                    return r;
                }
            })
            if (pokemons.length + _trade.pokemon2.length > 50) {
                return interaction.channel.send({ content: `You Can't trade More Than 50 Pokemons!`, ephemeral: true })
            }
            if (_pokemons.length + _trade.pokemon1.length > 50) {
                return interaction.channel.send({ content: `You Can't Trade More Than 50 Pokemons!`, ephemeral: true })
            }
            _trade.pokemon2.forEach(r => {
                pokemons.push(r)
            })
            _trade.pokemon1.forEach(r => {
                _pokemons.push(r)
            })
            _user.pokemons = _pokemons;
            user.pokemons = pokemons;
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
