const { ValidationError } = require('ddd-js')
const Amount = require('../../../ValueObject/Amount')
const Money = require('../../../ValueObject/Money')

/**
 * @abstract
 */
class Account {
  /**
   * @param {AccountName} name
   * @param {Account?} parent
   * @param {Currency} currency
   * @param {Tag[]?} tags
   */
  constructor (name, currency, parent = null, tags = []) {
    this._name = name
    this._parent = parent
    this._tags = tags
    this._balance = new Money(new Amount(0), currency)
  }

  /**
   * @returns {AccountName}
   */
  get name () {
    return this._name
  }

  /**
   * @returns {Account}
   */
  get parent () {
    return this._parent
  }

  /**
   * @returns {Tag[]}
   */
  get tags () {
    return this._tags
  }

  /**
   * @returns {Money}
   */
  get balance () {
    return this._balance
  }

  /**
   * @param {Account} account
   * @returns {boolean}
   */
  equals (account) {
    return account.constructor.name === this.constructor.name && account._name.equals(this._name)
  }

  /**
   * @param {AccountName} parentAccountName
   */
  linkAccount (parentAccountName) {
    this._parent = parentAccountName
  }

  /**
   * @param {Tag[]} tags
   */
  addTags (tags) {
    this._tags.push(...tags.filter(tag => !this._tags.find(existingTag => tag.equals(existingTag))))
  }

  /**
   * @param {string[]} requiredFields
   * @param {*} metadata
   * @throws ValidationError if a required metadata field is missing
   */
  static validateMetadataFieldsExisting (requiredFields, metadata) {
    const missingFields = requiredFields.filter(key => !metadata.hasOwnProperty(key))

    if (missingFields.length === 0) return

    throw new ValidationError(
      missingFields.map(fieldName => { return { fieldName, message: `${fieldName} is a required field.` } })
    )
  }
}

module.exports = Account
