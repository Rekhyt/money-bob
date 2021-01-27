const { ValidationError, BaseEntity } = require('ddd-js')
const Amount = require('../../../ValueObject/Amount')
const Money = require('../../../ValueObject/Money')

/**
 * @abstract
 */
class Account extends BaseEntity {
  /**
   * @param {AccountName} name
   * @param {Currency} currency
   * @param {Account?} parent
   * @param {Account[]?} children
   * @param {Tag[]?} tags
   */
  constructor (name, currency, parent = null, children = [], tags = []) {
    super()

    this._name = name
    this._parent = parent
    this._children = children
    this._tags = tags

    /** @var {Money} */
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
   * @param {Account} parentAccount
   */
  set parent (parentAccount) {
    this._parent = parentAccount
  }

  /**
   * @returns {Account[]}
   */
  get children () {
    return this._children
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
   * @param {Money} balance
   */
  set balance (balance) {
    this._balance = balance
  }

  /**
   * @param {Account} account
   * @returns {boolean}
   */
  equals (account) {
    return account.constructor.name === this.constructor.name &&
      account._name.equals(this._name) &&
      this._balance.getCurrency().equals(account.balance.getCurrency())
  }

  /**
   * @param {Account} subAccount
   */
  addChild (subAccount) {
    this._children.push(subAccount)
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
