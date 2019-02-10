const Account = require('./Account')
const DebitorName = require('../ValueObject/Metadata/DebitorName')

class Liability extends Account {
  /**
   * @param {AccountName} name
   * @param {DebitorName} debitorName
   */
  constructor (name, debitorName) {
    super(name)

    this.debitorName = debitorName
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataLiability} rawTypeMetadata
   * @returns {Liability}
   */
  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['debitorName'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new Liability(name, new DebitorName(rawTypeMetadata.debitorName))
  }
}

module.exports = Liability
