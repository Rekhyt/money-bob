const { EmailAddress } = require('ddd-js')

const Account = require('./Account')

class PayPal extends Account {
  constructor (name, emailAddress) {
    super(name)

    this.institute = emailAddress
  }

  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['emailAddress'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new PayPal(name, new EmailAddress(rawTypeMetadata.emailAddress))
  }
}

module.exports = PayPal
