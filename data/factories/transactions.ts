// @ts-ignore
import {generate_unique_id} from "../../utils/id_generator.ts";
// @ts-ignore
import {SQLite} from "../../utils/database_socket.ts";
// @ts-ignore
import {Transaction, TransactionSchemaType} from "../../src/TransactionGroup/Transaction/model.ts";
// @ts-ignore
import {TransactionGroup, TransactionGroupSchemaType} from "../../src/TransactionGroup/model.ts";
// @ts-ignore
import {AccountFactory} from "./accounts.ts";

export class TransactionFactory {
    private static transactions: { [transaction_id: string]: Transaction } = {};
    private static transaction_groups: { [transaction_group_id: string]: TransactionGroup } = {};
    private static transactions_table = "transactions"
    private static transaction_groups_table = "transaction_groups"

    static initialise_transactions() {
        return new Promise<void>((resolve, reject) => {
            let transaction_schema = {
                "id": [SQLite.modifiers.STRING, SQLite.modifiers.PRIMARY_KEY],
                "category": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "sender_account_id": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "recipient_account_id": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "amount": [SQLite.modifiers.REAL, SQLite.modifiers.NOT_NULL],
                "date": [SQLite.modifiers.REAL, SQLite.modifiers.NOT_NULL],
            }
            let create_query = SQLite.build_create_query(
                TransactionFactory.transactions_table, transaction_schema
            )
            let select_query = SQLite.build_select_query(
                TransactionFactory.transactions_table, {}, {}
            )
            SQLite.run(create_query).then(() => {
                SQLite.query_all(select_query).then((rows: object[]) => {
                    for (let row of rows) {
                        TransactionFactory.add_transaction(row as TransactionSchemaType)
                    }
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        });
    }

    static initialise_transaction_groups() {
        return new Promise<void>((resolve, reject) => {
            let transaction_group_schema = {
                "id": [SQLite.modifiers.STRING, SQLite.modifiers.PRIMARY_KEY],
                "description": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "transaction_ids": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "category": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "date": [SQLite.modifiers.REAL, SQLite.modifiers.NOT_NULL],
            }
            let create_query = SQLite.build_create_query(
                TransactionFactory.transaction_groups_table, transaction_group_schema
            )
            let select_query = SQLite.build_select_query(
                TransactionFactory.transaction_groups_table, {}, {}
            )
            SQLite.run(create_query).then(() => {
                SQLite.query_all(select_query).then((rows: object[]) => {
                    for (let row of rows) {
                        TransactionFactory.add_transaction_group(row as TransactionGroupSchemaType)
                    }
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })

        });
    }

    static transaction_group_is_empty(transaction_group_id: string): boolean {
        return TransactionFactory.transaction_groups[transaction_group_id].transaction_ids.length === 0
    }

    static get_transaction_from_id(transaction_id: string): Transaction {
        return TransactionFactory.transactions[transaction_id]
    }

    static get_transaction_group_from_id(transaction_group_id: string): TransactionGroup {
        return TransactionFactory.transaction_groups[transaction_group_id]
    }

    static get_all_transactions(): Array<TransactionSchemaType> {
        let transactions = []
        for (let transaction of Object.values(TransactionFactory.transactions)) {
            transactions.push(transaction.toObject())
        }
        return transactions
    }

    static get_all_transaction_groups(): Array<TransactionGroupSchemaType> {
        let transaction_groups = []
        for (let transaction of Object.values(TransactionFactory.transaction_groups)) {
            transaction_groups.push(transaction.toObject())
        }
        return transaction_groups
    }

    static create_transaction(
        category: string,
        sender_account_id: string,
        recipient_account_id: string,
        amount: number,
        date: number
    ) {
        return new Promise<string>((resolve, reject) => {
            let transaction_id = generate_unique_id('t')
            let transaction_schema: TransactionSchemaType = {
                "id": transaction_id,
                "category": category,
                "sender_account_id": sender_account_id,
                "recipient_account_id": recipient_account_id,
                "amount": amount,
                "date": date
            }
            let insert_query = SQLite.build_insert_query(
                TransactionFactory.transactions_table, transaction_schema
            )
            SQLite.run(insert_query).then(() => {
                TransactionFactory.add_transaction(transaction_schema)
                TransactionFactory.execute_transaction(transaction_id).then(() => {
                    resolve(transaction_id)
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static delete_transaction(transaction_id: string) {
        return new Promise<void>((resolve, reject) => {
            let delete_query = SQLite.build_delete_query(
                TransactionFactory.transactions_table,
                {
                    "id": transaction_id
                }
            )
            SQLite.run(delete_query).then(() => {
                TransactionFactory.cancel_transaction(transaction_id).then(() => {
                    TransactionFactory.remove_transaction(transaction_id)
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static create_transaction_group(
        description: string,
        category: string,
        date: number,
    ) {
        return new Promise<string>((resolve, reject) => {
            let transaction_group_id = generate_unique_id('tg')
            let transaction_group_schema: TransactionGroupSchemaType = {
                "id": transaction_group_id,
                "description": description,
                "transaction_ids": [],
                "category": category,
                "date": date
            }
            let insert_query = SQLite.build_insert_query(
                TransactionFactory.transaction_groups_table, transaction_group_schema
            )
            SQLite.run(insert_query).then(() => {
                TransactionFactory.add_transaction_group(transaction_group_schema)
                resolve(transaction_group_id)
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static delete_transaction_group(transaction_group_id: string) {
        return new Promise<void>((resolve, reject) => {
            if (TransactionFactory.transaction_group_is_empty(transaction_group_id)) {
                let delete_query = SQLite.build_delete_query(
                    TransactionFactory.transaction_groups_table,
                    {
                        "id": transaction_group_id
                    }
                )
                SQLite.run(delete_query).then(() => {
                    TransactionFactory.remove_transaction_group(transaction_group_id)
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            } else {
                reject("Transaction group is not empty. Please remove the transactions it contains before deleting the group")
            }
        })
    }

    static execute_transaction(transaction_id: string) {
        return new Promise<void>((resolve, reject) => {
            let transaction = TransactionFactory.get_transaction_from_id(transaction_id)
            AccountFactory.withdraw_from_account(transaction.sender_account_id, transaction.amount).then(() => {
                AccountFactory.deposit_to_account(transaction.recipient_account_id, transaction.amount).then(() => {
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static cancel_transaction(transaction_id: string) {
        return new Promise<void>((resolve, reject) => {
            let transaction = TransactionFactory.get_transaction_from_id(transaction_id)
            AccountFactory.withdraw_from_account(transaction.recipient_account_id, transaction.amount).then(() => {
                AccountFactory.deposit_to_account(transaction.sender_account_id, transaction.amount).then(() => {
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static add_transaction_to_group(transaction_id: string, transaction_group_id: string) {
        return new Promise<void>((resolve, reject) => {
            let transaction_group = TransactionFactory.get_transaction_group_from_id(transaction_group_id)
            transaction_group.transaction_ids.push(transaction_id)
            let update_query = SQLite.build_update_query(
                TransactionFactory.transaction_groups_table,
                {
                    "transaction_ids": transaction_group.transaction_ids
                },
                {
                    "id": transaction_group_id
                }
            )
            SQLite.run(update_query).then(() => {
                resolve()
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static remove_transaction_from_group(transaction_id: string, transaction_group_id: string) {
        return new Promise<void>((resolve, reject) => {
            let transaction_group = TransactionFactory.get_transaction_group_from_id(transaction_group_id)
            transaction_group.transaction_ids.splice(
                transaction_group.transaction_ids.indexOf(transaction_id), 1
            )
            let update_query = SQLite.build_update_query(
                TransactionFactory.transaction_groups_table,
                {
                    "transaction_ids": transaction_group.transaction_ids
                },
                {
                    "id": transaction_group_id
                }
            )
            SQLite.run(update_query).then(() => {
                resolve()
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static add_transaction(transaction_schema: TransactionSchemaType) {
        TransactionFactory.transactions[transaction_schema.id] = new Transaction(
            transaction_schema.id,
            transaction_schema.category,
            transaction_schema.sender_account_id,
            transaction_schema.recipient_account_id,
            transaction_schema.amount,
            transaction_schema.date
        )
    }

    static remove_transaction(transaction_id: string) {
        if (TransactionFactory.transactions.hasOwnProperty(transaction_id)) {
            delete TransactionFactory.transactions[transaction_id]
        }
    }

    static add_transaction_group(transaction_group_schema: TransactionGroupSchemaType) {
        TransactionFactory.transaction_groups[transaction_group_schema.id] = new TransactionGroup(
            transaction_group_schema.id,
            transaction_group_schema.description,
            transaction_group_schema.transaction_ids,
            transaction_group_schema.category,
            transaction_group_schema.date
        )
    }

    static remove_transaction_group(transaction_group_id: string) {
        if (TransactionFactory.transaction_groups.hasOwnProperty(transaction_group_id)) {
            delete TransactionFactory.transaction_groups[transaction_group_id]
        }
    }
}