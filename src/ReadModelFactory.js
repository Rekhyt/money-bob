const Accounts = require('./ReadModel/Accounts')

class ReadModelFactory {
  /**
   * @param {Logger} logger
   * @param {EventDispatcher} eventDispatcher
   */
  constructor (logger, eventDispatcher) {
    this._logger = logger
    this._eventDispatcher = eventDispatcher
  }

  /**
   * @param {Object[]} accounts
   * @returns {Accounts}
   */
  createAccounts (accounts = []) {
    return this._createReadModel(Accounts, accounts)
  }

  /**
   * @param {Function} constructor
   * @param {*} args
   * @returns {*}
   * @private
   */
  _createReadModel (constructor, ...args) {
    return new constructor(...[this._logger, this._eventDispatcher, ...args])
  }
}

module.exports = ReadModelFactory
