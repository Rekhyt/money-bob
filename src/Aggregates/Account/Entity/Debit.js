const Account = require('./Account')
const DebitorName = require('../ValueObject/Metadata/DebitorName')

class Debit extends Account {
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
   * @param {AccountMetadataDebit} rawTypeMetadata
   * @returns {Debit}
   */
  static tryCreate (name, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['debitorName'], rawTypeMetadata)

    return new Debit(name, new DebitorName(rawTypeMetadata.debitorName))
  }
}

module.exports = Debit
