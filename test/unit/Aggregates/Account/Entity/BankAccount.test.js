const assert = require('assert')
const { ValidationError } = require('ddd-js')
const BankAccount = require('../../../../../src/Aggregates/Account/Entity/BankAccount')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

describe('BankAccount', () => {
  describe('tryCreate()', () => {
    it('should throw an error if a required metadata field is missing', () => {
      // noinspection JSCheckFunctionSignatures
      assert.throws(
        () => BankAccount.tryCreate(new AccountName('test'), { someNonsenseField: 'containing nonsense' }),
        ValidationError
      )
    })

    it('should create the object when all required fields are present', () => {
      const expectedAccountName = new AccountName('test')
      const expectedMetadata = {
        institute: 'abc',
        iban: 'DE02120300000000202051',
        bic: 'BYLADEM1001'
      }

      const entity = BankAccount.tryCreate(expectedAccountName, expectedMetadata)

      assert(entity instanceof BankAccount)
      assert.ok(entity.name.equals(expectedAccountName))
      assert.strictEqual(entity.institute.getValue(), expectedMetadata.institute)
      assert.strictEqual(entity.iban.getValue(), expectedMetadata.iban)
      assert.strictEqual(entity.bic.getValue(), expectedMetadata.bic)
    })
  })
})
