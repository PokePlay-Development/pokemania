const Guild = require("../../models/guild.js")
const {
	MessageButton,
	MessageEmbed,
	MessageActionRow,
	MessageAttachment,
	Permissions,
	Collection
} = require("discord.js")
const Spawn = require("../../models/spawn.js");
const User = require("../../models/user.js");
const Pokemon = require("../../classes/pokemon");
const { instanceToPlain } = require("class-transformer");
const { color } = require("../../settings.json").embeds;
const fetch = require("node-fetch");
const Canvas = require("canvas");
const Trade = require("../../models/trade")
module.exports = async (client, interaction) => {
	let command = false;
	const CategoryName = interaction.commandName;
	try {
		if (client.slashCommands.has(CategoryName + interaction.options.getSubcommand())) {
			command = client.slashCommands.get(CategoryName + interaction.options.getSubcommand());
		}
	} catch {
		if (client.slashCommands.has("normal" + CategoryName)) {
			command = client.slashCommands.get("normal" + CategoryName);
		}
	}
	if (command) {
		const { support } = require("../../settings.json")
		if (client.battles.find(r => r.id == interaction.user.id) || client.battles.find(r => r.id2 == interaction.user.id)) {
			return interaction.reply({ content: `You Are Already In A Battle!`, ephemeral: true })
		}
		let _Trade = await Trade.findOne({ id1: interaction.user.id })
		if (!_Trade) _Trade = await Trade.findOne({ id2: interaction.user.id })
		if (_Trade) {
			if (!command.trade) {
				return interaction.reply(`You Cannot Run This Command Since You Are in A Trade.`)
			}
		}
		if (command.developer && command.admin && command.admin == true && command.developer == true) {
			let admin = ["1031202011338788926", "689079888896065571","535376623378104320", "143490319520890881", "918735955123388436", "841667029165015081"]
			if (!admin.includes(interaction.user.id)) {
				return interaction.reply({ content: `Only **${client.user.username}'s** Admins/Developers Can Run This Command.` })
			}
		}
		if (command.developer && command.developer == true && command.admin && command.admin !== true) {
			let developers = ["1031202011338788926", "689079888896065571"]
			if (!developers.includes(interaction.user.id)) {
				return interaction.reply({ content: `Only **${client.user.username}'s** Developers/Owners Can Run This Command.`, ephemeral: true })
			}
		}
		if (command.administrator && command.administrator == true) {
			if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
				return interaction.reply({ content: `Only **Server Admins** Can Run This Command.` })
			}
		}
		if (onCoolDown(interaction, command)) {
			return interaction.reply(`The **${command.name}** Command is Currently on CoolDown! Try Again in ${onCoolDown(interaction, command)} Minutes!`)
		}
		let guild = await Guild.findOne({ id: interaction.guild.id })
		if (!guild) await new Guild({ id: interaction.guild.id }).save()
		guild = await Guild.findOne({ id: interaction.guild.id })
		command.run(client, interaction, color, support, guild)
	}
/**
 * @INFO
 * ADDED BUTTON HANDLING SINCE THIS FILE WAS GETTING TOO BIG lol.
 * @INFO
 */

	if (interaction.isButton()) {
	const button_file = require("node:fs").readdirSync(`${process.cwd()}/buttons/`).filter(file => file.split(".")[0] == interaction.customId);
	if (button_file.length > 0 && button_file.length < 2) {
		const button = require(`${process.cwd()}/buttons/${button_file[0]}`);
		button.run(client, interaction);
	}
/**
 * @INFO
 * ADDED BUTTON HANDLING SINCE THIS FILE WAS GETTING TOO BIG lol.
 * @INFO
 */







		if (interaction.customId == "decline_trade") {
			let trade = await Trade.findOne({ id1: interaction.user.id })
			let _trade = await Trade.findOne({ id2: interaction.user.id })
			if (!trade && !_trade) return interaction.reply({ content: `You're Not in A Trade.`, ephemeral: true })
			if (trade) {
				Trade.findOneAndDelete({ id1: interaction.user.id }, async (err, res) => {
					if (res) return interaction.reply({ content: `Successfully Cancelled Your Trades.`, ephemeral: true })
				})
			} else {
				Trade.findOneAndDelete({ id2: interaction.user.id }, async (err, res) => {
					if (res) return interaction.reply({ content: `Successfully Cancelled Your Trades.`, ephemeral: true })
				})
			}
		}
		// spawns buttons
		if (interaction.customId == "throw_ball") {
			let spawn = await Spawn.findOne({ id: interaction.channel.id })
			if (!spawn) return console.log("no spawn.")
			//console.log(spawn)
			let user = await User.findOne({ id: interaction.user.id })
			if (!user) {
				return interaction.reply({ content: `Uh Oh! Looks Like You Have Not Picked Your Starter yet!\nType \`/pick\` To Pick Your Starter!` })
			}
			await interaction.reply({ content: `**${interaction.user.tag}** is Choosing Their Move!` })
			await interaction.message.edit({ components: [] })

			let _msg = await interaction.followUp({
				content: `Below Given Are The **PokéBalls** You Can Choose From!`,
				ephemeral: true,
				components: [new MessageActionRow()
					.addComponents([
						new MessageButton()
							.setStyle("SECONDARY")
							.setCustomId("normal_ball")
							.setLabel("Normal Ball"),
						//.setEmoji("<:pokeball:1022147275339870259>"),
						new MessageButton()
							.setStyle("SECONDARY")
							.setCustomId("great_ball")
							.setLabel("Great Ball"),
						//.setEmoji("<:greatball:1022146948750389308>")
						new MessageButton()
							.setStyle("SECONDARY")
							.setLabel("Ultra Ball")
							//.setEmoji("<:ultraball:1022147018291957790>")
							.setCustomId("ultra_ball"),
						new MessageButton()
							.setStyle("SECONDARY")
							.setLabel("Master Ball")
							//.setEmoji("<:masterball:1022147106129068073>")
							.setCustomId("master_ball")
					])]
			})
			const filter = i => {
				if (i.user.id == interaction.user.id) return true;
				else return false
			}
			const collector = await _msg.createMessageComponentCollector({
				filter,
				time: 30000
			})
			collector.on("end", async (collected) => {
				if (collected.size == 0) {
					interaction.followUp({ content: `Time's Up!`, ephemeral: true })
					await Spawn.findOneAndDelete({ id: interaction.channel.id }, (err, res) => {
						if (res) interaction.message.edit({ content: `The User Did Not Respond! The Wild **${spawn.pokename}** Fled!` })
						if (err) interaction.message.edit({ content: `The Spawn Was Errored.` })
					})
				}
			})
			let failed = false;
			let captured = false;
			collector.on("collect", async (click) => {
				if (click.customId == "normal_ball") {
					let chance = getRandomNumberBetween(1, 100)
					if (chance > 15) {
						failed = true;
					} else {
						captured = true;
					}
					await collector.stop()
				}
				if (click.customId == "great_ball") {
					if (user.greatball <= 0) {
						return click.reply({ content: `You Don't Own Enough Great Balls!` })
					} else {
						user.greatball = user.greatball - 1;
						await user.save()
					}
					let chance = getRandomNumberBetween(1, 100)
					if (chance > 41) {
						failed = true;
					} else {
						captured = true;
					}
					await collector.stop()
				}
				if (click.customId == "ultra_ball") {
					if (user.ultraball <= 0) {
						return click.reply({ content: `You Don't Own Enough Ultra Balls!` })
					} else {
						user.ultraball = user.ultraball - 1;
						await user.save()
					}
					let chance = getRandomNumberBetween(1, 100)
					if (chance > 62) {
						failed = true;
					} else {
						captured = true;
					}
					await collector.stop()
				}
				if (click.customId == "master_ball") {
					if (user.masterball <= 0) {
						return click.reply({ content: `You Don't Own Enough Master Balls!` })
					} else {
						user.masterball = user.masterball - 1;
						await user.save()
					}
					captured = true
					await collector.stop()
				}
				await click.reply({ content: `SuccessFully Thrown A ${click.customId.replace(/_/g, " ")}!`, ephemeral: true })
				if (captured == true) {
					fetch(`https://pokeapi.co/api/v2/pokemon/${spawn.pokename}`).catch(e => { return })
						.then(res => res.json()).catch(e => { return })
						.then(async data => {
							fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.name}`)
								.then(res => res.json())
								.then(async deta => {
									let genarray = new Array("male", "female")
									let gender = genarray[Math.floor(Math.random() * 2)];
									if (deta.gender_rate < 0) gender = "none";
									let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
									let poke = new Pokemon({ gender: gender, name: data.name, url: url, level: Math.floor(Math.random() * 45), shiny: false, index: user.pokemons.length })
									poke = instanceToPlain(poke)
									let yes_send = new MessageButton().setStyle("SUCCESS").setCustomId("send_to_center").setLabel("Yes Send To Center")
									let no_send = new MessageButton().setStyle("DANGER").setCustomId("no_send_to_center").setLabel("No Keep It.")
									const _row = [new MessageActionRow().addComponents([yes_send, no_send])]
									let nmsg = await interaction.channel.send({
										embeds: [new MessageEmbed()
											.setTitle(`${interaction.user.username} Throws A ${click.customId.replace(/_/g, " ")}!`)
											.setColor(color)
											.setDescription(`They Successfully Caught A **${data.name}**!`)
											.addFields({ name: `\u200B`, value: `Would You Like To Send This Pokémon To Pokémon Center?` })
										],
										components: _row
									})
									const _filter = i => {
										if (i.user.id == interaction.user.id) return true;
										else return i.reply({ content: `Sorry! This Button is Not For You!`, ephemeral: true })
									}
									const _collector = nmsg.createMessageComponentCollector({
										_filter,
										max: 1,
										time: 30000
									})
									_collector.on("collect", async (collect) => {
										if (collect.customId == "send_to_center") {
											user.pokemons1.push(poke)
											user.caught.push(poke)
											user.qcaught.push(poke)
											await user.save()
											if(user.qcaught.length >= 10 && user.q1 == false) {
												user = await User.findOne({ id: interaction.user.id })
												user.credits = user.credits + 1000
												user.q1 = true
												await user.save()
												await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
											}
											return collect.reply({ content: `**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										} else {
											if (user.pokemons.length >= 6) {
												user.pokemons1.push(poke)
												user.caught.push(poke)
												user.qcaught.push(poke)
												await user.save()
												if(user.qcaught.length >= 10 && user.q1 == false) {
													user = await User.findOne({ id: interaction.user.id })
													user.credits = user.credits + 1000
													user.q1 = true
													await user.save()
													await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
												}
												return collect.reply({ content: `Your **Pokémon Slots** Are Currently Full! Sent The Pokémon To Pokémon Center.` })
											} else {
												user.pokemons.push(poke)
												user.caught.push(poke)
												user.qcaught.push(poke)
												await user.save()
												if(user.qcaught.length >= 10 && user.q1 == false) {
													user = await User.findOne({ id: interaction.user.id })
													user.credits = user.credits + 1000
													user.q1 = true
													await user.save()
													await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
												}
												return collect.reply({ content: `**Successfully** Added **${data.name}** To Your Pokémon Slots!` })
											}
										}
									})
									_collector.on("end", async (collected) => {
										if (collected.size <= 0) {
											user.pokemons1.push(poke)
											user.caught.push(poke)
											await user.save()
											return interaction.channel.send({ content: `There Was **No Response** From The Trainer,\n**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										}
									})
								}).catch(async e => {
									let gender = "none";
									let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
									let poke = new Pokemon({ gender: gender, name: data.name, url: url, level: Math.floor(Math.random() * 45), shiny: false, index: user.pokemons.length })
									poke = instanceToPlain(poke)
									let yes_send = new MessageButton().setStyle("SUCCESS").setCustomId("send_to_center").setLabel("Yes Send To Center")
									let no_send = new MessageButton().setStyle("DANGER").setCustomId("no_send_to_center").setLabel("No Keep It.")
									const _row = [new MessageActionRow().addComponents([yes_send, no_send])]
									let nmsg = await interaction.channel.send({
										embeds: [new MessageEmbed()
											.setTitle(`${interaction.user.username} Throws A ${click.customId.replace(/_/g, " ")}!`)
											.setColor(color)
											.setDescription(`They Successfully Caught A **${data.name}**!`)
											.addFields({ name: `\u200B`, value: `Would You Like To Send This Pokémon To Pokémon Center?` })
										],
										components: _row
									})
									const _filter = i => {
										if (i.user.id == interaction.user.id) return true;
										else return i.reply({ content: `Sorry! This Button is Not For You!`, ephemeral: true })
									}
									const _collector = nmsg.createMessageComponentCollector({
										_filter,
										max: 1,
										time: 30000
									})
									_collector.on("collect", async (collect) => {
										if (collect.customId == "send_to_center") {
											user.pokemons1.push(poke)
											user.caught.push(poke)
											user.qcaught.push(poke)
											await user.save()
											if(user.qcaught.length >= 10 && user.q1 == false) {
												user = await User.findOne({ id: interaction.user.id })
												user.credits = user.credits + 1000
												user.q1 = true
												await user.save()
												await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
											}
											return collect.reply({ content: `**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										} else {
											if (user.pokemons.length >= 6) {
												user.pokemons1.push(poke)
												user.caught.push(poke)
												user.qcaught.push(poke)
												await user.save()
												if(user.qcaught.length >= 10 && user.q1 == false) {
													user = await User.findOne({ id: interaction.user.id })
													user.credits = user.credits + 1000
													user.q1 = true
													await user.save()
													await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
												}
												return collect.reply({ content: `Your **Pokémon Slots** Are Currently Full! Sent The Pokémon To Pokémon Center.` })
											} else {
												user.pokemons.push(poke)
												user.caught.push(poke)
												user.qcaught.push(poke)
												await user.save()
												if(user.qcaught.length >= 10 && user.q1 == false) {
													user = await User.findOne({ id: interaction.user.id })
													user.credits = user.credits + 1000
													user.q1 = true
													await user.save()
													await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
												}
												return collect.reply({ content: `**Successfully** Added **${data.name}** To Your Pokémon Slots!` })
											}
										}
									})
									_collector.on("end", async (collected) => {
										if (collected.size <= 0) {
											user.pokemons1.push(poke)
											user.caught.push(poke)
											user.qcaught.push(poke)
											await user.save()
											if(user.qcaught.length >= 10 && user.q1 == false) {
												user = await User.findOne({ id: interaction.user.id })
												user.credits = user.credits + 1000
												user.q1 = true
												await user.save()
												await interaction.channel.send(`You Have Completed The First Quest **To Catch 10 Pokémons**! You Have Been Rewarded With **1000 Credits**!`)
											}
											return interaction.channel.send({ content: `There Was **No Response** From The Trainer,\n**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										}
									})
								})
						})
				} else if (failed == true) {
					await interaction.channel.send({
						embeds: [new MessageEmbed()
							.setTitle(`${interaction.user.username} Throws A ${click.customId.replace(/_/g, " ")}!`)
							.setColor(color)
							.setDescription(`They Failed To Catch A **${spawn.pokename}**!`)
						]
					})
					let fledchance = 20;
					let wheel = getRandomNumberBetween(1, 100)
					if (wheel >= fledchance) {
						Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
							if (err) {
								return;
							} else if (res) {
								let attachment = new MessageAttachment(`https://thumbs.gfycat.com/DefenselessPoisedArizonaalligatorlizard-max-1mb.gif`, `ball.gif`)
								await interaction.channel.send({
									files: [attachment],
									embeds: [new MessageEmbed()
										.setTitle(`The Wild ${spawn.pokename} Fled!`)
										.setColor(color)
										.setThumbnail("attachment://ball.gif")
										.setDescription(`The Wild **${spawn.pokename}** Fled, A New Pokémon Will Be Summoned Soon!`)]
								})
							}
						})
					} else {
						let spawn = await Spawn.findOne({ id: interaction.channel.id })
						if (!spawn) return;
						//console.log(spawn)
						let user = await User.findOne({ id: interaction.user.id })
						if (!user) {
							let throw_ball = new MessageButton().setStyle("SUCCESS").setCustomId("throw_ball").setLabel("Throw Ball")
							let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
							const row = [new MessageActionRow().addComponents([
								throw_ball,
								battle
							])]
							await interaction.message.edit({ components: row })
							return await interaction.followUp({ content: `Uh Oh! Looks Like You Have Not Picked Your Starter yet!\nType \`/pick\` To Pick Your Starter!`, ephemeral: true })
						}
						if (user.pokemons.length < 1) {
							let throw_ball = new MessageButton().setStyle("SUCCESS").setCustomId("throw_ball").setLabel("Throw Ball")
							let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
							const row = [new MessageActionRow().addComponents([
								throw_ball,
								battle
							])]
							await interaction.message.edit({ components: row })
							return await interaction.followUp({ content: `You Don't Have Any Pokémons To Battle!` })
						}
						if (user.selected.length !== 1) return await interaction.followUp({ content: `You Don't Have Any Pokémon Selected, The Wild Pokemon Fled!` });
						let poke = user.pokemons.find(r => {
							delete r.xp;
							delete user.selected[0].xp;
							delete r.level;
							delete user.selected[0].level;
							return JSON.stringify(r) === JSON.stringify(user.selected[0])
						})
						let index = user.pokemons.indexOf(poke)
						user = await User.findOne({ id: interaction.user.id })
						let pokemon = user.pokemons[index]
						if (index > -1) {
							//await interaction.message.edit({ components: [] })
							let opponent = spawn.pokename;
							let level = getRandomNumberBetween(50, 100)
							//let pokemon = user.pokemons[index]
							fetch(`https://pokeapi.co/api/v2/pokemon/${opponent}`).catch(e => { return interaction.followUp(`An Error Occured While Finding The Pokemon, try back later!`) })
								.then(res => res.json()).catch(e => { return interaction.followUp(`An Error Occured While Finding The Pokemon, try back later!`) })
								.then(async data => {
									let _pokemon = new Pokemon({ name: data.name, level: level, hp: getRandomNumberBetween(1, 31), def: getRandomNumberBetween(1, 31), atk: getRandomNumberBetween(1, 31), spdef: getRandomNumberBetween(1, 31), spatk: getRandomNumberBetween(1, 31), speed: getRandomNumberBetween(1, 31) })
									_pokemon = instanceToPlain(_pokemon) // AI's Op Pokemon.
									//console.log(_pokemon)
									//await interaction.editReply(`:white_check_mark: Successfully Found The Pokemon, And The Pokemon Is: **__${_pokemon.name}__**`)
									fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
										.then(res => res.json())
										.then(async _data => {
											let opponent_moves = await data.moves.filter(async r => {
												if (r.version_group_details[0].move_learn_method.name == "level-up") return r;
											}).filter(async r => {
												if (r.version_group_details[0].level_learned_at <= _pokemon.level) {
													return r;
												}
											}).map(r => r.move.name)
											let my_moves = pokemon.moves;
											if (my_moves.length < 1) return interaction.reply(`You Have Not Selected Any Moves.`)
											// getting ai's stats.
											//console.log(data.stats)
											let hpBase = data.stats[0].base_stat;
											let atkBase = data.stats[1].base_stat;
											let defBase = data.stats[2].base_stat;
											let spatkBase = data.stats[3].base_stat;
											let spdefBase = data.stats[4].base_stat;
											let speedBase = data.stats[5].base_stat;
											let hpTotal = Math.floor(Math.floor((2 * hpBase + _pokemon.hp + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
											let atkTotal = Math.floor(Math.floor((2 * atkBase + _pokemon.atk + 0) * _pokemon.level / 100 + 5) * 0.9);
											let defTotal = Math.floor(Math.floor((2 * defBase + _pokemon.def + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
											let spatkTotal = Math.floor(Math.floor((2 * spatkBase + _pokemon.spatk + (0 / 4)) * _pokemon.level / 100 + 5) * 1.1);
											let spdefTotal = Math.floor(Math.floor((2 * spdefBase + _pokemon.spdef + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
											let speedTotal = Math.floor(Math.floor((2 * speedBase + _pokemon.speed + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
											// getting the player's stats
											//console.log(_data)
											let _hpBase = _data.stats[0].base_stat;
											let _atkBase = _data.stats[1].base_stat;
											let _defBase = _data.stats[2].base_stat;
											let _spatkBase = _data.stats[3].base_stat;
											let _spdefBase = _data.stats[4].base_stat;
											let _speedBase = _data.stats[5].base_stat;
											let _hpTotal = Math.floor(Math.floor((2 * _hpBase + pokemon.hp + (0 / 4)) * pokemon.level / 100 + 5) * 1);
											let _atkTotal = Math.floor(Math.floor((2 * _atkBase + pokemon.atk + 0) * pokemon.level / 100 + 5) * 0.9);
											let _defTotal = Math.floor(Math.floor((2 * _defBase + pokemon.def + (0 / 4)) * pokemon.level / 100 + 5) * 1);
											let _spatkTotal = Math.floor(Math.floor((2 * _spatkBase + pokemon.spatk + (0 / 4)) * pokemon.level / 100 + 5) * 1.1);
											let _spdefTotal = Math.floor(Math.floor((2 * _spdefBase + pokemon.spdef + (0 / 4)) * pokemon.level / 100 + 5) * 1);
											let _speedTotal = Math.floor(Math.floor((2 * _speedBase + pokemon.speed + (0 / 4)) * pokemon.level / 100 + 5) * 1);

											const canvas = Canvas.createCanvas(1920, 920);
											const context = canvas.getContext('2d');
											const bg = await Canvas.loadImage("https://i.imgur.com/z4fpgV3.png")
											context.drawImage(bg, 0, 0, canvas.width, canvas.height)
											const player1 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${_data.id}.png`).catch(async (e) => {
												await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${_data.id}.png`)
											})
											context.drawImage(player1, 50, 500, 700, 700)
											const player2 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${data.id}.png`)
											context.drawImage(player2, 1050, 10, 700, 700)
											const attachment = new MessageAttachment(canvas.toBuffer(), `battle.png`)
											let hp1 = _hpTotal;
											let hp2 = hpTotal;
											async function battle_ai() {
												let msg = await interaction.channel.send({
													embeds: [new MessageEmbed()
														.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
														.setDescription(`Click On The Below Button To Choose Your Moves.`)
														.addFields(
															{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
															{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
														)
														.setImage(`attachment://battle.png`)
														.setColor(color)],
													files: [attachment]
												})
												let row = new MessageActionRow()
												my_moves.forEach(async move => {
													row.addComponents([new MessageButton().setStyle("SUCCESS").setCustomId(move).setLabel(String(move))])
												})
												let _row = new MessageActionRow()
													.addComponents([
														new MessageButton()
															.setStyle("DANGER")
															.setLabel("Flee")
															.setCustomId("flee")
															.setEmoji("🚫"),
														new MessageButton()
															.setStyle("SECONDARY")
															.setLabel("Pass Turn")
															.setCustomId("pass")
															.setEmoji("🤝")
													])
												let _msg = await interaction.user.send({
													embeds: [new MessageEmbed()
														.setTitle(`Choose Your Moves`)
														.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
														.setDescription(`Click on The Below Buttons To Choose Your Moves.`)
														.setImage(`attachment://battle.png`)
														.setColor(color)
													],
													files: [attachment],
													components: [row, _row]
												}).catch(async e => { await interaction.channel.send(`Unable To Send Message To The User ${interaction.user.tag}, Are Ther DMs Open?\n${e}`) })
												const collector = _msg.createMessageComponentCollector({
													max: 1,
													time: 30000
												})
												collector.on("collect", async (click) => {
													if (click.customId == "flee") {
														await click.reply({
															ephemeral: true,
															embeds: [new MessageEmbed()
																.setTitle(`Successfully Choosed Your Turn!`)
																.setColor(color)
																.setTimestamp()
																.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
																.setDescription(`You Choosed To **Flee** From The Battle!`)]
														})
														await interaction.channel.send({
															files: [attachment],
															embeds: [new MessageEmbed()
																.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																.setColor(color)
																.setTimestamp()
																.addFields(
																	{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																	{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																)
																.setImage(`attachment://battle.png`)
																.setDescription(`**${interaction.user.username}** Choosed To Flee From The Battle!\nThe Winner is **${client.user.tag}!**`)]
														})
													} else if (click.customId == "pass") {
														fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
															.then(res => res.json())
															.then(async mv => {
																await click.reply({
																	ephemeral: true,
																	embeds: [new MessageEmbed()
																		.setTitle(`Successfully Choosed Your Turn!`)
																		.setColor(color)
																		.setTimestamp()
																		.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
																		.setDescription(`You Choosed To **Pass** Your Turn To The Opponent.`)]
																})
																let flavour_text = [`${interaction.user.username} Choosed To **Pass** Their Turn!`, `${client.user.username} Choosed The Move \`${mv.name}\``]
																let power = mv.power !== null ? mv.power : 0
																let attack = atkTotal // ai's attack iv.
																if (mv.damage_class == "special") attack = spatkTotal;
																let defence = defTotal // player's defence
																if (mv.damage_class == "special") defence = _spdefTotal
																let stab = 1
																let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																if (pokemon_type.includes(mv.type.name)) {
																	stab = 1.2;
																}
																let accuracy_wheel = getRandomNumberBetween(1, 100)
																let dodged = 1;
																if (mv.accuracy <= accuracy_wheel) {
																	dodged = 0.25;
																}
																let modifier = stab * dodged;
																aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																hp1 = hp1 - aidamage;
																// checking the survival.
																await interaction.channel.send({
																	embeds: [new MessageEmbed()
																		.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																		.setColor(color)
																		.setTimestamp()
																		.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**`)]
																})
																if (hp1 < 1) {
																	await interaction.channel.send({
																		files: [attachment],
																		embeds: [new MessageEmbed()
																			.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																			.setColor(color)
																			.setTimestamp()
																			.addFields(
																				{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																				{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																			)
																			.setImage(`attachment://battle.png`)
																			.setDescription(`**${interaction.user.username}** Choosed To Pass Their Turn And...\nThe Winner is **${client.user.tag}!**`)]
																	})
																} else {
																	battle_ai();
																}
															})
													} else { // here comes the final part, when a specific move is choosen.
														fetch(`https://pokeapi.co/api/v2/move/${click.customId}`)
															.then(res => res.json())
															.then(async mav => {
																fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
																	.then(res => res.json())
																	.then(async mv => {
																		await click.reply({
																			ephemeral: true,
																			embeds: [new MessageEmbed()
																				.setTitle(`Successfully Choosed Your Turn!`)
																				.setColor(color)
																				.setTimestamp()
																				.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
																				.setDescription(`You Choosed The Move \`${click.customId}\``)]
																		})
																		let flavour_text = [`${interaction.user.username} Choosed The Move \`${click.customId}\``, `${client.user.username} Choosed The Move \`${mv.name}\``]
																		let power = mv.power !== null ? mv.power : 0
																		let attack = atkTotal // ai's attack iv.
																		if (mv.damage_class == "special") attack = spatkTotal;
																		let defence = _defTotal // player's defence
																		if (mv.damage_class == "special") defence = _spdefTotal
																		let stab = 1
																		let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																		if (pokemon_type.includes(mv.type.name)) {
																			stab = 1.2;
																		}
																		let accuracy_wheel = getRandomNumberBetween(1, 100)
																		let dodged = 1;
																		if (mav.accuracy <= accuracy_wheel) {
																			dodged = 0.25;
																		}
																		let modifier = stab * dodged;
																		aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																		let _power = mav.power !== null ? mav.power : 0;
																		let _attack = _atkTotal;
																		if (mav.damage_class == "special") _attack = _spatkTotal;
																		let _defence = defTotal;
																		if (mv.damage_class == "special") _defence = spdefTotal;
																		let _stab = 1;
																		let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																		if (_pokemon_type.includes(mav.type.name)) {
																			_stab = 1.2;
																		}
																		let _accuracy_wheel = getRandomNumberBetween(1, 100)
																		let _dodged = 1;
																		if (mv.accuracy <= _accuracy_wheel) {
																			_dodged = 0.25;
																		}
																		let _modifier = _stab * _dodged;
																		damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the player's damage.
																		if (speedTotal <= _speedTotal) { // ai's first move...
																			hp1 = hp1 - aidamage
																			if (hp1 < 1) {
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																						.setColor(color)
																						.setTimestamp()
																						.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
																				})
																				await interaction.channel.send({
																					files: [attachment],
																					embeds: [new MessageEmbed()
																						.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																						.setColor(color)
																						.setTimestamp()
																						.addFields(
																							{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																							{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																						)
																						.setImage(`attachment://battle.png`)
																						.setDescription(`The Winner is **${client.user.tag}!**`)]
																				})
																			} else { // player survived, now it's player's turn
																				hp2 = hp2 - damage;
																				if (hp2 < 1) {
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																							.setColor(color)
																							.setTimestamp()
																							.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
																					})
																					await interaction.channel.send({
																						files: [attachment],
																						embeds: [new MessageEmbed()
																							.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																							.setColor(color)
																							.setTimestamp()
																							.addFields(
																								{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																								{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																							)
																							.setImage(`attachment://battle.png`)
																							.setDescription(`The Winner is **${interaction.user.tag}!**`)]
																					})
																					let amt = 100
																					user.credits += amt;
																					await user.save()
																					await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
																				} else { // both survived, send info and redo the battle function
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																							.setColor(color)
																							.setTimestamp()
																							.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
																					})
																					await battle_ai();
																				}
																			}
																		} else { // player's first move!
																			hp2 = hp2 - damage;
																			if (hp2 < 1) {
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																						.setColor(color)
																						.setTimestamp()
																						.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
																				})
																				await interaction.channel.send({
																					files: [attachment],
																					embeds: [new MessageEmbed()
																						.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																						.setColor(color)
																						.setTimestamp()
																						.addFields(
																							{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																							{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																						)
																						.setImage(`attachment://battle.png`)
																						.setDescription(`The Winner is **${interaction.user.tag}!**`)]
																				})
																				let amt = 100
																				user.credits += amt;
																				await user.save()
																				await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
																			} else { // if the ai survived...
																				hp1 = hp1 - aidamage;
																				if (hp1 < 1) {
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																							.setColor(color)
																							.setTimestamp()
																							.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
																					})
																					await interaction.channel.send({
																						files: [attachment],
																						embeds: [new MessageEmbed()
																							.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																							.setColor(color)
																							.setTimestamp()
																							.addFields(
																								{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																								{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																							)
																							.setImage(`attachment://battle.png`)
																							.setDescription(`The Winner is **${client.user.tag}!**`)]
																					})
																				} else { // if both survived then...
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																							.setColor(color)
																							.setTimestamp()
																							.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
																					})
																					await battle_ai();
																				}
																			}
																		}
																	})
															})
													}
												})
											}
											battle_ai();
										})
								}).catch(e => { return interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`) })
						}
					}
				}
			})
		} else if (interaction.customId == "battle_pokemon") {
			let spawn = await Spawn.findOne({ id: interaction.channel.id })
			if (!spawn) return;
			//console.log(spawn)
			let user = await User.findOne({ id: interaction.user.id })
			if (!user) {
				let throw_ball = new MessageButton().setStyle("SUCCESS").setCustomId("throw_ball").setLabel("Throw Ball")
				let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
				const row = [new MessageActionRow().addComponents([
					throw_ball,
					battle
				])]
				await interaction.message.edit({ components: row })
				return await interaction.followUp({ content: `Uh Oh! Looks Like You Have Not Picked Your Starter yet!\nType \`/pick\` To Pick Your Starter!`, ephemeral: true })
			}
			if (user.pokemons.length < 1) {
				let throw_ball = new MessageButton().setStyle("SUCCESS").setCustomId("throw_ball").setLabel("Throw Ball")
				let battle = new MessageButton().setStyle("DANGER").setCustomId("battle_pokemon").setLabel("Battle Pokemon")
				const row = [new MessageActionRow().addComponents([
					throw_ball,
					battle
				])]
				await interaction.message.edit({ components: row })
				return await interaction.followUp({ content: `You Don't Have Any Pokémons To Battle!` })
			}
			if (user.selected.length !== 1) return await interaction.followUp({ content: `You Don't Have Any Pokémon Selected, The Wild Pokemon Fled!` });
			let poke = user.pokemons.find(r => {
				delete r.xp;
				delete user.selected[0].xp;
				delete r.level;
				delete user.selected[0].level;
				return JSON.stringify(r) === JSON.stringify(user.selected[0])
			})
			let index = user.pokemons.indexOf(poke)
			user = await User.findOne({ id: interaction.user.id })
			let pokemon = user.pokemons[index]
			if (index > -1) {
				await interaction.message.edit({ components: [] })
				//await interaction.message.edit({ components: [] })
				let opponent = spawn.pokename;
				let level = getRandomNumberBetween(50, 100)
				//let pokemon = user.pokemons[index]
				fetch(`https://pokeapi.co/api/v2/pokemon/${opponent}`).catch(e => { return interaction.followUp(`An Error Occured While Finding The Pokemon, try back later!`) })
					.then(res => res.json()).catch(e => { return interaction.followUp(`An Error Occured While Finding The Pokemon, try back later!`) })
					.then(async data => {
						let _pokemon = new Pokemon({ name: data.name, level: level, hp: getRandomNumberBetween(1, 31), def: getRandomNumberBetween(1, 31), atk: getRandomNumberBetween(1, 31), spdef: getRandomNumberBetween(1, 31), spatk: getRandomNumberBetween(1, 31), speed: getRandomNumberBetween(1, 31) })
						_pokemon = instanceToPlain(_pokemon) // AI's Op Pokemon.
						//console.log(_pokemon)
						//await interaction.editReply(`:white_check_mark: Successfully Found The Pokemon, And The Pokemon Is: **__${_pokemon.name}__**`)
						fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
							.then(res => res.json())
							.then(async _data => {
								let opponent_moves = await data.moves.filter(async r => {
									if (r.version_group_details[0].move_learn_method.name == "level-up") return r;
								}).filter(async r => {
									if (r.version_group_details[0].level_learned_at <= _pokemon.level) {
										return r;
									}
								}).map(r => r.move.name)
								let my_moves = pokemon.moves;
								if (my_moves.length < 1) return interaction.reply(`You Have Not Selected Any Moves.`)
								// getting ai's stats.
								//console.log(data.stats)
								let hpBase = data.stats[0].base_stat;
								let atkBase = data.stats[1].base_stat;
								let defBase = data.stats[2].base_stat;
								let spatkBase = data.stats[3].base_stat;
								let spdefBase = data.stats[4].base_stat;
								let speedBase = data.stats[5].base_stat;
								let hpTotal = Math.floor(Math.floor((2 * hpBase + _pokemon.hp + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
								let atkTotal = Math.floor(Math.floor((2 * atkBase + _pokemon.atk + 0) * _pokemon.level / 100 + 5) * 0.9);
								let defTotal = Math.floor(Math.floor((2 * defBase + _pokemon.def + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
								let spatkTotal = Math.floor(Math.floor((2 * spatkBase + _pokemon.spatk + (0 / 4)) * _pokemon.level / 100 + 5) * 1.1);
								let spdefTotal = Math.floor(Math.floor((2 * spdefBase + _pokemon.spdef + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
								let speedTotal = Math.floor(Math.floor((2 * speedBase + _pokemon.speed + (0 / 4)) * _pokemon.level / 100 + 5) * 1);
								// getting the player's stats
								//console.log(_data)
								let _hpBase = _data.stats[0].base_stat;
								let _atkBase = _data.stats[1].base_stat;
								let _defBase = _data.stats[2].base_stat;
								let _spatkBase = _data.stats[3].base_stat;
								let _spdefBase = _data.stats[4].base_stat;
								let _speedBase = _data.stats[5].base_stat;
								let _hpTotal = Math.floor(Math.floor((2 * _hpBase + pokemon.hp + (0 / 4)) * pokemon.level / 100 + 5) * 1);
								let _atkTotal = Math.floor(Math.floor((2 * _atkBase + pokemon.atk + 0) * pokemon.level / 100 + 5) * 0.9);
								let _defTotal = Math.floor(Math.floor((2 * _defBase + pokemon.def + (0 / 4)) * pokemon.level / 100 + 5) * 1);
								let _spatkTotal = Math.floor(Math.floor((2 * _spatkBase + pokemon.spatk + (0 / 4)) * pokemon.level / 100 + 5) * 1.1);
								let _spdefTotal = Math.floor(Math.floor((2 * _spdefBase + pokemon.spdef + (0 / 4)) * pokemon.level / 100 + 5) * 1);
								let _speedTotal = Math.floor(Math.floor((2 * _speedBase + pokemon.speed + (0 / 4)) * pokemon.level / 100 + 5) * 1);

								const canvas = Canvas.createCanvas(1920, 920);
								const context = canvas.getContext('2d');
								const bg = await Canvas.loadImage("https://i.imgur.com/z4fpgV3.png")
								context.drawImage(bg, 0, 0, canvas.width, canvas.height)
								const player1 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${_data.id}.png`).catch(async (e) => {
									await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${_data.id}.png`)
								})
								context.drawImage(player1, 50, 500, 700, 700)
								const player2 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${data.id}.png`)
								context.drawImage(player2, 1050, 10, 700, 700)
								const attachment = new MessageAttachment(canvas.toBuffer(), `battle.png`)
								let hp1 = _hpTotal;
								let hp2 = hpTotal;
								async function battle_ai() {
									let msg = await interaction.channel.send({
										embeds: [new MessageEmbed()
											.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
											.setDescription(`Click On The Below Button To Choose Your Moves.`)
											.addFields(
												{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
												{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
											)
											.setImage(`attachment://battle.png`)
											.setColor(color)],
										files: [attachment]
									})
									let row = new MessageActionRow()
									my_moves.forEach(async move => {
										row.addComponents([new MessageButton().setStyle("SUCCESS").setCustomId(move).setLabel(String(move))])
									})
									let _row = new MessageActionRow()
										.addComponents([
											new MessageButton()
												.setStyle("DANGER")
												.setLabel("Flee")
												.setCustomId("flee")
												.setEmoji("🚫"),
											new MessageButton()
												.setStyle("SECONDARY")
												.setLabel("Pass Turn")
												.setCustomId("pass")
												.setEmoji("🤝")
										])
									let _msg = await interaction.user.send({
										embeds: [new MessageEmbed()
											.setTitle(`Choose Your Moves`)
											.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
											.setDescription(`Click on The Below Buttons To Choose Your Moves.`)
											.setImage(`attachment://battle.png`)
											.setColor(color)
										],
										files: [attachment],
										components: [row, _row]
									}).catch(async e => { await interaction.channel.send(`Unable To Send Message To The User ${interaction.user.tag}, Are Ther DMs Open?\n${e}`) })
									const collector = _msg.createMessageComponentCollector({
										max: 1,
										time: 30000
									})
									collector.on("collect", async (click) => {
										if (click.customId == "flee") {
											await click.reply({
												ephemeral: true,
												embeds: [new MessageEmbed()
													.setTitle(`Successfully Choosed Your Turn!`)
													.setColor(color)
													.setTimestamp()
													.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
													.setDescription(`You Choosed To **Flee** From The Battle!`)]
											})
											await interaction.channel.send({
												files: [attachment],
												embeds: [new MessageEmbed()
													.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
													.setColor(color)
													.setTimestamp()
													.addFields(
														{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
														{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
													)
													.setImage(`attachment://battle.png`)
													.setDescription(`**${interaction.user.username}** Choosed To Flee From The Battle!\nThe Winner is **${client.user.tag}!**`)]
											})
										} else if (click.customId == "pass") {
											fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
												.then(res => res.json())
												.then(async mv => {
													await click.reply({
														ephemeral: true,
														embeds: [new MessageEmbed()
															.setTitle(`Successfully Choosed Your Turn!`)
															.setColor(color)
															.setTimestamp()
															.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
															.setDescription(`You Choosed To **Pass** Your Turn To The Opponent.`)]
													})
													let flavour_text = [`${interaction.user.username} Choosed To **Pass** Their Turn!`, `${client.user.username} Choosed The Move \`${mv.name}\``]
													let power = mv.power !== null ? mv.power : 0
													let attack = atkTotal // ai's attack iv.
													if (mv.damage_class == "special") attack = spatkTotal;
													let defence = defTotal // player's defence
													if (mv.damage_class == "special") defence = _spdefTotal
													let stab = 1
													let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
													if (pokemon_type.includes(mv.type.name)) {
														stab = 1.2;
													}
													let accuracy_wheel = getRandomNumberBetween(1, 100)
													let dodged = 1;
													if (mv.accuracy <= accuracy_wheel) {
														dodged = 0.25;
													}
													let modifier = stab * dodged;
													aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
													hp1 = hp1 - aidamage;
													// checking the survival.
													await interaction.channel.send({
														embeds: [new MessageEmbed()
															.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
															.setColor(color)
															.setTimestamp()
															.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**`)]
													})
													if (hp1 < 1) {
														await interaction.channel.send({
															files: [attachment],
															embeds: [new MessageEmbed()
																.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																.setColor(color)
																.setTimestamp()
																.addFields(
																	{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																	{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																)
																.setImage(`attachment://battle.png`)
																.setDescription(`**${interaction.user.username}** Choosed To Pass Their Turn And...\nThe Winner is **${client.user.tag}!**`)]
														})
													} else {
														battle_ai();
													}
												})
										} else { // here comes the final part, when a specific move is choosen.
											fetch(`https://pokeapi.co/api/v2/move/${click.customId}`)
												.then(res => res.json())
												.then(async mav => {
													fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
														.then(res => res.json())
														.then(async mv => {
															await click.reply({
																ephemeral: true,
																embeds: [new MessageEmbed()
																	.setTitle(`Successfully Choosed Your Turn!`)
																	.setColor(color)
																	.setTimestamp()
																	.addField(`Return Back To The Battle:-`, `**[CLICK HERE](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`)
																	.setDescription(`You Choosed The Move \`${click.customId}\``)]
															})
															let flavour_text = [`${interaction.user.username} Choosed The Move \`${click.customId}\``, `${client.user.username} Choosed The Move \`${mv.name}\``]
															let power = mv.power !== null ? mv.power : 0
															let attack = atkTotal // ai's attack iv.
															if (mv.damage_class == "special") attack = spatkTotal;
															let defence = _defTotal // player's defence
															if (mv.damage_class == "special") defence = _spdefTotal
															let stab = 1
															let pokemon_type = _data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
															if (pokemon_type.includes(mv.type.name)) {
																stab = 1.2;
															}
															let accuracy_wheel = getRandomNumberBetween(1, 100)
															let dodged = 1;
															if (mav.accuracy <= accuracy_wheel) {
																dodged = 0.25;
															}
															let modifier = stab * dodged;
															aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
															let _power = mav.power !== null ? mav.power : 0;
															let _attack = _atkTotal;
															if (mav.damage_class == "special") _attack = _spatkTotal;
															let _defence = defTotal;
															if (mv.damage_class == "special") _defence = spdefTotal;
															let _stab = 1;
															let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
															if (_pokemon_type.includes(mav.type.name)) {
																_stab = 1.2;
															}
															let _accuracy_wheel = getRandomNumberBetween(1, 100)
															let _dodged = 1;
															if (mv.accuracy <= _accuracy_wheel) {
																_dodged = 0.25;
															}
															let _modifier = _stab * _dodged;
															damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the player's damage.
															if (speedTotal <= _speedTotal) { // ai's first move...
																hp1 = hp1 - aidamage
																if (hp1 < 1) {
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																			.setColor(color)
																			.setTimestamp()
																			.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
																	})
																	await interaction.channel.send({
																		files: [attachment],
																		embeds: [new MessageEmbed()
																			.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																			.setColor(color)
																			.setTimestamp()
																			.addFields(
																				{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																				{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																			)
																			.setImage(`attachment://battle.png`)
																			.setDescription(`The Winner is **${client.user.tag}!**`)]
																	})
																} else { // player survived, now it's player's turn
																	hp2 = hp2 - damage;
																	if (hp2 < 1) {
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																				.setColor(color)
																				.setTimestamp()
																				.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
																		})
																		await interaction.channel.send({
																			files: [attachment],
																			embeds: [new MessageEmbed()
																				.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																				.setColor(color)
																				.setTimestamp()
																				.addFields(
																					{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																					{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																				)
																				.setImage(`attachment://battle.png`)
																				.setDescription(`The Winner is **${interaction.user.tag}!**`)]
																		})
																		let amt = 100
																		user.credits += amt;
																		await user.save()
																		await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
																	} else { // both survived, send info and redo the battle function
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																				.setColor(color)
																				.setTimestamp()
																				.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
																		})
																		await battle_ai();
																	}
																}
															} else { // player's first move!
																hp2 = hp2 - damage;
																if (hp2 < 1) {
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																			.setColor(color)
																			.setTimestamp()
																			.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username}'s Pokemon Fainted!`)]
																	})
																	await interaction.channel.send({
																		files: [attachment],
																		embeds: [new MessageEmbed()
																			.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																			.setColor(color)
																			.setTimestamp()
																			.addFields(
																				{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																				{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																			)
																			.setImage(`attachment://battle.png`)
																			.setDescription(`The Winner is **${interaction.user.tag}!**`)]
																	})
																	let amt = 100
																	user.credits += amt;
																	await user.save()
																	await interaction.user.send(`Thank You For Battling With Our AI, You Recieved \`${amt}\` Credits As A Reward For Winning The Battle!\n**Loving This Bot? Consider Refering it to your friends to earn rewards!*`)
																} else { // if the ai survived...
																	hp1 = hp1 - aidamage;
																	if (hp1 < 1) {
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																				.setColor(color)
																				.setTimestamp()
																				.setDescription(`${flavour_text.join("\n")}\n\n**AI Did __${aidamage}__ Damage!**\n${interaction.user.username}'s Pokemon Fainted!`)]
																		})
																		await interaction.channel.send({
																			files: [attachment],
																			embeds: [new MessageEmbed()
																				.setTitle(`⚔️ **__Battle Results Are Here!__** ⚔️`)
																				.setColor(color)
																				.setTimestamp()
																				.addFields(
																					{ name: `${interaction.user.username}'s side`, value: `\`${hp1 > 0 ? hp1 : 0}/${_hpTotal}\` | **__${pokemon.name}__** - **__Level__** \`${pokemon.level}\` of Total IV: ${pokemon.totalIV}%` },
																					{ name: `${client.user.username}'s side`, value: `\`${hp2 > 0 ? hp2 : 0}/${hpTotal}\` | **__${_pokemon.name}__** - **__Level__** \`${_pokemon.level}\` of Total IV: ${_pokemon.totalIV}%` }
																				)
																				.setImage(`attachment://battle.png`)
																				.setDescription(`The Winner is **${client.user.tag}!**`)]
																		})
																	} else { // if both survived then...
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`🛡️ **__Battle Information.__** 🛡️`)
																				.setColor(color)
																				.setTimestamp()
																				.setDescription(`${flavour_text.join("\n")}\n\n**${interaction.user.username} Did __${damage}__ Damage!**\n${client.user.username} Did __${aidamage}__ Damage!`)]
																		})
																		await battle_ai();
																	}
																}
															}
														})
												})
										}
									})
								}
								battle_ai();
							})
					}).catch(e => { return interaction.editReply(`An Error Occured While Finding The Pokemon, try back later!`) })
			}
		}
	}
	// power = move_power;
	// attack = attack stat of the attacking poke
	// defence = defence stat of the pokemon being attacked
	// modifier = type_effectiveness * stab * dodged
	// damage = Math.floor((0.5 * power * (attack / defence) * modifier) + 1)
	function onCoolDown(message, command) {
		if (!message || !message.client) throw "No Message with a valid DiscordClient granted as First Parameter";
		if (!command || !command.name) throw "No Command with a valid Name granted as Second Parameter";
		const client = message.client;
		if (!client.cooldowns.has(command.name)) { //if its not in the cooldown, set it too there
			client.cooldowns.set(command.name, new Collection());
		}
		const now = Date.now(); //get the current time
		const timestamps = client.cooldowns.get(command.name); //get the timestamp of the last used commands
		const cooldownAmount = (command.cooldown || 2) * 1000; //get the cooldownamount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
		if (timestamps.has(message.member.id)) { //if the user is on cooldown
			const expirationTime = timestamps.get(message.member.id) + cooldownAmount; //get the amount of time he needs to wait until he can run the cmd again
			if (now < expirationTime) { //if he is still on cooldonw
				const timeLeft = (expirationTime - now) / 1000; //get the lefttime
				//return true
				return timeLeft
			}
			else {
				//if he is not on cooldown, set it to the cooldown
				timestamps.set(message.member.id, now);
				//set a timeout function with the cooldown, so it gets deleted later on again
				setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
				//return false aka not on cooldown
				return false;
			}
		}
		else {
			//if he is not on cooldown, set it to the cooldown
			timestamps.set(message.member.id, now);
			//set a timeout function with the cooldown, so it gets deleted later on again
			setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
			//return false aka not on cooldown
			return false;
		}
	}
}
function getRandomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}