const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require("discord.js")
const Trade = require("../../models/trade.js")
const User = require("../../models/user.js")

module.exports = {
    name: "add",
    description: "Add An Item In Trades.",
    trade: true,
    options: [
        {"StringChoices": { name: "item", description: "What Do You Wish To Add?", required: true, choices: [
            ["credits", "credits"],
            ["summons", "summons"],
            ["crystals", "crystals"],
            ["pokemon", "pokemon"]
        ]}},
        {"Integer": { name: "id_or_amt", description: `if adding pokemon, specify the slot id, else specify the ammount of item.`, required: true }}
    ],
    run: async (client, interaction, color) => {
        let user = await User.findOne({ id: interaction.user.id })
        if(!user) return interaction.reply({ content: `You Have Not Started Yet, Run \`/start\` command to pick a starter.`})
        let trade = await Trade.findOne({ id1: interaction.user.id });
        let _trade = await Trade.findOne({ id2: interaction.user.id });
        if(!trade && !_trade) return interaction.reply(`You Are Not Already Trading With Someone!`)
        let item = interaction.options.getString("item")
        let id_or_amt = interaction.options.getInteger("id_or_amt")
        if(item == "pokemon") {
            let poke = user.pokemons[id_or_amt - 1]
            if(!poke) {
                return interaction.reply({ content: `Invalid Pokémon id Provided.`, ephemeral: true })
            }
        } else {
            if(id_or_amt < 1 && item !== "pokemon") {
                return interaction.reply({ content: `Ammount Cannot Be Less Than 1.`, ephemeral: true })
            }
        }
        if(trade) {
            if(item == "pokemon") {
                let index = trade.pokemon1.indexOf(user.pokemons[id_or_amt] - 1)
                if(index > -1) return interaction.reply(`That Pokémon is Already Added To The Trades!`)
                trade.pokemon1.push(user.pokemons[id_or_amt - 1]);trade.confirm1 = false;trade.confirm2 = false;await trade.save()
            }
            if(item == "credits") {
                if(user.credits < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((trade.credit1 + id_or_amt) > user.credits) return interaction.reply(`You Don't Have Enough ${item}.`)
                trade.confirm1 = false;
                trade.confirm2 = false;
                trade.credit1 += id_or_amt
                await trade.save()
            }
            if(item == "summons") {
                if(user.summons < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((trade.summon1 + id_or_amt) > user.summons) return interaction.reply(`You Don't Have Enough ${item}.`)
                trade.confirm1 = false;
                trade.confirm2 = false;
                trade.summon1 += id_or_amt
                await trade.save()
            }
            if(item == "crystals") {
                if(user.crystals < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((trade.crystal1 + id_or_amt) > user.crystals) return interaction.reply(`You Don't Have Enough ${item}.`)
                trade.confirm1 = false;
                trade.confirm2 = false;
                trade.crystal1 += id_or_amt
                await trade.save()
            }
            let first_array = new Array();
            if(trade.credit1 > 0) first_array.push(`${trade.credit1} Credits`)
            if(trade.summon1 > 0) first_array.push(`${trade.summon1} Summons`)
            if(trade.crystal1 > 0) first_array.push(`${trade.crystal1} Crystals`)
            if(trade.pokemon1.length > 0) first_array.push(`${trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            let second_array = new Array();
            if(trade.credit2 > 0) second_array.push(`${trade.credit2} Credits`)
            if(trade.summon2 > 0) second_array.push(`${trade.summon2} Summons`)
            if(trade.crystal2 > 0) second_array.push(`${trade.crystal2} Crystals`)
            if(trade.pokemon2.length > 0) second_array.push(`${trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            if(second_array.length < 1) second_array.push(`No Items Added.`)
            if(first_array.length < 1) first_array.push(`No Items Added.`)
            interaction.reply({ content: `Success!`, ephemeral: true })
            return interaction.channel.send({
                embeds: [new MessageEmbed()
                .setTitle(`Trade Between ${trade.tag1} And ${trade.tag2}`)
                .setColor(color)
                .setTimestamp()
                .setDescription(`Successfully Added Items In The Trade.`)
                .addFields(
                    { name: `🔴 ${trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                    { name: `🔴 ${trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                )],
                components: [new MessageActionRow()
                .addComponents([
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setCustomId("confirm_trade")
                    //.setDisabled(true)
                    .setLabel("Confirm Trade"),
                    new MessageButton()
                    .setStyle("DANGER")
                    .setCustomId("decline_trade")
                    .setLabel("Cancel Trade")
                ])]
            })
        } else {
            if(item == "pokemon") {
                let index = _trade.pokemon2.indexOf(user.pokemons[id_or_amt] - 1)
                if(index > -1) return interaction.reply(`That Pokémon is Already Added To The Trades!`)
                _trade.pokemon2.push(user.pokemons[id_or_amt - 1]);_trade.confirm1 = false;_trade.confirm2 = false;await _trade.save()
            }
            if(item == "credits") {
                if(user.credits < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((_trade.credit2 + id_or_amt) > user.credits) return interaction.reply(`You Don't Have Enough ${item}.`)
                _trade.confirm1 = false;
                _trade.confirm2 = false;
                _trade.credit2 += id_or_amt
                await _trade.save()
            }
            if(item == "summons") {
                if(user.summons < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((trade.summon2 + id_or_amt) > user.summons) return interaction.reply(`You Don't Have Enough ${item}.`)
                _trade.confirm1 = false;
                _trade.confirm2 = false;
                trade.summon2 += id_or_amt
                await _trade.save()
            }
            if(item == "crystals") {
                if(user.crystals < id_or_amt) return interaction.reply(`You Don't Have Enough ${item}.`)
                if((_trade.crystal2 + id_or_amt) > user.crystals) return interaction.reply(`You Don't Have Enough ${item}.`)
                _trade.confirm1 = false;
                _trade.confirm2 = false;
                _trade.crystal2 += id_or_amt
                await _trade.save()
            }
            let first_array = new Array();
            if(_trade.credit1 > 0) first_array.push(`${_trade.credit1} Credits`)
            if(_trade.summon1 > 0) first_array.push(`${_trade.summon1} Summons`)
            if(_trade.crystal1 > 0) first_array.push(`${_trade.crystal1} Crystals`)
            if(_trade.pokemon1.length > 0) first_array.push(`${_trade.pokemon1.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            let second_array = new Array();
            if(_trade.credit2 > 0) second_array.push(`${_trade.credit2} Credits`)
            if(_trade.summon2 > 0) second_array.push(`${_trade.summon2} Summons`)
            if(_trade.crystal2 > 0) second_array.push(`${_trade.crystal2} Crystals`)
            if(_trade.pokemon2.length > 0) second_array.push(`${_trade.pokemon2.map(r => `${r.shiny == true ? "✨ " : ""}${r.name} ${r.totalIV}%`).join("\n")}`)
            if(second_array.length < 1) second_array.push(`No Items Added.`)
            if(first_array.length < 1) first_array.push(`No Items Added.`)
            interaction.reply({ content: `Success!`, ephemeral: true })
            return interaction.channel.send({
                embeds: [new MessageEmbed()
                .setTitle(`Trade Between ${_trade.tag1} And ${_trade.tag2}`)
                .setColor(color)
                .setTimestamp()
                .setDescription(`Successfully Added Items In The Trade.`)
                .addFields(
                    { name: `🔴 ${_trade.username1}'s side`, value: `${first_array.join("\n")}`, inline: true },
                    { name: `🔴 ${_trade.username2}'s side`, value: `${second_array.join("\n")}`, inline: true }
                )],
                components: [new MessageActionRow()
                .addComponents([
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setCustomId("confirm_trade")
                    //.setDisabled(true)
                    .setLabel("Confirm Trade"),
                    new MessageButton()
                    .setStyle("DANGER")
                    .setCustomId("decline_trade")
                    .setLabel("Cancel Trade")
                ])]
            })
        }
    }
}