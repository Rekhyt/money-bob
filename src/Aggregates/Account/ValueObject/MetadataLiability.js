class MetadataLiability {
  /**
   * @param {DebitorName} debitorName
   */
  constructor (debitorName) {
    this._debitorName = debitorName
  }

  /**
   * @returns {DebitorName}
   */
  get debitorName () {
    return this._debitorName
  }

  /**
   * @param {MetadataLiability} value
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

module.exports = MetadataLiability
