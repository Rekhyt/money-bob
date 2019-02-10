const { EmailAddress } = require('ddd-js')

const Account = require('./Account')

class PayPal extends Account {
  /**
   * @param {AccountName} name
   * @param {EmailAddress} emailAddress
   */
  constructor (name, emailAddress) {
    super(name)

    this.institute = emailAddress
  }

  /**
   * @param {AccountName} name
   * @param {AccountMetadataPaypal} rawTypeMetadata
   * @returns {PayPal}
   */
  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['emailAddress'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new PayPal(name, new EmailAddress(rawTypeMetadata.emailAddress))
  }
}

module.exports = PayPal
