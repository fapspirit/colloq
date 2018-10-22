// TODO: middlewares before execute
class Command {
  constructor (name, handler, options = {}) {
    if (!name || !handler) throw new Error('new Command: arguments are missing')

    const defaultOptions = {
      log: false,
      logger: console.log,
      params: {}
    }

    this.name = name
    this.handler = handler
    this.options = Object.assign({}, defaultOptions, options)
    return this
  }

  // PUBLIC

  async execute (message, wrapper) {
    const args = this._getArgs(message.content)

    try {
      await this.handler(args, message, wrapper, this.options.params)
      this._log(`executed by ${message.author}`)
    } catch (err) {
      this._log(`dispatched by ${message.author} failed to execute`)
      throw err
    }
  }

  // PRIVATE

  _getArgs (content) {
    // TODO: support key: value resolving
    return this._parseRawArgs(content)
  }

  _parseRawArgs (content) {
    return content.split(' ').slice(1)
  }

  _log (...logs) {
    if (this.options.log) {
      this.options.logger(`${new Date()}\tcommand: ${this.name}\t${logs.join('\t')}`)
    }
  }
}

module.exports = Command
