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

    this.institute = institute
    this.type = type
    this.holder = holder
    this.number = number
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataCreditCard} rawTypeMetadata
   * @returns {CreditCard}
   */
  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['institute', 'type', 'holder', 'number'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

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
