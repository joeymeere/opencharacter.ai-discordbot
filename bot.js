const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const profiles = new Map();
let currentProfile = null;

client.once('ready', async () => {
  console.log('Ready!');

  // Define a new global slash command
  client.application.commands.create({
    name: 'create',
    description: 'Creates a new soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'The name of the bot profile',
        required: true,
      },
      {
        name: 'essence',
        type: 3,
        description: 'The essence of the bot profile',
        required: true,
      },
      {
        name: 'personality',
        type: 3,
        description: 'The personality of the bot profile',
        required: true,
      },
      {
        name: 'avatar',
        type: 3,
        description: 'The avatar URL of the bot profile',
        required: true,
      },
    ],
  });

  console.log('Slash command /create has been created');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'create') {
    const name = interaction.options.getString('name');
    const essence = interaction.options.getString('essence');
    const personality = interaction.options.getString('personality');
    const avatar = interaction.options.getString('avatar');

    profiles.set(name, { name, essence, personality, avatar });

    await interaction.reply(`Profile ${name} created!`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message);
  if (message.channel.id === '1111061024645320834') {
    // if (message.content.startsWith('!')) {
    //   const name = message.content.slice(1);
    //
    //   if (profiles.has(name)) {
    //     currentProfile = profiles.get(name);
    //     await message.reply(`Profile switched to ${name}!`);
    //   }
    //   else if (currentProfile) {
    //     return;
    //   }
    // }
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Some title')
      .setURL('https://discord.js.org/')
      .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
      .setDescription('Some description here')
      .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
      )
      .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    message.channel.send({ embeds: [exampleEmbed] });
  }
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
