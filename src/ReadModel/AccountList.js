const { ReadModel } = require('ddd-js')

class AccountList extends ReadModel {
  /**
   * @param {Logger} logger
   * @param {EventDispatcher} eventDispatcher
   * @param {*[]} accounts
   */
  constructor (logger, eventDispatcher, accounts = []) {
    super(logger, eventDispatcher)

    /** @var {*[]} */
    this._accounts = [...accounts]

    this.registerEvent('Account.accountCreated', async event => this.accountCreated(event.payload.name, event.payload.type, event.payload.metadata))
    this.registerEvent('Account.accountsLinked', async event => this.accountsLinked(event.payload.subAccountName, event.payload.parentAccountName))
    this.registerEvent('Account.tagsAdded', async event => this.tagsAdded(event.payload.name, event.payload.tags))
  }

  /**
   * @returns {Object[]}
   */
  get accounts () {
    return this._accounts
  }

  /**
   * @param {string} name
   * @param {string} type
   * @param {AccountMetadata} metadata
   * @return {Promise<void>}
   */
  async accountCreated (name, type, metadata) {
    this._accounts.push({ name, type, metadata, tags: [] })
  }

  /**
   * @param {string} parentAccountName
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
    const account = this._accounts.find(account => account.name === name)
    account.tags.push(...tags.filter(tag => !account.tags.includes(tag)))
  }
}

module.exports = AccountList
