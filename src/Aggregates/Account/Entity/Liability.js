const Account = require('./Account')
const DebitorName = require('../ValueObject/Metadata/DebitorName')

class Liability extends Account {
  /**
   * @param {AccountName} name
   * @param {DebitorName} debitorName
   */
  constructor (name, debitorName) {
    super(name)

    this._debitorName = debitorName
  }

  /**
   * @returns {DebitorName}
   */
  get debitorName () {
    return this._debitorName
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataLiability} rawTypeMetadata
   * @returns {Liability}
   */
  static tryCreate (name, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['debitorName'], rawTypeMetadata)

    return new Liability(name, new DebitorName(rawTypeMetadata.debitorName))
  }
}

module.exports = Liability
