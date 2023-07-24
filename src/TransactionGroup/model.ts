type TransactionSummary = { [key: number]: number }

export type TransactionGroupSchemaType = {
    id: string,
    description: string,
    transaction_ids: Array<string> | string,
    category: string,
    date: number
}

export class TransactionGroup {
    id: string;
    description: string;
    category: string;
    transaction_ids: Array<string>;
    summary: TransactionSummary;
    date: number;

    constructor(
        id: string,
        description: string,
        transaction_ids: Array<string> | string,
        category: string,
        date: number
    ) {
        this.id = id;
        if (Array.isArray(transaction_ids)) {
            this.transaction_ids = transaction_ids
        } else {
            this.transaction_ids = JSON.parse(transaction_ids)
        }
        this.description = description;
        this.category = category;
        this.date = date
        this.summary = {};
    }

    toObject(): TransactionGroupSchemaType {
        return {
            id: this.id,
            description: this.description,
            transaction_ids: this.transaction_ids,
            category: this.category,
            date: this.date
        }
    }
}
