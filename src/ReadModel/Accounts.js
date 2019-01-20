const { ReadModel } = require('ddd-js')

class Accounts extends ReadModel {
  /**
   * @param {Logger} logger
   * @param {EventDispatcher} eventDispatcher
   * @param {Object[]} accounts
   */
  constructor (logger, eventDispatcher, accounts = []) {
    super(logger, eventDispatcher)

    this._accounts = accounts

    this.registerEvent('Account.accountCreated', async event => this._accountCreated(event))
  }

  /**
   * @returns {Object[]}
   */
  get accounts () {
    return this._accounts
  }

  /**
   * @param {string} event.payload.name
   * @param {string} event.payload.type
   * @param {AccountMetadata} event.payload.metadata
   * @return {Event[]}
   * @private
   */
  async _accountCreated (event) {
    console.log(event)
    this._accounts.push(event.payload)

    return []
  }
}

module.exports = Accounts
