const { results, createDataItemSigner, message } = require('@permaweb/aoconnect');
const { Client, GatewayIntentBits } = require('discord.js');
const WebSocket = require('ws');
const { readFileSync } = require('node:fs');

const wallet = JSON.parse(readFileSync('/root/.aos.json').toString());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_BOT_TOKEN = 'xxxxxxxxx';

const DISCORD_CHANNEL_ID = 'xxxxxxxxxxxxx';

client.login(DISCORD_BOT_TOKEN);

client.once('ready', () => {
  console.log('Discord bot is ready');
});

let lastProcessedCursor = '';

async function fetchAndSendMessages() {
  try {
    const aoMessages = await results({
      process: 'Ektl_103Tgt7geZ5aIZQFhZGpzxo4RGA0NsW42vH0L0',
      sort: 'DESC',
      limit: 1,
    });

    for (const element of aoMessages.edges.reverse()) {
      const { cursor, node } = element;
      const { data } = node.Output;
      const dataString = typeof data === 'string' ? data : data.toString();

      //console.log(data)

      // const dataString = data.toString();
      if (cursor > lastProcessedCursor && dataString.includes('Getting-Started')) {
        const regex = /\[\x1B\[31m(.*?)\x1B\[.*?@\x1B\[34mGetting-Started\x1B\[0m\]> \x1B\[32m(.*?)\x1B\[0m/;
        const match = dataString.match(regex);
        //console.log(match)
        if (match) {
          const username = match[1];
          const messageContent = match[2];
          const formattedMessage = `${username}: ${messageContent}`;

          const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
          if (channel) {
            await channel.send(formattedMessage);
            console.log('Send Msg To Discord:', formattedMessage);
          }

          lastProcessedCursor = cursor;
        }
      }
    }
  } catch (error) {
    console.error('Send Msg To Discord Fail:', error);
  }
}

setInterval(fetchAndSendMessages, 5000);

client.on('messageCreate', async (msg) => {
  if (msg.channel.id === DISCORD_CHANNEL_ID && !msg.author.bot) {
    try {
      await message({
        process: 'Ektl_103Tgt7geZ5aIZQFhZGpzxo4RGA0NsW42vH0L0',
        tags: [
          { name: 'Action', value: 'ReceiveDiscord' },
          { name: 'Data', value: msg.content },
          { name: 'Event', value: msg.author.username },
        ],
        signer: createDataItemSigner(wallet),
        data: msg.content,
      });
      console.log('Send Msg To AOS:', msg.content);
    } catch (error) {
      console.error('Send Msg To AOS Fail:', error);
    }
  }
});

console.log('Listening....');
