const assert = require('assert')
const { ValidationError } = require('ddd-js')
const Currency = require('../../../../../src/ValueObject/Currency')
const Paypal = require('../../../../../src/Aggregates/Account/Entity/Paypal')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

describe('Account.Entity.Paypal', () => {
  describe('tryCreate()', () => {
    it('should throw an error if a required metadata field is missing', () => {
      // noinspection JSCheckFunctionSignatures
      assert.throws(
        () => Paypal.tryCreate(new AccountName('test'), new Currency('USD'), { someNonsenseField: 'containing nonsense' }),
        ValidationError
      )
    })

    it('should create the object when all required fields are present', () => {
      const expectedAccountName = new AccountName('test')
      const expectedMetadata = { emailAddress: 'bob@weird-webdesign.com' }

      const entity = Paypal.tryCreate(expectedAccountName, new Currency('USD'), expectedMetadata)

      assert(entity instanceof Paypal)
      assert.ok(entity.name.equals(expectedAccountName))
      assert.strictEqual(entity.emailAddress.getValue(), expectedMetadata.emailAddress)
    })
  })
})
