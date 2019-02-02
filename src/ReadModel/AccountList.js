const { ReadModel } = require('ddd-js')

class Accounts extends ReadModel {
  /**
   * @param {Logger} logger
   * @param {EventDispatcher} eventDispatcher
   * @param {Object[]} accounts
   * @param {Object[]} accountLinks
   */
  constructor (logger, eventDispatcher, accounts = [], accountLinks = []) {
    super(logger, eventDispatcher)

    this._accounts = [...accounts]
    this._accountLinks = [...accountLinks]

    this.registerEvent('Account.accountCreated', async event => this._accountCreated(event.payload))
    this.registerEvent('Account.accountsLinked', async event => this._accountsLinked(event.payload))
  }

  /**
   * @returns {Object[]}
   */
  get accounts () {
    return this._accounts
  }

  /**
   * @param {string} accountData.name
   * @param {string} accountData.type
   * @param {AccountMetadata} accountData.metadata
   * @return {Promise<void>}
   * @private
   */
  async _accountCreated (accountData) {
    this._accounts.push(accountData)
  }

  /**
   * @param {string} parentAccountName
   * @param {string} subAccountName
   * @param {string} parentAccountName
   * @returns {Promise<void>}
   * @private
   */
  async _accountsLinked (subAccountName, parentAccountName) {
    const subAccount = this._accounts.find(account => account.name === payload.subAccountName)
    subAccount.parent = parentAccountName


  }
}

module.exports = Accounts
