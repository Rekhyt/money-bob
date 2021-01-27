const { ReadModel } = require('ddd-js')

class AccountTree extends ReadModel {
  setup () {
    /** @property {TreeListAccountReadModel[]} */
    this._accountList = []

    /** @property {TreeAccountReadModel[]} */
    this._accountTree = []

    this.registerEvent('Account.accountCreated', async event => this.accountCreated(event.payload.name))
    this.registerEvent('Account.accountsLinked', async event => this.accountsLinked(event.payload.subAccountName, event.payload.parentAccountName))
    this.registerEvent('Account.tagsAdded', async event => this.tagsAdded(event.payload.name, event.payload.tags))
  }

  /**
   * @returns {Object[]}
   */
  get accounts () {
    return this._accountTree
  }

  /**
   * @param {string }accountName
   * @returns {Promise<void>}
   */
  async accountCreated (accountName) {
    this._accountList.push({ name: accountName, tags: [], children: [], parent: null })
    this._accountTree.push({ name: accountName, tags: [], children: [] })
  }

  /**
   * @param {string} subAccountName
   * @param {string} parentAccountName
   * @returns {Promise<void>}
   */
  async accountsLinked (subAccountName, parentAccountName) {
    this._accountList.forEach(account => {
      account.children = account.children.filter(subAccount => subAccount !== subAccountName)
    })
    this._accountList.find(account => account.name === subAccountName).parent = parentAccountName
    this._accountList.find(account => account.name === parentAccountName).children.push(subAccountName)

    this._accountTree = this._rebuildTree(this._accountList)
  }

  /**
   * @param {string} name
   * @param {string[]} tags
   * @returns {Promise<void>}
   */
  async tagsAdded (name, tags) {
    const account = this._accountList.find(account => account.name === name)
    account.tags.push(...tags.filter(tag => !account.tags.includes(tag)))

    this._accountTree = this._rebuildTree(this._accountList)
  }

  _rebuildTree (accounts, parentAccount = null) {
    const newTree = []

    for (const account of accounts) {
      if (
        (!parentAccount && account.parent !== null) ||
        (parentAccount && parentAccount.name && parentAccount.name !== account.parent)
      ) {
        continue
      }

      const subAccounts = account.children.map(subAccount => {
        if (typeof subAccount === 'object') subAccount = subAccount.name

        return this._accountList.find(account => account.name === subAccount)
      })

      account.children = this._rebuildTree(subAccounts, account)

      newTree.push(account)
    }

    return newTree
  }
}

module.exports = AccountTree
