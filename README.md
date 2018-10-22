# Colloq
A framework for creating simple message-oriented discord bots powered by discord.js

## Example
Simple usage
```js
const Colloq = require('colloq')

// Default values
const config = {
  prefix: '!', // Prefix for command handling
  onReady: () => {}, //callback fired when discord.js client is ready
  deleteMessage: false, // Whehter or not delete message with command
  deleteDealy: 1000, // Delay before message deleting
  beforeCommandsExecute: async () => {}, // invoked after before commands executing
  afterCommandsExecute: async () => {}, // invoked after all the commands executed
  log: true, // whether or not print logs
  logger: console.log // function which will print logs
}

const bot = new Colloq('YOUR TOKEN', config)

// Type !ping to see pong in your channel or direct messages with bot
bot.on('ping', (args, message) => {
  message.send('pong!')
})

bot.listen().then(() => console.log('connected!'))
```
