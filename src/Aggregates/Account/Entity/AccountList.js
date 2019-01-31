const { Entity } = require('ddd-js')

// entities
const BankAccount = require('./BankAccount')
const CreditCard = require('./CreditCard')
const Paypal = require('./Paypal')
const Debit = require('./Debit')
const Liability = require('./Liability')

// value objects
const AccountName = require('../ValueObject/AccountName')
const AccountType = require('../ValueObject/AccountType')

class AccountList extends Entity {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   * @param {EventDispatcher} eventDispatcher
   * @param {Account[]} accounts
   */
  constructor (logger, commandDispatcher, eventDispatcher, accounts = []) {
    super(logger, commandDispatcher, eventDispatcher)

    /** @type Account[] */
    this._accounts = accounts

    this._accountClasses = {
      bankaccount: BankAccount,
      creditcard: CreditCard,
      paypal: Paypal,
      debit: Debit,
      liability: Liability
    }

    this.registerCommand('Account.createAccount', command => this._createAccount(command.payload.name, command.payload.type, command.payload.metadata))
    this.registerCommand('Account.linkAccounts', command => this._linkAccounts(command))

    this.registerEvent('Account.accountCreated', event => this._accountCreated(event.payload.name, event.payload.type, event.payload.metadata))
    this.registerEvent('Account.accountLinked', event => this._accountsLinked(event))
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {AccountMetadata} rawMetadata
   * @returns {Event[]}
   * @private
   */
  _createAccount (rawName, rawType, rawMetadata) {
    const name = new AccountName(rawName)
    const type = new AccountType(rawType)

    if (this._accounts.find(account => account.name.equals(name))) {
      throw new Error(`Account with name "${name}" already exists.`)
    }

    if (!rawMetadata[type]) {
      throw new Error(`No metadata provided for account type "${type}".`)
    }

    if (typeof rawMetadata[type] !== 'object') {
      throw new Error(`Expected metadata to be an object.`)
    }

    this._accountClasses[type].tryCreate(name, rawMetadata[type])

    return [this.createEvent('Account.accountCreated', { name: name.getValue(), type: type.getValue(), metadata: rawMetadata })]
  }

  /**
   * @param {string} rawName
   * @param {string} rawType
   * @param {AccountMetadata} rawMetadata
   * @private
   */
  async _accountCreated (rawName, rawType, rawMetadata) {
    this._accounts.push(this._accountClasses[rawType].tryCreate(new AccountName(rawName), rawMetadata[rawType]))
  }

  /**
   * @param {string} command.name
   * @param {string} command.time
   * @param {string} command.payload.parentAccountName
   * @param {string} command.payload.subAccountName
   * @returns {Event[]}
   * @private
   */
  _linkAccounts (command) {
    const parentAccountName = new AccountName(command.payload.parentAccountName)
    const subAccountName = new AccountName(command.payload.subAccountName)

    const parentAccount = this._accounts.find(account => account.name.equals(parentAccountName))
    if (!parentAccountName) {
      throw new Error(`Parent account with name "${parentAccountName}" not found.`)
    }

    const subAccount = this._accounts.find(account => account.name.equals(subAccountName))
    if (!subAccountName) {
      throw new Error(`Sub account with name "${subAccountName}" not found.`)
    }

    if (parentAccount.equals(subAccount)) {
      throw new Error(`Cannot link account "${subAccountName}" to itself.`)
    }

    return [this.createEvent('Account.accountsLinked', command.payload)]
  }

  /**
   * @param {Event} event
   * @returns {Promise<void>}
   * @private
   */
  async _accountsLinked (event) {
    this._accounts.find(account => account.name.getValue() === event.payload.subAccountName).parent = event.payload.parentAccountName
  }
}

module.exports = AccountList
