const { StringValue } = require('ddd-js')

class Institute extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = Institute
