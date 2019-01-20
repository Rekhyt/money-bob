declare class AccountMetadata {
    bankaccount: AccountMetadataBankAccount
    creditcard: AccountMetadataCreditCard
    paypal: AccountMetadataPaypal
    debit: AccountMetadataDebit
    liability: AccountMetadataLiability
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
