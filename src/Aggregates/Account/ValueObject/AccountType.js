const { Enum } = require('ddd-js')

class AccountType extends Enum {
  getEnumValues () {
    return [
      'bankaccount',
      'creditcard',
      'paypal',
      'debit',
      'liability'
    ]
  }
}

module.exports = AccountType
