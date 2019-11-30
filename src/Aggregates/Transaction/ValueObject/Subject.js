const { StringValue } = require('ddd-js')

class Subject extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = Subject
