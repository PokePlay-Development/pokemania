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
		let _Trade = await Trade.findOne({ id1: interaction.user.id })
		if(!_Trade) _Trade = await Trade.findOne({ id2: interaction.user.id })
		if(_Trade) {
			if(!command.trade) {
				return interaction.reply(`You Cannot Run This Command Since You Are in A Trade.`)
			}
		}
		if(command.developer && command.admin && command.admin == true && command.developer == true) {
			let admin = new Array("748815231974637598", "681152993361788928", "918735955123388436", "394812820799094785", "841667029165015081")
			if(!admin.includes(interaction.user.id)) {
				return interaction.reply({ content: `Only **${client.user.username}'s** Admins/Developers Can Run This Command.`})
			}
		}
		if (command.developer && command.developer == true && command.admin && command.admin !== true) {
			let developers = new Array("681152993361788928", "394812820799094785", "841667029165015081")
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
	if (interaction.isButton()) {
		if(interaction.customId == "decline_trade") {
			let trade = await Trade.findOne({ id1: interaction.user.id })
			let _trade = await Trade.findOne({ id2: interaction.user.id })
			if(!trade && !_trade) return interaction.reply({ content: `You're Not in A Trade.`, ephemeral: true })
			if(trade) {
				Trade.findOneAndDelete({ id1: interaction.user.id }, async (err, res) => {
					if(res) return interaction.reply({ content: `Successfully Cancelled Your Trades.`, ephemeral: true })
				})
			} else {
				Trade.findOneAndDelete({ id2: interaction.user.id }, async (err, res) => {
					if(res) return interaction.reply({ content: `Successfully Cancelled Your Trades.`, ephemeral: true })
				})
			}
		}
		if(interaction.customId == "confirm_trade") {
			return interaction.reply({ content: `Under Maintainance, Try Back Later.\nUse \`/trade confirm\` Command instead.`, ephemeral: true })
		}
		// spawns buttons
		if (interaction.customId == "throw_ball") {
			let spawn = await Spawn.findOne({ id: interaction.channel.id })
			if (!spawn) return;
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
							.setLabel("Normal Ball")
							.setEmoji("<:pokeball:1022147275339870259>"),
						new MessageButton()
							.setStyle("SECONDARY")
							.setCustomId("great_ball")
							.setLabel("Great Ball")
							.setEmoji("<:greatball:1022146948750389308>"),
						new MessageButton()
							.setStyle("SECONDARY")
							.setLabel("Ultra Ball")
							.setEmoji("<:ultraball:1022147018291957790>")
							.setCustomId("ultra_ball"),
						new MessageButton()
							.setStyle("SECONDARY")
							.setLabel("Master Ball")
							.setEmoji("<:masterball:1022147106129068073>")
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
											await user.save()
											return collect.reply({ content: `**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										} else {
											if (user.pokemons.length >= 6) {
												user.pokemons1.push(poke)
												user.caught.push(poke)
												await user.save()
												return collect.reply({ content: `Your **Pokémon Slots** Are Currently Full! Sent The Pokémon To Pokémon Center.` })
											} else {
												user.pokemons.push(poke)
												user.caught.push(poke)
												await user.save()
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
											await user.save()
											return collect.reply({ content: `**Successfully** Sent The Pokémon To **Pokémon Center!**` })
										} else {
											if (user.pokemons.length >= 6) {
												user.pokemons1.push(poke)
												user.caught.push(poke)
												await user.save()
												return collect.reply({ content: `Your **Pokémon Slots** Are Currently Full! Sent The Pokémon To Pokémon Center.` })
											} else {
												user.pokemons.push(poke)
												user.caught.push(poke)
												await user.save()
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
							return await interaction.followUp({ content: `Uh Oh! Looks Like You Have Not Picked Your Starter yet!\nType \`/pick\` To Pick Your Starter!`, ephemeral: true })
						}
						if (user.pokemons.length < 1) {
							return await interaction.followUp({ content: `You Don't Have Any Pokémons To Battle!` })
						}
						if (user.selected.length !== 1) return await interaction.followUp({ content: `You Don't Have Any Pokémon Selected!` })
						let pk = user.pokemons.find(r => JSON.stringify(r) === JSON.stringify(user.selected[0]))
						//console.log(pk)
						let index = user.pokemons.indexOf(pk)
						//console.log(index)
						if (index > -1) {
							//await interaction.message.edit({ components: [] })
							let opponent = spawn.pokename;
							let level = getRandomNumberBetween(50, 100)
							let poke = user.pokemons[index]
							fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`)
								.then(res => res.json())
								.then(async data => {
									fetch(`https://pokeapi.co/api/v2/pokemon/${opponent}`)
										.then(res => res.json())
										.then(async (deta) => {
											let _poke = new Pokemon({ name: opponent, level: level });
											_poke = instanceToPlain(_poke)
											// Getting Moves of Both Parties.
											let opponent_moves = deta.moves.filter((move) => {
												if (move.version_group_details[0].move_learn_method.name == "level-up") return move
											}).filter((move) => {
												if (move.version_group_details[0].level_learned_at <= _poke.level) return move;
											}).map(move => move.move.name)
											let my_moves = data.moves.filter((move) => {
												if (move.version_group_details[0].move_learn_method.name == "level-up") return move
											}).filter((move) => {
												if (move.version_group_details[0].level_learned_at <= _poke.level) return move;
											}).map(move => move.move.name)
											// Getting stats of Both Parties.
											// Getting My Stats
											let _level = poke.level;
											let hpBase = data.stats[0].base_stat;
											let atkBase = data.stats[1].base_stat;
											let defBase = data.stats[2].base_stat;
											let spatkBase = data.stats[3].base_stat;
											let spdefBase = data.stats[4].base_stat;
											let speedBase = data.stats[5].base_stat;
											let hpTotal = Math.floor(Math.floor((2 * hpBase + poke.hp + (0 / 4)) * _level / 100 + 5) * 1);
											let atkTotal = Math.floor(Math.floor((2 * atkBase + poke.atk + 0) * _level / 100 + 5) * 0.9);
											let defTotal = Math.floor(Math.floor((2 * defBase + poke.def + (0 / 4)) * _level / 100 + 5) * 1);
											let spatkTotal = Math.floor(Math.floor((2 * spatkBase + poke.spatk + (0 / 4)) * _level / 100 + 5) * 1.1);
											let spdefTotal = Math.floor(Math.floor((2 * spdefBase + poke.spdef + (0 / 4)) * _level / 100 + 5) * 1);
											let speedTotal = Math.floor(Math.floor((2 * speedBase + poke.speed + (0 / 4)) * _level / 100 + 5) * 1);
											// Getting AI's Stats
											let _hpBase = data.stats[0].base_stat;
											let _atkBase = data.stats[1].base_stat;
											let _defBase = data.stats[2].base_stat;
											let _spatkBase = data.stats[3].base_stat;
											let _spdefBase = data.stats[4].base_stat;
											let _speedBase = data.stats[5].base_stat;
											let _hpTotal = Math.floor(Math.floor((2 * _hpBase + _poke.hp + (0 / 4)) * level / 100 + 5) * 1);
											let _atkTotal = Math.floor(Math.floor((2 * _atkBase + _poke.atk + 0) * level / 100 + 5) * 0.9);
											let _defTotal = Math.floor(Math.floor((2 * _defBase + _poke.def + (0 / 4)) * level / 100 + 5) * 1);
											let _spatkTotal = Math.floor(Math.floor((2 * _spatkBase + _poke.spatk + (0 / 4)) * level / 100 + 5) * 1.1);
											let _spdefTotal = Math.floor(Math.floor((2 * _spdefBase + _poke.spdef + (0 / 4)) * level / 100 + 5) * 1);
											let _speedTotal = Math.floor(Math.floor((2 * _speedBase + _poke.speed + (0 / 4)) * level / 100 + 5) * 1);
											// Recieved The Stats / Moves, Now The Battle Time!
											let __hp = 100;
											//console.log(`Works Till Here!`)
											const canvas = Canvas.createCanvas(1920, 920);
											const context = canvas.getContext('2d');
											const bg = await Canvas.loadImage("https://i.imgur.com/2H2kAO4.png")
											context.drawImage(bg, 0, 0, canvas.width, canvas.height)
											const player1 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${data.id}.png`).catch(async (e) => {
												await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${data.id}.png`)
											})
											context.drawImage(player1, 50, 500, 700, 700)
											const player2 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${deta.id}.png`)
											context.drawImage(player2, 1050, 10, 700, 700)
											const attachment = new MessageAttachment(canvas.toBuffer(), `battle.png`)
											async function battle_ai() {
												//console.log(`Function Triggered.`)
												let attack = new MessageButton().setStyle("SECONDARY").setCustomId("choose_move").setLabel("Choose Move")
												attack = [new MessageActionRow().addComponents([attack])]
												let msg = await interaction.channel.send({
													embeds: [new MessageEmbed()
														.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
														.setDescription(`Click On The Below Button To Choose Your Moves.`)
														.setImage(`attachment://battle.png`)
														.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
														.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
														.setColor(color)],
													components: attack,
													files: [attachment]
												})
												const filter = i => {
													if (i.user.id == interaction.user.id) return true;
													else return i.reply({ content: `This Button is Not For You!` })
												}
												const collector = msg.createMessageComponentCollector({
													filter,
													max: 1,
													time: 30000
												})
												collector.on("collect", async (click) => {
													click.deferUpdate()
													let row = new MessageActionRow()
													poke.moves.forEach(async move => {
														row.addComponents([new MessageButton().setStyle("SECONDARY").setCustomId(String(move)).setLabel(String(move))])
													})
													if (poke.moves.length == 0) {
														row.addComponents([new MessageButton().setStyle("SECONDARY").setCustomId(String(my_moves[0])).setLabel(String(my_moves[0]))])
													}

													let _msg = await interaction.followUp({ content: `Click On The Below Buttons To Choose Your Moves:!`, components: [row], ephemeral: true })
													const _collector = await _msg.createMessageComponentCollector({
														max: 1,
														time: 30000
													})
													_collector.on("end", async (collected) => {
														if (collected.size <= 0) {
															Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																if (err) {
																	return;
																} if (res) {
																	return interaction.channel.send(`No Response From The Trainer, The Battle Has Ended.`)
																}
															})
														}
													})
													_collector.on("collect", async (collect) => {
														collect.deferUpdate()
														fetch(`https://pokeapi.co/api/v2/move/${collect.customId}`) // fetching move data
															.then(res => res.json())
															.then(async mv => {
																fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
																	.then(res => res.json())
																	.then(async mav => {
																		// doing damaging stuff from here.
																		// checking who will go first..
																		if (speedTotal < _speedTotal) { // player pokemon's speed is less than the ai's
																			let damage;
																			let aidamage;
																			let power = mav.power !== null ? mav.power : 0
																			let attack = _atkTotal // ai's attack iv.
																			if (mav.damage_class == "special") attack = _spatkTotal;
																			let defence = defTotal // player's defence
																			if (mav.damage_class == "special") defence = spdefTotal
																			let stab = 1
																			let pokemon_type = deta.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																			if (pokemon_type.includes(mav.type.name)) {
																				stab = 1.2;
																			}
																			let accuracy_wheel = getRandomNumberBetween(1, 100)
																			let dodged = 1;
																			if (mav.accuracy <= accuracy_wheel) {
																				dodged = 0.25;
																			}
																			let modifier = stab * dodged;
																			console.log(`Bot Stats\nPower: ${power} - Attack: ${attack} - Defence: ${defence} - Modifier: ${modifier}`)
																			aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																			// since ai's first move...
																			hpTotal = hpTotal - aidamage;

																			if (hpTotal < 1) {
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`Battle`)
																						.setColor(color)
																						.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																						.setTimestamp()
																						.setDescription(`**__${client.user.username}__** Did **${aidamage} Damage!**\n\n${interaction.user.username}'s ${data.name} Fainted!`)]
																				})
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																						.setDescription(`The Battle has Ended And The Winner is **${client.user.tag}**`)
																						.addField(`${interaction.user.tag}'s side`, `**__HP:__\`0\` - ${poke.name} | ${poke.totalIV}%**`, true)
																						.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																						.setColor(color)
																						.setImage(`attachment://battle.png`)],
																					files: [attachment]
																				})
																				Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																					if (err) {
																						return;
																					} if (res) {
																						return;
																					}
																				})
																				// will add the spawn deletion here...
																			} else { // if survived, then now it's player's turn...
																				let _power = mv.power !== null ? mv.power : 0
																				let _attack = atkTotal;
																				if (mv.damage_class == "special") _attack = spatkTotal;
																				let _defence = _defTotal;
																				if (mv.damage_class == "special") _defence = _spdefTotal;
																				let _stab = 1
																				let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																				if (_pokemon_type.includes(mv.type.name)) {
																					stab = 1.2;
																				}
																				let _accuracy_wheel = getRandomNumberBetween(1, 100)
																				let _dodged = 1;
																				if (mv.accuracy <= _accuracy_wheel) {
																					_dodged = 0.25;
																				}
																				let _modifier = _stab * _dodged;
																				console.log(`Player Stats\nPower: ${_power} - Attack: ${_attack} - Defence: ${_defence} - Modifier: ${_modifier}`)
																				damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the ai's damage;
																				// since now it's player's turn....
																				_hpTotal = _hpTotal - damage;
																				if (_hpTotal < 1) {
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle`)
																							.setColor(color)
																							.setTimestamp()
																							.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																							.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n${client.user.username}'s ${deta.name} Fainted!`)]
																					})
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																							.setDescription(`The Battle has Ended And The Winner is **${interaction.user.tag}**`)
																							.setImage(`attachment://battle.png`)
																							.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
																							.addField(`${client.user.tag}'s side`, `**__HP:__\`0\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																							.setColor(color)],
																						files: [attachment]
																					})
																					Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																						if (err) {
																							return;
																						} if (res) {
																							return;
																						}
																					})
																				} else { // run the duels again :skull: lol
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle`)
																							.setColor(color)
																							.setTimestamp()
																							.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																							.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n**__${client.user.username}__** Did **${aidamage} Damage!**`)]
																					})
																					battle_ai()
																				}
																			}
																		} else { // what if, speed of player's pokemon is more?
																			let damage;
																			let aidamage;
																			let power = mav.power !== null ? mav.power : 0
																			let attack = _atkTotal;
																			if (mv.damage_class == "special") attack = _spatkTotal;
																			let defence = defTotal;
																			if (mv.damage_class == "special") defence = spdefTotal;
																			let stab = 1
																			let pokemon_type = deta.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																			if (pokemon_type.includes(mav.type.name)) {
																				stab = 1.2;
																			}
																			let accuracy_wheel = getRandomNumberBetween(1, 100)
																			let dodged = 1;
																			if (mav.accuracy <= accuracy_wheel) {
																				dodged = 0.25;
																			}
																			let modifier = stab * dodged;
																			//console.log(`Bot Stats\nPower: ${power} - Attack: ${attack} - Defence: ${defence} - Modifier: ${modifier}`)
																			aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																			let _power = mv.power !== null ? mv.power : 0;
																			let _attack = atkTotal; // player's attack
																			if (mv.damage_class == "special") attack = spatkTotal;
																			let _defence = _defTotal;
																			if (mv.damage_class == "special") _defence = _spdefTotal;
																			let _stab = 1;
																			let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																			if (_pokemon_type.includes(mv.type.name)) {
																				_stab = 1.2;
																			}
																			let _accuracy_wheel = getRandomNumberBetween(1, 100)
																			let _dodged = 1;
																			if (mv.accuracy <= _accuracy_wheel) {
																				_dodged = 0.25;
																			}
																			let _modifier = _stab * _dodged;
																			damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);
																			// since it's player's first turn..
																			_hpTotal = _hpTotal - damage;
																			if (_hpTotal < 1) {
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`Battle`)
																						.setColor(color)
																						.setTimestamp()
																						.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																						.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n${client.user.username}'s ${deta.name} Fainted!`)]
																				})
																				await interaction.channel.send({
																					embeds: [new MessageEmbed()
																						.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																						.setDescription(`The Battle has Ended And The Winner is **${interaction.user.tag}**`)
																						.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
																						.addField(`${client.user.tag}'s side`, `**__HP:__\`0\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																						.setColor(color)
																						.setImage(`attachment://battle.png`)],
																					files: [attachment]
																				})
																				Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																					if (err) {
																						return;
																					} if (res) {
																						return;
																					}
																				})
																			} else {
																				// now ai's turn...
																				hpTotal = hpTotal - aidamage;
																				if (hpTotal < 1) {
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle`)
																							.setColor(color)
																							.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																							.setTimestamp()
																							.setDescription(`**__${client.user.username}__** Did **${aidamage} Damage!**\n\n${interaction.user.username}'s ${data.name} Fainted!`)]
																					})
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																							.setDescription(`The Battle has Ended And The Winner is **${client.user.tag}**`)
																							.setImage(`attachment://battle.png`)
																							.addField(`${interaction.user.tag}'s side`, `**__HP:__\`0\` - ${poke.name} | ${poke.totalIV}%**`, true)
																							.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																							.setColor(color)],
																						files: [attachment]
																					})
																					Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																						if (err) {
																							return;
																						} if (res) {
																							return;
																						}
																					})
																				} else {
																					// both survived, now battle again...
																					await interaction.channel.send({
																						embeds: [new MessageEmbed()
																							.setTitle(`Battle`)
																							.setColor(color)
																							.setTimestamp()
																							.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																							.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n**__${client.user.username}__** Did **${aidamage} Damage!**`)]
																					})
																					battle_ai()
																				}
																			}
																		}
																	})
															})
													})
												})
												collector.on("end", async (collected) => {
													if (collected.size <= 0) {
														Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
															if (err) {
																return;
															} if (res) {
																return interaction.channel.send(`No Response From The Trainer, The Battle Has Ended.`)
															}
														})
													}
												})
											}
											battle_ai()
										})
								})
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
				return interaction.reply({ content: `Uh Oh! Looks Like You Have Not Picked Your Starter yet!\nType \`/pick\` To Pick Your Starter!`, ephemeral: true })
			}
			if (user.pokemons.length < 1) {
				return interaction.reply({ content: `You Don't Have Any Pokémons To Battle!` })
			}
			if (user.selected.length !== 1) return interaction.reply({ content: `You Don't Have Any Pokémon Selected!` })
			let pk = user.pokemons.find(r => {
				delete r.xp;
				delete user.selected[0].xp;
				return r == user.selected[0]
			})
			let index = user.pokemons.indexOf(pk)
			await interaction.deferUpdate()
			//console.log(index)
			user = await User.findOne({ id: interaction.user.id })
			if (index > -1) {
				await interaction.message.edit({ components: [] })
				let opponent = spawn.pokename;
				let level = getRandomNumberBetween(50, 100)
				let poke = user.pokemons[index]
				fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`)
					.then(res => res.json())
					.then(async data => {
						fetch(`https://pokeapi.co/api/v2/pokemon/${opponent}`)
							.then(res => res.json())
							.then(async (deta) => {
								let _poke = new Pokemon({ name: opponent, level: level });
								_poke = instanceToPlain(_poke)
								// Getting Moves of Both Parties.
								let opponent_moves = deta.moves.filter((move) => {
									if (move.version_group_details[0].move_learn_method.name == "level-up") return move
								}).filter((move) => {
									if (move.version_group_details[0].level_learned_at <= _poke.level) return move;
								}).map(move => move.move.name)
								let my_moves = data.moves.filter((move) => {
									if (move.version_group_details[0].move_learn_method.name == "level-up") return move
								}).filter((move) => {
									if (move.version_group_details[0].level_learned_at <= _poke.level) return move;
								}).map(move => move.move.name)
								// Getting stats of Both Parties.
								// Getting My Stats
								let _level = poke.level;
								let hpBase = data.stats[0].base_stat;
								let atkBase = data.stats[1].base_stat;
								let defBase = data.stats[2].base_stat;
								let spatkBase = data.stats[3].base_stat;
								let spdefBase = data.stats[4].base_stat;
								let speedBase = data.stats[5].base_stat;
								let hpTotal = Math.floor(Math.floor((2 * hpBase + poke.hp + (0 / 4)) * _level / 100 + 5) * 1);
								let atkTotal = Math.floor(Math.floor((2 * atkBase + poke.atk + 0) * _level / 100 + 5) * 0.9);
								let defTotal = Math.floor(Math.floor((2 * defBase + poke.def + (0 / 4)) * _level / 100 + 5) * 1);
								let spatkTotal = Math.floor(Math.floor((2 * spatkBase + poke.spatk + (0 / 4)) * _level / 100 + 5) * 1.1);
								let spdefTotal = Math.floor(Math.floor((2 * spdefBase + poke.spdef + (0 / 4)) * _level / 100 + 5) * 1);
								let speedTotal = Math.floor(Math.floor((2 * speedBase + poke.speed + (0 / 4)) * _level / 100 + 5) * 1);
								// Getting AI's Stats
								let _hpBase = data.stats[0].base_stat;
								let _atkBase = data.stats[1].base_stat;
								let _defBase = data.stats[2].base_stat;
								let _spatkBase = data.stats[3].base_stat;
								let _spdefBase = data.stats[4].base_stat;
								let _speedBase = data.stats[5].base_stat;
								let _hpTotal = Math.floor(Math.floor((2 * _hpBase + _poke.hp + (0 / 4)) * level / 100 + 5) * 1);
								let _atkTotal = Math.floor(Math.floor((2 * _atkBase + _poke.atk + 0) * level / 100 + 5) * 0.9);
								let _defTotal = Math.floor(Math.floor((2 * _defBase + _poke.def + (0 / 4)) * level / 100 + 5) * 1);
								let _spatkTotal = Math.floor(Math.floor((2 * _spatkBase + _poke.spatk + (0 / 4)) * level / 100 + 5) * 1.1);
								let _spdefTotal = Math.floor(Math.floor((2 * _spdefBase + _poke.spdef + (0 / 4)) * level / 100 + 5) * 1);
								let _speedTotal = Math.floor(Math.floor((2 * _speedBase + _poke.speed + (0 / 4)) * level / 100 + 5) * 1);
								// Recieved The Stats / Moves, Now The Battle Time!
								let __hp = 100;
								//console.log(`Works Till Here!`)
								const canvas = Canvas.createCanvas(1920, 920);
								const context = canvas.getContext('2d');
								const bg = await Canvas.loadImage("https://i.imgur.com/2H2kAO4.png")
								context.drawImage(bg, 0, 0, canvas.width, canvas.height)
								const player1 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${data.id}.png`).catch(async (e) => {
									await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${data.id}.png`)
								})
								context.drawImage(player1, 50, 500, 700, 700)
								const player2 = await Canvas.loadImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${deta.id}.png`)
								context.drawImage(player2, 1050, 10, 700, 700)
								const attachment = new MessageAttachment(canvas.toBuffer(), `battle.png`)
								async function battle_ai() {
									//console.log(`Function Triggered.`)
									let attack = new MessageButton().setStyle("SECONDARY").setCustomId("choose_move").setLabel("Choose Move")
									attack = [new MessageActionRow().addComponents([attack])]
									let msg = await interaction.channel.send({
										embeds: [new MessageEmbed()
											.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
											.setDescription(`Click On The Below Button To Choose Your Moves.`)
											.setImage(`attachment://battle.png`)
											.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
											.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
											.setColor(color)],
										components: attack,
										files: [attachment]
									})
									const filter = i => {
										if (i.user.id == interaction.user.id) return true;
										else return i.reply({ content: `This Button is Not For You!` })
									}
									const collector = msg.createMessageComponentCollector({
										filter,
										max: 1,
										time: 30000
									})
									collector.on("collect", async (click) => {
										click.deferUpdate()
										let row = new MessageActionRow()
										poke.moves.forEach(async move => {
											row.addComponents([new MessageButton().setStyle("SECONDARY").setCustomId(String(move)).setLabel(String(move))])
										})
										if (poke.moves.length == 0) {
											row.addComponents([new MessageButton().setStyle("SECONDARY").setCustomId(String(my_moves[0])).setLabel(String(my_moves[0]))])
										}

										let _msg = await interaction.followUp({ content: `Click On The Below Buttons To Choose Your Moves:!`, components: [row], ephemeral: true })
										const _collector = await _msg.createMessageComponentCollector({
											max: 1,
											time: 30000
										})
										_collector.on("end", async (collected) => {
											if (collected.size <= 0) {
												Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
													if (err) {
														return;
													} if (res) {
														return interaction.channel.send(`No Response From The Trainer, The Battle Has Ended.`)
													}
												})
											}
										})
										_collector.on("collect", async (collect) => {
											collect.deferUpdate()
											fetch(`https://pokeapi.co/api/v2/move/${collect.customId}`) // fetching move data
												.then(res => res.json())
												.then(async mv => {
													fetch(`https://pokeapi.co/api/v2/move/${opponent_moves[Math.floor(Math.random() * opponent_moves.length)]}`)
														.then(res => res.json())
														.then(async mav => {
															// doing damaging stuff from here.
															// checking who will go first..
															if (speedTotal < _speedTotal) { // player pokemon's speed is less than the ai's
																let damage;
																let aidamage;
																let power = mav.power !== null ? mav.power : 0
																let attack = _atkTotal // ai's attack iv.
																if (mav.damage_class == "special") attack = _spatkTotal;
																let defence = defTotal // player's defence
																if (mav.damage_class == "special") defence = spdefTotal
																let stab = 1
																let pokemon_type = deta.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																if (pokemon_type.includes(mav.type.name)) {
																	stab = 1.2;
																}
																let accuracy_wheel = getRandomNumberBetween(1, 100)
																let dodged = 1;
																if (mav.accuracy <= accuracy_wheel) {
																	dodged = 0.25;
																}
																let modifier = stab * dodged;
																console.log(`Bot Stats\nPower: ${power} - Attack: ${attack} - Defence: ${defence} - Modifier: ${modifier}`)
																aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																// since ai's first move...
																hpTotal = hpTotal - aidamage;

																if (hpTotal < 1) {
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`Battle`)
																			.setColor(color)
																			.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																			.setTimestamp()
																			.setDescription(`**__${client.user.username}__** Did **${aidamage} Damage!**\n\n${interaction.user.username}'s ${data.name} Fainted!`)]
																	})
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																			.setDescription(`The Battle has Ended And The Winner is **${client.user.tag}**`)
																			.addField(`${interaction.user.tag}'s side`, `**__HP:__\`0\` - ${poke.name} | ${poke.totalIV}%**`, true)
																			.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																			.setColor(color)
																			.setImage(`attachment://battle.png`)],
																		files: [attachment]
																	})
																	Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																		if (err) {
																			return;
																		} if (res) {
																			return;
																		}
																	})
																	// will add the spawn deletion here...
																} else { // if survived, then now it's player's turn...
																	let _power = mv.power !== null ? mv.power : 0
																	let _attack = atkTotal;
																	if (mv.damage_class == "special") _attack = spatkTotal;
																	let _defence = _defTotal;
																	if (mv.damage_class == "special") _defence = _spdefTotal;
																	let _stab = 1
																	let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																	if (_pokemon_type.includes(mv.type.name)) {
																		stab = 1.2;
																	}
																	let _accuracy_wheel = getRandomNumberBetween(1, 100)
																	let _dodged = 1;
																	if (mv.accuracy <= _accuracy_wheel) {
																		_dodged = 0.25;
																	}
																	let _modifier = _stab * _dodged;
																	console.log(`Player Stats\nPower: ${_power} - Attack: ${_attack} - Defence: ${_defence} - Modifier: ${_modifier}`)
																	damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);// calculate the ai's damage;
																	// since now it's player's turn....
																	_hpTotal = _hpTotal - damage;
																	if (_hpTotal < 1) {
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle`)
																				.setColor(color)
																				.setTimestamp()
																				.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																				.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n${client.user.username}'s ${deta.name} Fainted!`)]
																		})
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																				.setDescription(`The Battle has Ended And The Winner is **${interaction.user.tag}**`)
																				.setImage(`attachment://battle.png`)
																				.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
																				.addField(`${client.user.tag}'s side`, `**__HP:__\`0\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																				.setColor(color)],
																			files: [attachment]
																		})
																		Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																			if (err) {
																				return;
																			} if (res) {
																				return;
																			}
																		})
																	} else { // run the duels again :skull: lol
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle`)
																				.setColor(color)
																				.setTimestamp()
																				.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																				.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n**__${client.user.username}__** Did **${aidamage} Damage!**`)]
																		})
																		battle_ai()
																	}
																}
															} else { // what if, speed of player's pokemon is more?
																let damage;
																let aidamage;
																let power = mav.power !== null ? mav.power : 0
																let attack = _atkTotal;
																if (mv.damage_class == "special") attack = _spatkTotal;
																let defence = defTotal;
																if (mv.damage_class == "special") defence = spdefTotal;
																let stab = 1
																let pokemon_type = deta.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																if (pokemon_type.includes(mav.type.name)) {
																	stab = 1.2;
																}
																let accuracy_wheel = getRandomNumberBetween(1, 100)
																let dodged = 1;
																if (mav.accuracy <= accuracy_wheel) {
																	dodged = 0.25;
																}
																let modifier = stab * dodged;
																//console.log(`Bot Stats\nPower: ${power} - Attack: ${attack} - Defence: ${defence} - Modifier: ${modifier}`)
																aidamage = Math.floor(((0.5 * power * (attack / defence) * modifier) / 2) + 1);// calculate the ai's damage;
																let _power = mv.power !== null ? mv.power : 0;
																let _attack = atkTotal; // player's attack
																if (mv.damage_class == "special") attack = spatkTotal;
																let _defence = _defTotal;
																if (mv.damage_class == "special") _defence = _spdefTotal;
																let _stab = 1;
																let _pokemon_type = data.types.map(r => r.type.name.replace(/\b\w/g, l => l.toLowerCase()))
																if (_pokemon_type.includes(mv.type.name)) {
																	_stab = 1.2;
																}
																let _accuracy_wheel = getRandomNumberBetween(1, 100)
																let _dodged = 1;
																if (mv.accuracy <= _accuracy_wheel) {
																	_dodged = 0.25;
																}
																let _modifier = _stab * _dodged;
																damage = Math.floor(((0.5 * _power * (_attack / _defence) * _modifier) / 2) + 1);
																// since it's player's first turn..
																_hpTotal = _hpTotal - damage;
																if (_hpTotal < 1) {
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`Battle`)
																			.setColor(color)
																			.setTimestamp()
																			.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																			.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n${client.user.username}'s ${deta.name} Fainted!`)]
																	})
																	await interaction.channel.send({
																		embeds: [new MessageEmbed()
																			.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																			.setDescription(`The Battle has Ended And The Winner is **${interaction.user.tag}**`)
																			.addField(`${interaction.user.tag}'s side`, `**__HP:__\`${hpTotal}\` - ${poke.name} | ${poke.totalIV}%**`, true)
																			.addField(`${client.user.tag}'s side`, `**__HP:__\`0\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																			.setColor(color)
																			.setImage(`attachment://battle.png`)],
																		files: [attachment]
																	})
																	Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																		if (err) {
																			return;
																		} if (res) {
																			return;
																		}
																	})
																} else {
																	// now ai's turn...
																	hpTotal = hpTotal - aidamage;
																	if (hpTotal < 1) {
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle`)
																				.setColor(color)
																				.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																				.setTimestamp()
																				.setDescription(`**__${client.user.username}__** Did **${aidamage} Damage!**\n\n${interaction.user.username}'s ${data.name} Fainted!`)]
																		})
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle Between ${interaction.user.tag} And ${client.user.tag}`)
																				.setDescription(`The Battle has Ended And The Winner is **${client.user.tag}**`)
																				.setImage(`attachment://battle.png`)
																				.addField(`${interaction.user.tag}'s side`, `**__HP:__\`0\` - ${poke.name} | ${poke.totalIV}%**`, true)
																				.addField(`${client.user.tag}'s side`, `**__HP:__\`${_hpTotal}\` - ${_poke.name} | ${_poke.totalIV}%**`, true)
																				.setColor(color)],
																			files: [attachment]
																		})
																		Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
																			if (err) {
																				return;
																			} if (res) {
																				return;
																			}
																		})
																	} else {
																		// both survived, now battle again...
																		await interaction.channel.send({
																			embeds: [new MessageEmbed()
																				.setTitle(`Battle`)
																				.setColor(color)
																				.setTimestamp()
																				.addField(`Moves Choosed:`, `${client.user.username}: ${mav.name}\n${interaction.user.username}: ${mv.name}`)
																				.setDescription(`**__${interaction.user.username}__** Did **${damage} Damage!**\n\n**__${client.user.username}__** Did **${aidamage} Damage!**`)]
																		})
																		battle_ai()
																	}
																}
															}
														})
												})
										})
									})
									collector.on("end", async (collected) => {
										if (collected.size <= 0) {
											Spawn.findOneAndDelete({ id: interaction.channel.id }, async (err, res) => {
												if (err) {
													return;
												} if (res) {
													return interaction.channel.send(`No Response From The Trainer, The Battle Has Ended.`)
												}
											})
										}
									})
								}
								battle_ai()
							})
					})
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