const { EmailAddress } = require('ddd-js')

const Account = require('./Account')

class PayPal extends Account {
  /**
   * @param {AccountName} name
   * @param {EmailAddress} emailAddress
   */
  constructor (name, emailAddress) {
    super(name)

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
   * @param {AccountMetadataPaypal} rawTypeMetadata
   * @returns {PayPal}
   */
  static tryCreate (name, rawTypeMetadata) {
    super.validateMetadataFieldsExisting(['emailAddress'], rawTypeMetadata)

    return new PayPal(name, new EmailAddress(rawTypeMetadata.emailAddress))
  }
}

module.exports = PayPal
