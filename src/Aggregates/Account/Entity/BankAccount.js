const { StringValue } = require('ddd-js')

const Account = require('./Account')
const Iban = require('../ValueObject/Iban')
const Bic = require('../ValueObject/Bic')

class BankAccount extends Account {
  constructor (name, institute, iban, bic) {
    super(name)

    this.institute = institute
    this.iban = iban
    this.bic = bic
  }

  static tryCreate (name, rawTypeMetadata) {
    const missingFields = super.validateMetadataFieldsExisting(['institute', 'number', 'bic'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new BankAccount(
      name,
      new StringValue(rawTypeMetadata.institute),
      new Iban(rawTypeMetadata.number),
      new Bic(rawTypeMetadata.bic)
    )
  }
}

module.exports = BankAccount
