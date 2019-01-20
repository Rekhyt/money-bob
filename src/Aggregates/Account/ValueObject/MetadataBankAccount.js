class MetadataBankAccount {
  /**
   * @param {StringValue} institute
   * @param {Iban} iban
   * @param {Bic} bic
   */
  constructor (institute, iban, bic) {
    this._institute = institute
    this._iban = iban
    this._bic = bic
  }

  /**
   * @returns {StringValue}
   */
  get institute () {
    return this._institute
  }

  /**
   * @returns {Bic}
   */
  get bic () {
    return this._bic
  }

  /**
   * @returns {Iban}
   */
  get iban () {
    return this._iban
  }

  /**
   * @param {MetadataBankAccount} value
   * @returns {boolean}
   */
  equals (value) {
    return this._institute.equals(value.institute) && this._iban.equals(value.iban) && this._bic.equals(value.bic)
  }

  /**
   * @returns {string}
   */
  toString () {
    return `IBAN: ${this._iban} / BIC: ${this._bic} (${this._institute})`
  }
}

module.exports = MetadataBankAccount
