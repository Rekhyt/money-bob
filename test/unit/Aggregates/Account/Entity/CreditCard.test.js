const assert = require('assert')
const { ValidationError } = require('ddd-js')
const Currency = require('../../../../../src/ValueObject/Currency')
const CreditCard = require('../../../../../src/Aggregates/Account/Entity/CreditCard')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

describe('Account.Entity.CreditCard', () => {
  describe('tryCreate()', () => {
    it('should throw an error if a required metadata field is missing', () => {
      // noinspection JSCheckFunctionSignatures
      assert.throws(
        () => CreditCard.tryCreate(new AccountName('test'), new Currency('USD'), { someNonsenseField: 'containing nonsense' }),
        ValidationError
      )
    })

    it('should create the object when all required fields are present', () => {
      const expectedAccountName = new AccountName('test')
      const expectedMetadata = {
        institute: 'abc',
        type: 'visa',
        holder: 'Bob',
        number: '4111111111111111'
      }

      const entity = CreditCard.tryCreate(expectedAccountName, new Currency('USD'), expectedMetadata)

      assert(entity instanceof CreditCard)
      assert.ok(entity.name.equals(expectedAccountName))
      assert.strictEqual(entity.institute.getValue(), expectedMetadata.institute)
      assert.strictEqual(entity.type.getValue(), expectedMetadata.type)
      assert.strictEqual(entity.holder.getValue(), expectedMetadata.holder)
      assert.strictEqual(entity.number.getValue(), expectedMetadata.number)
    })
  })
})
