const Account = require('./Account')
const CreditCardNumber = require('../ValueObject/CreditCardNumber')
const CreditCardType = require('../ValueObject/CreditCardType')
const CreditCardHolder = require('../ValueObject/Metadata/CreditCardHolder')
const Institute = require('../ValueObject/Metadata/Institute')

class CreditCard extends Account {
  /**
   * @param {AccountName} name
   * @param {Institute} institute
   * @param {CreditCardType} type
   * @param {CreditCardHolder} holder
   * @param {CreditCardNumber} number
   */
  constructor (name, institute, type, holder, number) {
    super(name)

    this._institute = institute
    this._type = type
    this._holder = holder
    this._number = number
  }

  /**
   * @returns {Institute}
   */
  get institute () {
    return this._institute
  }

  /**
   * @returns {CreditCardType}
   */
  get type () {
    return this._type
  }

  /**
   * @returns {CreditCardHolder}
   */
  get holder () {
    return this._holder
  }

  /**
   * @returns {CreditCardNumber}
   */
  get number () {
    return this._number
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataCreditCard} rawTypeMetadata
   * @returns {CreditCard}
   */
  static tryCreate (name, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['institute', 'type', 'holder', 'number'], rawTypeMetadata)

    return new CreditCard(
      name,
      new Institute(rawTypeMetadata.institute),
      new CreditCardType(rawTypeMetadata.type),
      new CreditCardHolder(rawTypeMetadata.holder),
      new CreditCardNumber(rawTypeMetadata.number)
    )
  }
}

module.exports = CreditCard
