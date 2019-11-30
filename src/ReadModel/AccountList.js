const { ReadModel } = require('ddd-js')
const Dinero = require('dinero.js')

class AccountList extends ReadModel {
  /**
   * @param {Logger} logger
   * @param {EventDispatcher} eventDispatcher
   * @param {AccountReadModel[]} accounts
   */
  constructor (logger, eventDispatcher, accounts = []) {
    super(logger, eventDispatcher)

    /** @property {AccountReadModel[]} */
    this._accounts = [...accounts]

    this.registerEvent('Account.accountCreated', async event => this.accountCreated(event.payload.name, event.payload.type, event.payload.currency, event.payload.metadata))
    this.registerEvent('Account.accountsLinked', async event => this.accountsLinked(event.payload.subAccountName, event.payload.parentAccountName))
    this.registerEvent('Account.tagsAdded', async event => this.tagsAdded(event.payload.name, event.payload.tags))
    this.registerEvent('Account.moneyAdded', async event => this.moneyAdded(event.payload.account, event.payload.amount, event.payload.currency))
    this.registerEvent('Account.moneyWithdrawn', async event => this.moneyWithdrawn(event.payload.account, event.payload.amount, event.payload.currency))
  }

  /**
   * @returns {AccountReadModel[]}
   */
  get accounts () {
    return this._accounts
  }

  /**
   * @param {string} name
   * @param {string} type
   * @param {string} currency
   * @param {AccountMetadata} metadata
   * @return {Promise<void>}
   */
  async accountCreated (name, type, currency, metadata) {
    this._accounts.push({ name, type, balance: 0, currency, metadata, tags: [], parent: null })
  }

  /**
   * @param {string} subAccountName
   * @param {string} parentAccountName
   * @returns {Promise<void>}
   */
  async accountsLinked (subAccountName, parentAccountName) {
    const subAccount = this._accounts.find(account => account.name === subAccountName)
    subAccount.parent = parentAccountName
  }

  /**
   * @param {string} name
   * @param {string[]} tags
   * @returns {Promise<void>}
   */
  async tagsAdded (name, tags) {
    /** @var {AccountReadModel} */
    const account = this._accounts.find(account => account.name === name)
    account.tags.push(...tags.filter(tag => !account.tags.includes(tag)))
  }

  /**
   * @param {string} name
   * @param {number} amount
   * @param {string} currency
   * @returns {Promise<void>}
   */
  async moneyAdded (name, amount, currency) {
    const account = this._accounts.find(account => account.name === name)
    account.balance = new Dinero({ amount: account.balance, currency: account.currency })
      .add(new Dinero({ amount, currency })).getAmount()
  }

  /**
   * @param {string} name
   * @param {number} amount
   * @param {string} currency
   * @returns {Promise<void>}
   */
  async moneyWithdrawn (name, amount, currency) {
    const account = this._accounts.find(account => account.name === name)
    account.balance = new Dinero({ amount: account.balance, currency: account.currency })
      .subtract(new Dinero({ amount, currency })).getAmount()
  }
}

module.exports = AccountList
