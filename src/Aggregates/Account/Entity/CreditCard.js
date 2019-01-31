const { StringValue } = require('ddd-js')

const Account = require('./Account')
const CreditCardNumber = require('../ValueObject/CreditCardNumber')
const CreditCardType = require('../ValueObject/CreditCardType')

class CreditCard extends Account {
  /**
   * @param {AccountName} name
   * @param {StringValue} institute
   * @param {CreditCardType} type
   * @param {StringValue} holder
   * @param {CreditCardNumber} number
   */
  constructor (name, institute, type, holder, number) {
    super(name)

    this.institute = institute
    this.type = type
    this.holder = holder
    this.number = number
  }

  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['institute', 'type', 'holder', 'number'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new CreditCard(
      name,
      new StringValue(rawTypeMetadata.institute),
      new CreditCardType(rawTypeMetadata.type),
      new StringValue(rawTypeMetadata.holder),
      new CreditCardNumber(rawTypeMetadata.number)
    )
  }
}

module.exports = CreditCard
