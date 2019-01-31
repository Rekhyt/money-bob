const { StringValue } = require('ddd-js')

const Account = require('./Account')

class Debit extends Account {
  constructor (name, debitorName) {
    super(name)

    this.debitorName = debitorName
  }

  static tryCreate (name, rawTypeMetadata) {
    const missingFields = Account.validateMetadataFieldsExisting(['debitorName'], rawTypeMetadata)
    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s) in metadata: ${missingFields.join(', ')}`)
    }

    return new Debit(name, new StringValue(rawTypeMetadata.debitorName))
  }
}

module.exports = Debit
