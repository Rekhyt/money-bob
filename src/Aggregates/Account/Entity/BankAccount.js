const Account = require('./Account')
const Bic = require('../ValueObject/Bic')
const Iban = require('../ValueObject/Iban')
const Institute = require('../ValueObject/Metadata/Institute')

class BankAccount extends Account {
  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {Institute} institute
   * @param {Iban} iban
   * @param {Bic} bic
   */
  constructor (name, currency, institute, iban, bic) {
    super(name, currency)

    this._institute = institute
    this._iban = iban
    this._bic = bic
  }

  /**
   * @returns {Institute}
   */
  get institute () {
    return this._institute
  }

  /**
   * @returns {Iban}
   */
  get iban () {
    return this._iban
  }

  /**
   * @returns {Bic}
   */
  get bic () {
    return this._bic
  }

  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {AccountMetadataBankAccount} rawTypeMetadata
   * @returns {BankAccount}
   */
  static tryCreate (name, currency, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['institute', 'iban', 'bic'], rawTypeMetadata)

    return new BankAccount(
      name,
      currency,
      new Institute(rawTypeMetadata.institute),
      new Iban(rawTypeMetadata.iban),
      new Bic(rawTypeMetadata.bic)
    )
  }
}

module.exports = BankAccount
