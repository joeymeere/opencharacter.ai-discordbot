const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Soul, LanguageProcessor } = require('socialagi');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const souls = new Map();

client.once('ready', async () => {
  console.log('Ready!');
  
  // const guild = client.guilds.cache.get(guildId);
  // let commands = await guild.commands.fetch();
  // await commands.map(async (command) => {
  //   try {
  //     await guild.commands.delete(command.id);
  //     console.log(`Deleted command ${command.name}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });
  // commands = await client.application?.commands.fetch();
  // await commands.map(async (command) => {
  //   try {
  //     await client.application?.commands.delete(command.id);
  //     console.log(`Deleted command ${command.name}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });

  await client.application.commands.create({
    name: 'create',
    description: 'Creates a new soul in the current channel',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
      {
        name: 'essence',
        type: 3,
        description: 'The essence of the soul',
        required: true,
      },
      {
        name: 'personality',
        type: 3,
        description: 'The personality of the soul',
        required: true,
      },
      {
        name: 'avatar',
        type: 3,
        description: 'The avatar URL of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /create');

  await client.application.commands.create({
    name: 'list',
    description: 'List custom souls',
    options: [],
  });
  console.log('Created /list');

  await client.application.commands.create({
    name: 'disintegrate',
    description: 'Disintegrate a soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /disintegrate');

  await client.application.commands.create({
    name: 'whois',
    description: 'Inspect a soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /whois');

});

function registerSoul(soul, profileImg, channelId) {
  soul.on('says', message => {
    console.warn('SEND MESSAGE for', soul.blueprint.name, message);
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setAuthor({ name: soul.blueprint.name, iconURL:profileImg })
      .setThumbnail(profileImg)
      .setDescription(message);

    const channel = client.channels.cache.get(channelId);
    channel.send({ embeds: [exampleEmbed] });
  });
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const channelId = interaction.channelId;
  const channel = client.channels.cache.get(channelId);
  if (commandName === 'create') {
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      const existingChannelId = souls.get(name).channelId;
      const existingChannel = client.channels.cache.get(existingChannelId);
      await interaction.reply(`❗️ Soul of **${name}** exists in ${existingChannel}`);
    } else {
      const essence = interaction.options.getString('essence');
      const personality = interaction.options.getString('personality');
      const avatar = interaction.options.getString('avatar');

      const soul = new Soul({name, essence, personality, languageProcessor: LanguageProcessor.GPT_3_5_turbo});
      souls.set(name.toLowerCase(), {soul, channelId});

      registerSoul(soul, avatar, channelId);


      await interaction.reply(`✨
✨✨
  ✨✨✨
    ✨✨✨✨✨
         ✨✨✨✨✨✨✨✨
                ✨ Soul of **${name}** is born into ${channel}!`);
    }
  } else if (commandName === 'list') {
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === channelId);
    await interaction.reply(`✨ Found ${found.length} souls: ${found.map(n => `**${n}**`).join(', ')} in this channel`);
  } else if (commandName === 'disintegrate') {
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      souls.delete(name);
      await interaction.reply(`🧨
🧨
🧨
🧨
💥 Disintegrated soul of **${name}**`);
    } else {
      await interaction.reply('❗️ No soul to disintegrate');
    }
  } else if (commandName === 'whois') {
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      const soul = souls.get(name).soul;
      const {essence, personality} = soul.blueprint;
      await interaction.reply(`✨ Soul of **${name}**

🪄 **Essence**: ${essence}

💫 **Personality**: ${personality}`);
    } else {
      await interaction.reply('❗️ No soul to inspect');
    }
  }
});

const DEFAULT_MSG = 0;
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message.content, message.type);
  if (message.mentions.users.size > 0) return;

  if (message.type === DEFAULT_MSG) {
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === message.channelId);
    for (const name of found) {
      message.channel.sendTyping();
      souls.get(name.toLowerCase()).soul.tell(`${message.author.username} says ${message.content}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN_OPEN_SOULS);
