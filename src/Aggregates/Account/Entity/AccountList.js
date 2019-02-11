const { RootEntity, ValidationError } = require('ddd-js')

// entities
const BankAccount = require('./BankAccount')
const CreditCard = require('./CreditCard')
const Paypal = require('./Paypal')
const Debit = require('./Debit')
const Liability = require('./Liability')
const Tag = require('../ValueObject/Tag')

// value objects
const AccountName = require('../ValueObject/AccountName')
const AccountType = require('../ValueObject/AccountType')

class AccountList extends RootEntity {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   * @param {EventDispatcher} eventDispatcher
   * @param {Account[]} accounts
   */
  constructor (logger, commandDispatcher, eventDispatcher, accounts = []) {
    super(logger, commandDispatcher, eventDispatcher)

    /** @type Account[] */
    this._accounts = [...accounts]

    this._accountClasses = {
      bankaccount: BankAccount,
      creditcard: CreditCard,
      paypal: Paypal,
      debit: Debit,
      liability: Liability
    }

    this.registerCommand('Account.createAccount', command => this.createAccount(command.payload.name, command.payload.type, command.payload.metadata))
    this.registerCommand('Account.linkAccounts', command => this.linkAccounts(command.payload.subAccountName, command.payload.parentAccountName))
    this.registerCommand('Account.addTags', command => this.addTags(command.payload.name, command.payload.tags))

    this.registerEvent('Account.accountCreated', event => this.accountCreated(event.payload.name, event.payload.type, event.payload.metadata))
    this.registerEvent('Account.accountsLinked', event => this.accountsLinked(event.payload.subAccountName, event.payload.parentAccountName))
    this.registerEvent('Account.tagsAdded', event => this.tagsAdded(event.payload.name, event.payload.tags))
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {AccountMetadata} rawMetadata
   * @returns {Event[]}
   */
  createAccount (rawName, rawType, rawMetadata) {
    let name, type
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

    if (name && this._accounts.find(account => account.name.equals(name))) {
      validationError.addInvalidField('name', `Account with name "${name}" already exists.`)
    }

    if (type && !rawMetadata[type]) {
      validationError.addInvalidField('metadata', `No metadata provided for account type "${type}".`)
    }

    if (type && rawMetadata[type] && typeof rawMetadata[type] !== 'object') {
      validationError.addInvalidField('metadata', `Expected metadata to be an object.`)
    }

    if (type && rawMetadata[type] && typeof rawMetadata[type] === 'object') {
      try {
        this._accountClasses[type].tryCreate(name, rawMetadata[type])
      } catch (err) {
        validationError.addInvalidField('metadata', err.message)
      }
    }

    if (validationError.hasErrors()) throw validationError

    return [this.createEvent('Account.accountCreated', { name: name.getValue(), type: type.getValue(), metadata: rawMetadata })]
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {AccountMetadata} rawMetadata
   */
  async accountCreated (rawName, rawType, rawMetadata) {
    this._accounts.push(this._accountClasses[rawType].tryCreate(new AccountName(rawName), rawMetadata[rawType]))
  }

  /**
   * @param {string} rawSubAccountName
   * @param {string} rawParentAccountName
   * @returns {Event[]}
   */
  linkAccounts (rawSubAccountName, rawParentAccountName) {
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

    if (!validationError.hasErrors() && parentAccount.equals(subAccount)) {
      validationError.addInvalidField('parentAccountName', `Cannot link account "${parentAccountName}" to itself.`)
    }

    if (!validationError.hasErrors()) {
      const linkPathParent = this._extractLinkPath(parentAccount)
      const linkPathSub = this._extractLinkPath(subAccount)

      if (linkPathParent.length + linkPathSub.length > 1000) {
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
    this._accounts.find(account => account.name.getValue() === rawSubAccountName).parent = new AccountName(rawParentAccountName)
  }

  /**
   * @param {string} rawName
   * @param {string[]} rawTags
   */
  addTags (rawName, rawTags) {
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
    }

    if (!account) {
      validationError.addInvalidField('name', `Account with name "${name}" not found.`)
    }

    const tags = rawTags.map((tag, index) => {
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

  async tagsAdded (rawName, rawTags) {
    this._accounts.find(account => account.name.getValue() === rawName).addTags(rawTags.map(tag => new Tag(tag)))
  }

  /**
   * @param {Account} startAccount
   * @param {Account[]} path
   * @returns {Account[]}
   * @private
   */
  _extractLinkPath (startAccount, path = []) {
    if (startAccount.parent === null) {
      return path
    }

    const parentAccount = this._accounts.find(account => account.name.equals(startAccount.parent))
    path.push(parentAccount)

    return this._extractLinkPath(parentAccount, path)
  }
}

module.exports = AccountList
