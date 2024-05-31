const { results } = require('@permaweb/aoconnect');
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

//DC_bot_token
const DISCORD_BOT_TOKEN = 'abcdefg';

//DC_channel_id
const DISCORD_CHANNEL_ID = '12345';


client.login(DISCORD_BOT_TOKEN);


client.once('ready', () => {
  console.log('Discord bot is ready');
});

const wss = new WebSocket.Server({ port: 1234 }, () => {
  console.log('WebSocket server is running on port 1234');
});


let lastProcessedAnchor = '';


async function fetchAndSendMessages() {
  try {
    const aoMessages = await results({
      process: 'LtqKYKWYPKLy2vjoe4gX_j1PbAnSr7Z9PZntlxXOxJk',
      sort: 'DESC',
      limit: 5, 
    });


    for (const element of aoMessages.edges.reverse()) {
      const messages = element.node.Messages;
      const filteredMessages = messages.filter(msg => msg.Tags.some(tag => tag.name === 'Action' && tag.value === 'Say'));

      for (const message of filteredMessages) {
        const anchor = message.Anchor;


        if (anchor > lastProcessedAnchor) {
          const eventTag = message.Tags.find(tag => tag.name === 'Event');
          const eventDescription = eventTag ? eventTag.value : 'Message in CoinssporRoom';
          const formattedMessage = `${message.Target}: ${message.Data}`;


          const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
          if (channel) {
            await channel.send(formattedMessage);
            console.log('Send msg to discord:', formattedMessage);
          }


          lastProcessedAnchor = anchor;
        }
      }
    }
  } catch (error) {
    console.error('Send msg to discord fail：', error);
  }
}

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', async (message) => {
    console.log('Received message:', message);
    await fetchAndSendMessages();
  });
});

setInterval(fetchAndSendMessages, 5000);

console.log('Start listening AOS...');

