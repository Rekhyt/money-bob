declare class AccountMetadata {
    BankAccount: AccountMetadataBankAccount
    CreditCard: AccountMetadataCreditCard
    Paypal: AccountMetadataPaypal
    Debit: AccountMetadataDebit
    Liability: AccountMetadataLiability
}

declare class AccountMetadataBankAccount {
    institute: string
    iban: string
    bic: string
}

declare class AccountMetadataCreditCard {
    institute: string
    type: string
    holder: string
    number: string
}

declare class AccountMetadataPaypal {
    emailAddress: string
}

declare class AccountMetadataDebit {
    debitorName: string
}

declare class AccountMetadataLiability {
    debitorName: string
}
