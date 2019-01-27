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

    this._metadataRequiredFieldsByType = {
      bankaccount: ['institute', 'iban', 'bic'],
      creditcart: ['institute', 'type', 'holder', 'number'],
      paypal: ['emailAddress'],
      debit: ['debitorName'],
      liability: ['debitorName']
    }

    this.registerCommand('Account.createAccount', command => this._createAccount(command))

    this.registerEvent('Account.accountCreated', event => this._accountCreated(event))
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
    const { name, type } = this._payloadToValueObjects(command.payload)

    if (this._accounts.find(account => account.name.equals(name))) {
      throw new Error(`Account with name "${name}" already exists.`)
    }

    if (!command.payload.metadata[type]) {
      throw new Error(`No metadata provided for account type "${type}".`)
    }

    return [this.createEvent('Account.accountCreated', command.payload)]
  }

  /**
   * @param {string} event.name
   * @param {string} event.time
   * @param {string} event.payload.name
   * @param {string} event.payload.type
   * @param {AccountMetadata} event.payload.metadata
   * @private
   */
  _accountCreated (event) {
    const { name, type, metadata } = this._payloadToValueObjects(event.payload)

    this._accounts.push({ name, type, metadata })
  }

  /**
   * @param {string} payload.name
   * @param {string} payload.type
   * @param {AccountMetadata} payload.metadata
   * @returns {{name: AccountName, type: AccountType, metadata: *}}
   * @private
   */
  _payloadToValueObjects (payload) {
    const name = new AccountName(payload.name)
    const type = new AccountType(payload.type)
    const metadata = this._extractMetadata(type, payload.metadata)

    return { name, type, metadata }
  }

  /**
   * @param {AccountType} type
   * @param {object} metadata
   * @returns {*}
   * @private
   */
  _extractMetadata (type, metadata) {
    if (!metadata[type] || typeof metadata[type] !== 'object') {
      throw new Error(`No metadata for account type ${type} or metadata not an object.`)
    }

    const missingFields = this._validateMetadataFieldsExisting(type, metadata[type])
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

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

  _validateMetadataFieldsExisting (type, metadata) {
    return this._metadataRequiredFieldsByType[type].filter(key => !metadata.hasOwnProperty(key))
  }
}

module.exports = Account
