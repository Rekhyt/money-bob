const { Enum } = require('ddd-js')

class CreditCardType extends Enum {
  getEnumValues () {
    return [
      'visa',
      'mastercard',
      'american-express',
      'diners-club',
      'discover',
      'jcb',
      'unionpay',
      'maestro',
      'mir',
      'elo'
    ]
  }
}

module.exports = CreditCardType
