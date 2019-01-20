class MetadataDebit {
  /**
   * @param {StringValue} debitorName
   */
  constructor (debitorName) {
    this._debitorName = debitorName
  }

  /**
   * @returns {StringValue}
   */
  get debitorName () {
    return this._debitorName
  }

  /**
   * @param {MetadataDebit} value
   * @returns {boolean}
   */
  equals (value) {
    return this._debitorName.equals(value.debitorName)
  }

  /**
   * @returns {string}
   */
  toString () {
    return `${this._debitorName}`
  }
}

module.exports = MetadataDebit
