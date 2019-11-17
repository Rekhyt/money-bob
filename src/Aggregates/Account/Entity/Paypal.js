const { EmailAddress } = require('ddd-js')

const Account = require('./Account')

class PayPal extends Account {
  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {EmailAddress} emailAddress
   */
  constructor (name, currency, emailAddress) {
    super(name, currency)

    this._emailAddress = emailAddress
  }

  /**
   * @returns {EmailAddress}
   */
  get emailAddress () {
    return this._emailAddress
  }

  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {AccountMetadataPaypal} rawTypeMetadata
   * @returns {PayPal}
   */
  static tryCreate (name, currency, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['emailAddress'], rawTypeMetadata)

    return new PayPal(name, currency, new EmailAddress(rawTypeMetadata.emailAddress))
  }
}

module.exports = PayPal
