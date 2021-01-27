const { RootEntity, ValidationError } = require('ddd-js')

// entities
const BankAccount = require('./BankAccount')
const CreditCard = require('./CreditCard')
const Paypal = require('./Paypal')
const Debit = require('./Debit')
const Liability = require('./Liability')
const Tag = require('../../../ValueObject/Tag')
const Amount = require('../../../ValueObject/Amount')
const Currency = require('../../../ValueObject/Currency')
const Money = require('../../../ValueObject/Money')

// value objects
const AccountName = require('../ValueObject/AccountName')
const AccountType = require('../ValueObject/AccountType')

class AccountList extends RootEntity {
  setup () {
    /** @property {Account[]} */
    this._accounts = []

    this._accountClasses = {
      bankaccount: BankAccount,
      creditcard: CreditCard,
      paypal: Paypal,
      debit: Debit,
      liability: Liability
    }

    // Commands
    this.registerCommand(
      'Account.createAccount',
      async command => this.createAccount(
        command.payload.name,
        command.payload.type,
        command.payload.currency,
        command.payload.metadata
      )
    )

    this.registerCommand(
      'Account.linkAccounts',
      async command => this.linkAccounts(command.payload.subAccountName, command.payload.parentAccountName)
    )

    this.registerCommand(
      'Account.addTags',
      async command => this.addTags(command.payload.name, command.payload.tags)
    )

    this.registerCommand(
      'Account.bookTransaction',
      async command => this.bookTransaction(command.payload.account1, command.payload.account2, command.payload.amount, command.payload.currency),
      command => this.bookTransactionEntities(command.payload.account1, command.payload.account2)
    )

    // Events
    this.registerEvent('Account.accountCreated', async event => this.accountCreated(event.payload.name, event.payload.type, event.payload.currency, event.payload.metadata))
    this.registerEvent('Account.accountsLinked', async event => this.accountsLinked(event.payload.subAccountName, event.payload.parentAccountName))
    this.registerEvent('Account.tagsAdded', async event => this.tagsAdded(event.payload.name, event.payload.tags))
    this.registerEvent('Account.moneyAdded', async event => this.moneyAdded(event.payload.account, event.payload.amount, event.payload.currency))
    this.registerEvent('Account.moneyWithdrawn', async event => this.moneyWithdrawn(event.payload.account, event.payload.amount, event.payload.currency))
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {string} rawCurrency
   * @param {AccountMetadata} rawMetadata
   * @returns {Promise<Event[]>}
   */
  async createAccount (rawName, rawType, rawCurrency, rawMetadata) {
    let name, currency, type
    const validationError = new ValidationError()

    try {
      name = new AccountName(rawName)
    } catch (err) {
      validationError.addInvalidField('name', err.message)
    }

    try {
      type = new AccountType(rawType)
    } catch (err) {
      validationError.addInvalidField('type', err.message)
    }

    try {
      currency = new Currency(rawCurrency)
    } catch (err) {
      validationError.addInvalidField('currency', err.message)
    }

    if (name && this._accounts.find(account => account.name.equals(name))) {
      validationError.addInvalidField('name', `Account with name "${name}" already exists.`)
    }

    if (type && !rawMetadata[type]) {
      validationError.addInvalidField('metadata', `No metadata provided for account type "${type}".`)
    }

    if (type && rawMetadata[type] && (typeof rawMetadata[type] !== 'object' || Array.isArray(rawMetadata[type]))) {
      validationError.addInvalidField('metadata', `Expected metadata to be an object.`)
    }

    if (type && rawMetadata[type] && typeof rawMetadata[type] === 'object' && !Array.isArray(rawMetadata[type])) {
      try {
        this._accountClasses[type].tryCreate(name, currency, rawMetadata[type])
      } catch (err) {
        validationError.addInvalidField('metadata', err.message)
      }
    }

    if (validationError.hasErrors()) throw validationError

    return [this.createEvent('Account.accountCreated', {
      name: name.getValue(),
      type: type.getValue(),
      currency: currency.getValue(),
      metadata: rawMetadata
    })]
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {string} rawCurrency
   * @param {AccountMetadata} rawMetadata
   */
  async accountCreated (rawName, rawType, rawCurrency, rawMetadata) {
    this._accounts.push(this._accountClasses[rawType].tryCreate(new AccountName(rawName), new Currency(rawCurrency), rawMetadata[rawType]))
  }

  /**
   * @param {string} rawSubAccountName
   * @param {string} rawParentAccountName
   * @returns {Promise<Event[]>}
   */
  async linkAccounts (rawSubAccountName, rawParentAccountName) {
    const validationError = new ValidationError()

    let subAccountName, parentAccountName

    try {
      subAccountName = new AccountName(rawSubAccountName)
    } catch (err) {
      validationError.addInvalidField('subAccountName', err.message)
    }

    try {
      parentAccountName = new AccountName(rawParentAccountName)
    } catch (err) {
      validationError.addInvalidField('parentAccountName', err.message)
    }

    let parentAccount, subAccount
    if (!validationError.hasErrors()) {
      subAccount = this._accounts.find(account => account.name.equals(subAccountName))
      if (!subAccount) {
        validationError.addInvalidField('subAccountName', `Sub account with name "${subAccountName}" not found.`)
      }

      parentAccount = this._accounts.find(account => account.name.equals(parentAccountName))
      if (!parentAccount) {
        validationError.addInvalidField('parentAccountName', `Parent account with name "${parentAccountName}" not found.`)
      }
    }

    if (!subAccount) throw validationError

    const currentParent = subAccount.parent
    if (!validationError.hasErrors() && currentParent) {
      validationError.addInvalidField('subAccountName', `Cannot link account ${subAccountName} that is already linked to ${currentParent}. Try moving the account instead.`)
    }

    if (!validationError.hasErrors() && parentAccount.equals(subAccount)) {
      validationError.addInvalidField('parentAccountName', `Cannot link account "${parentAccountName}" to itself.`)
    }

    if (!validationError.hasErrors()) {
      const linkPathParent = this._extractLinkPath(parentAccount)
      const linkPathSub = this._extractLinkPath(subAccount)

      if (linkPathParent.length + linkPathSub.length + 1 > 1000) {
        validationError.addInvalidField(
          'parentAccountName',
          `Cannot link "${subAccountName}" to "${parentAccountName}" as that would exceed the maximum link depth of 1000.`
        )

        throw validationError
      }

      if (linkPathParent.includes(subAccount)) {
        validationError.addInvalidField(
          'parentAccountName',
          `Cannot link account '${subAccountName}' to '${parentAccountName}' as that would close a circle: ` +
          `${subAccountName} => ${parentAccountName} => ${[
            ...linkPathParent.map(account => account.name),
            ...linkPathSub.map(account => account.name)
          ].join(' => ')}`
        )
      }
    }

    if (validationError.hasErrors()) throw validationError

    return [this.createEvent('Account.accountsLinked', {
      subAccountName: subAccountName.getValue(),
      parentAccountName: parentAccountName.getValue()
    })]
  }

  /**
   * @param {string} rawSubAccountName
   * @param {string} rawParentAccountName
   * @returns {Promise<void>}
   */
  async accountsLinked (rawSubAccountName, rawParentAccountName) {
    const subAccount = this._accounts.find(account => account.name.getValue() === rawSubAccountName)
    const parentAccount = this._accounts.find(account => account.name.getValue() === rawParentAccountName)

    subAccount.parent = parentAccount
    parentAccount.addChild(subAccount)
  }

  /**
   * @param {string} rawName
   * @param {string[]} rawTags
   * @returns {Promise<Event[]>}
   */
  async addTags (rawName, rawTags) {
    const validationError = new ValidationError()
    let name
    try {
      name = new AccountName(rawName)
    } catch (err) {
      validationError.addInvalidField('name', err.message)
    }

    let account
    if (name) {
      account = this._accounts.find(account => account.name.equals(name))

      if (!account) {
        validationError.addInvalidField('name', `Account with name "${name}" not found.`)
      }
    }

    const tags = rawTags.map((tag, index) => {
      // strip duplicates
      if (rawTags.includes(tag, index + 1)) return

      try {
        return new Tag(tag)
      } catch (err) {
        validationError.addInvalidField('tags', err.message)
      }
    }).filter(tag => !!tag)

    if (validationError.hasErrors()) throw validationError
    if (tags.length === 0) return []

    return [this.createEvent('Account.tagsAdded', { name: name.getValue(), tags: tags.map(tag => tag.getValue()) })]
  }

  /**
   * @param {string} rawName
   * @param {string[]} rawTags
   * @returns {Promise<void>}
   */
  async tagsAdded (rawName, rawTags) {
    this._accounts.find(account => account.name.getValue() === rawName).addTags(rawTags.map(tag => new Tag(tag)))
  }

  bookTransactionEntities (rawAccount1, rawAccount2) {
    const validationError = new ValidationError()

    let name1
    try {
      name1 = new AccountName(rawAccount1)
    } catch (err) {
      validationError.addInvalidField('account1', err.message)
    }

    let account1
    if (name1) {
      account1 = this._accounts.find(account => account.name.equals(name1))
      if (!account1) {
        validationError.addInvalidField('account1', `Account 1 with name "${name1}" not found.`)
      }
    }

    let name2
    try {
      name2 = new AccountName(rawAccount2)
    } catch (err) {
      validationError.addInvalidField('account2', err.message)
    }

    let account2
    if (name2) {
      account2 = this._accounts.find(account => account.name.equals(name2))
      if (!account2) {
        validationError.addInvalidField('account2', `Account 2 with name "${name2}" not found.`)
      }
    }

    return [account1, account2]
  }

  /**
   * @param {string} rawAccount1
   * @param {string} rawAccount2
   * @param {number} rawAmount
   * @param {string} rawCurrency
   * @returns {Promise<Event[]>}
   */
  async bookTransaction (rawAccount1, rawAccount2, rawAmount, rawCurrency) {
    const validationError = new ValidationError()

    let account1, account2
    try {
      [account1, account2] = this.bookTransactionEntities(rawAccount1, rawAccount2)
      // Uncomment this to test version conflicts:
      // account1.versionUp()
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err
      err.invalidFields.forEach(f => validationError.addInvalidField(f.fieldName, f.message))
    }

    if (account1 && account2) {
      if (account1.children.length) validationError.addInvalidField('account1', `Cannot book transaction from account ${account1.name} that is a parent of other accounts: ${account1.children.map(c => c.getValue())}.`)
      if (account2.children.length) validationError.addInvalidField('account2', `Cannot book transaction to account ${account2.name} that is a parent of other accounts: ${account2.children.map(c => c.getValue())}.`)
    }

    let amount
    try {
      amount = new Amount(rawAmount)
    } catch (err) {
      validationError.addInvalidField('amount', err.message)
    }

    let currency
    try {
      currency = new Currency(rawCurrency)
    } catch (err) {
      validationError.addInvalidField('currency', err.message)
    }

    let money
    try {
      if (account1 && account2 && amount && currency) {
        money = new Money(amount, currency)

        if (!money.currency.equals(account1.balance.currency)) {
          validationError.addInvalidField(
            'currency',
            `Passed currency ${currency} does not match account 1 currency ${account1.balance.currency}.`
          )
        }

        if (!money.currency.equals(account2.balance.currency)) {
          validationError.addInvalidField(
            'currency',
            `Passed currency ${currency} does not match account 2 currency ${account2.balance.currency}.`
          )
        }
      }
    } catch (err) {
      validationError.addInvalidField('amount', err.message)
    }

    if (validationError.hasErrors()) throw validationError

    return [
      this.createEvent('Account.moneyWithdrawn', {
        account: account1.name.getValue(),
        amount: money.getAmount().getValue(),
        currency: money.getCurrency().getValue()
      }),
      this.createEvent('Account.moneyAdded', {
        account: account2.name.getValue(),
        amount: money.getAmount().getValue(),
        currency: money.getCurrency().getValue()
      })
    ]
  }

  /**
   * @param {string} rawAccount
   * @param {number} rawAmount
   * @param {string} rawCurrency
   * @returns {Promise<void>}
   */
  async moneyAdded (rawAccount, rawAmount, rawCurrency) {
    this._accounts
      .find(account => account.name.getValue() === rawAccount).balance
      .add(new Money(new Amount(rawAmount), new Currency(rawCurrency)))
  }

  /**
   * @param {string} rawAccount
   * @param {number} rawAmount
   * @param {string} rawCurrency
   * @returns {Promise<void>}
   */
  async moneyWithdrawn (rawAccount, rawAmount, rawCurrency) {
    this._accounts
      .find(account => account.name.getValue() === rawAccount).balance
      .subtract(new Money(new Amount(rawAmount), new Currency(rawCurrency)))
  }

  /**
   * @param {Account} startAccount
   * @param {Account[]} path
   * @returns {Account[]}
   * @private
   */
  _extractLinkPath (startAccount, path = []) {
    if (startAccount.parent === null) {
      return [...path, startAccount]
    }

    const parentAccount = this._accounts.find(account => account.name.equals(startAccount.parent))
    path.push(startAccount)

    return this._extractLinkPath(parentAccount, path)
  }
}

module.exports = AccountList
