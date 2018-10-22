const { Client } = require('discord.js')
const Command = require('./command.js')

const noop = () => {}
const asyncNoop = async () => {}

const defaultOptions = {
  prefix: '!',
  onReady: noop,
  deleteMessage: false,
  deleteDealy: 1000,
  beforeCommandsExecute: asyncNoop,
  afterCommandsExecute: asyncNoop,
  channelsWhiteList: [],
  channelsBlackList: [],
  log: true,
  logger: console.log
}

class Colloq {
  constructor (token, options = {}) {
    if (!token) throw new Error('Colloq: token is required')

    this._token = token
    this.options = Object.assign({}, defaultOptions, options)

    // Set global commands options inhereted from main options
    this.commandOptions = {
      log: this.options.log,
      logger: this.options.logger,
      params: {}
    }

    this.client = new Client()
    this._commands = {}

    const _messageHandler = this._messageHandler.bind(this)

    this.client.on('message', _messageHandler)
    this.client.on('ready', this.options.onReady)

    return this
  }

  // PUBLIC

  on (...args) {
    const commandNames = args[0]
    const params = args[1]
    const handler = args[args.length - 1]
    if (!commandNames || !handler) throw new Error('Colloq.on: arguments are missing')

    const options = {
      ...this.commandOptions,
      params: {
        ...this.commandOptions.params,
        ...(params === handler ? {} : params) // check if params is not a handler
      }
    }

    this._addCommands(commandNames, handler, options)
    return this
  }

  listen () {
    return new Promise((resolve, reject) => {
      if (Object.keys(this._commands) === 0) {
        console.warn('Colloq warning: starting without any commands...')
      }
      this.client.login(this._token).then(resolve, reject)
    })
  }

  // PRIVATE

  async _messageHandler (message) {
    if (!message.content.startsWith(this.options.prefix)) return
    const commandName = this._getCommandName(message.content)

    if (this.options.deleteMessage) {
      message.delete(this.options.deleteDealy).then(() => {
        this._log('message deleted', message.content)
      })
    }

    await this._executeCommands(commandName, message)
  }

  _getCommandName (content) {
    return content.split(' ')[0].slice(this.options.prefix.length)
  }

  async _executeCommands (commandName, message) {
    if (!this._commands[commandName]) return

    await this.options.beforeCommandsExecute(commandName, message, this)

    for (const command of this._commands[commandName]) {
      try {
        await command.execute(message, this)
      } catch (e) {
        console.error(e)
      }
    }

    await this.options.afterCommandsExecute(commandName, message, this)
  }

  _addCommands (names, handler, options = {}) {
    const commandNames = this._parseCommandNames(names)
    this._setCommands(commandNames, handler, options)
  }

  _parseCommandNames (name) {
    let commandNames = []
    if (name instanceof String || name instanceof Number) {
      commandNames = [name]
    } else if (name instanceof Array) {
      commandNames = [...name]
    } else {
      throw new Error(`Colloq: invalid command name value: ${name}`)
    }

    return commandNames
  }

  _setCommands (commandNames, handler, options = {}) {
    commandNames.forEach(commandName => {
      const command = this._getCommandInstance(commandName, handler, options)

      if (!this._commands[command.name]) {
        this._commands[command.name] = []
      }
      this._commands[command.name].push(command)
    })
  }

  _getCommandInstance (commandName, handler, options = {}) {
    const isCommand = handler instanceof Command
    return isCommand ? handler : new Command(commandName, handler, options)
  }

  _log () {
    if (this.options.log) {
      this.options.logger(`${new Date()}:\t${arguments.join('\t')}`)
    }
  }
}

module.exports = Colloq
