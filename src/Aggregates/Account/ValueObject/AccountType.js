const { Enum } = require('ddd-js')

class AccountType extends Enum {
  getEnumValues () {
    return [
      'bankaccount',
      'creditcard',
      'paypal',
      'bonuspoints',
      'debug',
      'liability'
    ]
  }
}

module.exports = AccountType
