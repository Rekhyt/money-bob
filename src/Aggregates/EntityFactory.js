const AccountList = require('./Account/Entity/AccountList')
const TransactionList = require('./Transaction/Entity/TransactionList')

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
   * @param {Account[]} accounts
   * @return {AccountList}
   */
  createAccountList (accounts = []) {
    return this._createEntity(AccountList, accounts)
  }

  /**
   * @param {Transaction[]} transactions
   * @returns {TransactionList}
   */
  createTransactionList (transactions = []) {
    return this._createEntity(TransactionList, transactions)
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
