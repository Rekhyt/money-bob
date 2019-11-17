const Account = require('./Account')
const DebitorName = require('../ValueObject/Metadata/DebitorName')

class Debit extends Account {
  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {DebitorName} debitorName
   */
  constructor (name, currency, debitorName) {
    super(name, currency)

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
   * @param {Currency} currency
   * @param {AccountMetadataDebit} rawTypeMetadata
   * @returns {Debit}
   */
  static tryCreate (name, currency, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['debitorName'], rawTypeMetadata)

    return new Debit(name, currency, new DebitorName(rawTypeMetadata.debitorName))
  }
}

module.exports = Debit
