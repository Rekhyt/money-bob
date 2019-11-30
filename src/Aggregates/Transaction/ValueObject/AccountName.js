const { StringValue } = require('ddd-js')

class AccountName extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = AccountName
