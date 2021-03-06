class MetadataCreditCard {
  /**
   * @param {Institute} institute
   * @param {CreditCardType} type
   * @param {CreditCardHolder} holder
   * @param {CreditCardNumber} number
   */
  constructor (institute, type, holder, number) {
    this._institute = institute
    this._type = type
    this._holder = holder
    this._number = number
  }

  /**
   * @returns {Institute}
   */
  get institute () {
    return this._institute
  }

  /**
   * @returns {CreditCardType}
   */
  get type () {
    return this._type
  }

  /**
   * @returns {CreditCardHolder}
   */
  get holder () {
    return this._holder
  }

  /**
   * @returns {CreditCardNumber}
   */
  get number () {
    return this._number
  }

  /**
   * @param {MetadataCreditCard} value
   * @returns {boolean}
   */
  equals (value) {
    return this._institute.equals(value.institute) &&
      this._type.equals(value.type) &&
      this._holder.equals(value.holder) &&
      this._number.equals(value.number)
  }

  /**
   * @returns {string}
   */
  toString () {
    return `Institute: ${this._institute} / Type: ${this._type} / Holder: ${this._holder} / No.: ${this._number}`
  }
}

module.exports = MetadataCreditCard
