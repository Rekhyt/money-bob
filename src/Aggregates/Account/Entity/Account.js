const { Entity, StringValue, EmailAddress } = require('ddd-js')

const AccountName = require('../ValueObject/AccountName')
const AccountType = require('../ValueObject/AccountType')
const Bic = require('../ValueObject/Bic')
const CreditCardNumber = require('../ValueObject/CreditCardNumber')
const CreditCardType = require('../ValueObject/CreditCardType')
const Iban = require('../ValueObject/Iban')
const MetadataBankAccount = require('../ValueObject/MetadataBankAccount')
const MetadataCreditCart = require('../ValueObject/MetadataCreditCard')
const MetadataDebit = require('../ValueObject/MetadataDebit')
const MetadataLiability = require('../ValueObject/MetadataLiability')
const MetadataPayPal = require('../ValueObject/MetadataPayPal')

class Account extends Entity {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   * @param {EventDispatcher} eventDispatcher
   * @param {Object[]} accounts
   */
  constructor (logger, commandDispatcher, eventDispatcher, accounts = []) {
    super(logger, commandDispatcher, eventDispatcher)

    this._accounts = accounts

    this.registerCommand('Account.createAccount', command => this._createAccount(command))
  }

  /**
   * @param {string} command.name
   * @param {string} command.time
   * @param {string} command.payload.name
   * @param {string} command.payload.type
   * @param {AccountMetadata} command.payload.metadata
   * @private
   */
  _createAccount (command) {
    const name = new AccountName(command.payload.name)
    const type = new AccountType(command.payload.type)

    if (this._accounts.find(account => account.name.equals(name))) {
      throw new Error(`Account with name "${name}" already exists.`)
    }

    if (!command.payload.metadata[type]) {
      throw new Error(`No metadata provided for account type "${type}".`)
    }

    const metadata = this._extractMetadata(type, command.payload.metadata)

    this._accounts.push({ name, type, metadata })

    return [this.createEvent('Account.accountCreated', command.payload)]
  }

  /**
   * @param {AccountType} type
   * @param {object} metadata
   * @returns {*}
   * @private
   */
  _extractMetadata (type, metadata) {
    switch (type.getValue()) {
      case 'bankaccount':
        return new MetadataBankAccount(
          new StringValue(metadata[type].institute),
          new Iban(metadata[type].iban),
          new Bic(metadata[type].bic)
        )

      case 'creditcard':
        return new MetadataCreditCart(
          new StringValue(metadata[type].institute),
          new CreditCardType(metadata[type].type),
          new StringValue(metadata[type].holder),
          new CreditCardNumber(metadata[type].number)
        )
      case 'paypal':
        return new MetadataPayPal(new EmailAddress(metadata[type].emailAddress))

      case 'debit':
        return new MetadataDebit(new StringValue(metadata[type].debitorName))

      case 'liability':
        return new MetadataLiability(new StringValue(metadata[type].debitorName))
    }
  }
}

module.exports = Account
