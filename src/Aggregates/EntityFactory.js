const Account = require('./Account/Entity/Account')

class EntityFactory {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   */
  constructor (logger, commandDispatcher) {
    this._logger = logger
    this._commandDispatcher = commandDispatcher
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
    return new constructor(...[this._logger, this._commandDispatcher, ...args])
  }
}

module.exports = EntityFactory
