const AccountList = require('./ReadModel/AccountList')
const AccountTree = require('./ReadModel/AccountTree')

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
   * @returns {AccountList}
   */
  createAccountList (accounts = []) {
    return this._createReadModel(AccountList, accounts)
  }

  createAccountTree (accounts = []) {
    return this._createReadModel(AccountTree, accounts)
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
