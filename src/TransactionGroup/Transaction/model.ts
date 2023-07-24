// @ts-ignore
import {AccountType} from "../../Account/model.ts";
// @ts-ignore
import {AccountFactory} from "../../../data/factories/accounts.ts";

type TransactionSummary = { [account_id: string]: number }

export type TransactionSchemaType = {
    id: string,
    category: string,
    sender_account_id: string,
    recipient_account_id: string,
    amount: number,
    date: number
}

export class Transaction {
    id: string;
    category: string;
    summary: TransactionSummary;
    sender_account_id: string;
    recipient_account_id: string;
    amount: number;
    date: number;

    constructor(
        id: string,
        category: string,
        sender_account_id: string,
        recipient_account_id: string,
        amount: number,
        date: number
    ) {
        this.id = id;
        this.sender_account_id = sender_account_id;
        this.recipient_account_id = recipient_account_id
        this.amount = amount;
        // TODO: Add commented part below to front-end
        // if(typeof category === 'undefined') {
        //     let sender_account_category = AccountFactory.get_account_category_from_id(sender_account_id)
        //     let recipient_account_category = AccountFactory.get_account_category_from_id(recipient_account_id)
        //     switch (recipient_account_category) {
        //         case AccountCategory.MERCHANT:
        //             this.category = AccountFactory.get_merchant_goods_category_from_id(recipient_account_id)
        //             break
        //         case AccountCategory.CREDIT:
        //             this.category = "Credit Card Payment"
        //             break
        //         case AccountCategory.LOAN:
        //             this.category = "Loan Installment"
        //             break
        //         case AccountCategory.BROKERAGE:
        //             this.category = "Investment"
        //             break
        //         case AccountCategory.RETIREMENT:
        //             this.category = "Investment"
        //             break
        //         case AccountCategory.SAVINGS:
        //             switch (sender_account_category) {
        //                 case AccountCategory.MERCHANT:
        //                     this.category = "Direct Deposit"
        //                     break
        //                 default:
        //                     this.category = "Transfer"
        //             }
        //             break
        //         case AccountCategory.CHECKING:
        //             switch (sender_account_category) {
        //                 case AccountCategory.MERCHANT:
        //                     this.category = "Direct Deposit"
        //                     break
        //                 default:
        //                     this.category = "Transfer"
        //             }
        //             break
        //         default:
        //             this.category = "Transfer"
        //     }
        // } else {
        //     this.category = category
        // }
        this.category = category
        this.date = date;
        this.summary = {
            [this.sender_account_id]:
                AccountFactory.get_account_type_from_id(this.sender_account_id) === AccountType.ASSET ?
                    -this.amount : this.amount,
            [this.recipient_account_id]:
                AccountFactory.get_account_type_from_id(this.recipient_account_id) === AccountType.ASSET ?
                    this.amount : -this.amount
        }
    }

    toObject(): TransactionSchemaType {
        return {
            id: this.id,
            category: this.category,
            sender_account_id: this.sender_account_id,
            recipient_account_id: this.recipient_account_id,
            amount: this.amount,
            date: this.date
        }
    }
}
