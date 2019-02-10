const Account = require('./Account')
const Bic = require('../ValueObject/Bic')
const Iban = require('../ValueObject/Iban')
const Institute = require('../ValueObject/Metadata/Institute')

class BankAccount extends Account {
  /**
   * @param {AccountName} name
   * @param {Institute} institute
   * @param {Iban} iban
   * @param {Bic} bic
   */
  constructor (name, institute, iban, bic) {
    super(name)

    this.institute = institute
    this.iban = iban
    this.bic = bic
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataBankAccount} rawTypeMetadata
   * @returns {BankAccount}
   */
  static tryCreate (name, rawTypeMetadata) {
    const missingFields = super.validateMetadataFieldsExisting(['institute', 'number', 'bic'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new BankAccount(
      name,
      new Institute(rawTypeMetadata.institute),
      new Iban(rawTypeMetadata.number),
      new Bic(rawTypeMetadata.bic)
    )
  }
}

module.exports = BankAccount
