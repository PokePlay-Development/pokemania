module.exports = {
	data: new SlashCommandBuilder()
		.setName('king')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};

