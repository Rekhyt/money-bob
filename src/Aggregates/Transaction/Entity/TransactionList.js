const { RootEntity, ValidationError } = require('ddd-js')

const Transaction = require('./Transaction')

const AccountName = require('../ValueObject/AccountName')
const Notes = require('../ValueObject/Notes')
const Amount = require('../../../ValueObject/Amount')
const Currency = require('../../../ValueObject/Currency')
const Money = require('../../../ValueObject/Money')
const Subject = require('../ValueObject/Subject')
const TransactionTime = require('../ValueObject/TransactionTime')
const Tag = require('../../../ValueObject/Tag')

class TransactionList extends RootEntity {
  setup () {
    this._transactions = []

    this.registerCommand('Transaction.bookTransaction', command => this.bookTransaction(
      command.payload.account1,
      command.payload.account2,
      command.payload.amount,
      command.payload.currency,
      command.payload.subject,
      command.payload.notes,
      command.payload.transactionTime,
      command.payload.tags
    ))

    this.registerEvent('Transaction.transactionBooked', async event => this.transactionBooked(
      event.payload.account1,
      event.payload.account2,
      event.payload.amount,
      event.payload.currency,
      event.payload.subject,
      event.payload.notes,
      event.payload.transactionTime,
      event.payload.tags
    ))
  }

  /**
   * @param {string} rawAccount1
   * @param {string} rawAccount2
   * @param {number} rawAmount
   * @param {string} rawCurrency
   * @param {string} rawSubject
   * @param {string} rawNotes
   * @param {string} rawTransactionTime
   * @param {string[]} rawTags
   */
  bookTransaction (rawAccount1, rawAccount2, rawAmount, rawCurrency, rawSubject, rawNotes, rawTransactionTime, rawTags = []) {
    const validationError = new ValidationError()

    let account1
    try {
      account1 = new AccountName(rawAccount1)
    } catch (err) {
      validationError.addInvalidField('account1', err.message)
    }

    let account2
    try {
      account2 = new AccountName(rawAccount2)
    } catch (err) {
      validationError.addInvalidField('account2', err.message)
    }

    let amount
    try {
      amount = new Amount(rawAmount)
    } catch (err) {
      validationError.addInvalidField('amount', err.message)
    }

    let currency
    try {
      currency = new Currency(rawCurrency)
    } catch (err) {
      validationError.addInvalidField('currency', err.message)
    }

    let money
    if (amount && currency) {
      money = new Money(amount, currency)
    }

    let subject
    try {
      subject = new Subject(rawSubject)
    } catch (err) {
      validationError.addInvalidField('subject', err.message)
    }

    let notes
    try {
      notes = new Notes(rawNotes)
    } catch (err) {
      validationError.addInvalidField('notes', err.message)
    }

    let transactionTime
    try {
      transactionTime = new TransactionTime(rawTransactionTime)
    } catch (err) {
      validationError.addInvalidField('transactionTime', err.message)
    }

    const tags = rawTags.map((t, i) => {
      try {
        return new Tag(t)
      } catch (err) {
        validationError.addInvalidField(`tags[${i}]`, err.message)
        return null
      }
    }).filter(t => t)

    if (validationError.hasErrors()) throw validationError

    let transaction
    try {
      transaction = new Transaction(account1, account2, money, subject, notes, transactionTime, tags)
    } catch (err) {
      throw new Error('Unknown error creating transaction.')
    }

    return [this.createEvent('Transaction.transactionBooked', {
      account1: transaction.account1.getValue(),
      account2: transaction.account2.getValue(),
      amount: transaction.amount.getAmount().getValue(),
      currency: transaction.amount.getCurrency().getValue(),
      subject: transaction.subject.getValue(),
      notes: transaction.notes.getValue(),
      transactionTime: transaction.transactionTime.getValue(),
      tags: transaction.tags.map(t => t.getValue())
    })]
  }

  /**
   * @param {string} rawAccount1
   * @param {string} rawAccount2
   * @param {number} rawAmount
   * @param {string} rawCurrency
   * @param {string} rawSubject
   * @param {string} rawNotes
   * @param {string} rawTransactionTime
   * @param {string[]} rawTags
   */
  async transactionBooked (rawAccount1, rawAccount2, rawAmount, rawCurrency, rawSubject, rawNotes, rawTransactionTime, rawTags = []) {
    this._transactions.push(new Transaction(
      new AccountName(rawAccount1),
      new AccountName(rawAccount2),
      new Money(new Amount(rawAmount), new Currency(rawCurrency)),
      new Subject(rawSubject),
      new Notes(rawNotes),
      new TransactionTime(rawTransactionTime),
      rawTags.map(t => new Tag(t))
    ))
  }
}

module.exports = TransactionList
