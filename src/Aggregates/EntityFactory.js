const Account = require('./Account/Entity/Account')

class EntityFactory {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   * @param {EventDispatcher} eventDispatcher
   */
  constructor (logger, commandDispatcher, eventDispatcher) {
    this._logger = logger
    this._commandDispatcher = commandDispatcher
    this._eventDispatcher = eventDispatcher
  }

  /**
   * @param {{name: AccountName}[]} accounts
   * @return {Account}
   */
  createAccount (accounts = []) {
    return this._createEntity(Account, accounts)
  }

  /**
   * @param {Class} constructor
   * @param {*} args
   * @returns {*}
   * @private
   */
  _createEntity (constructor, ...args) {
    return new constructor(...[this._logger, this._commandDispatcher, this._eventDispatcher, ...args])
  }
}

module.exports = EntityFactory
