import {AccountFactory} from "../data/factories/accounts.ts";

import express from 'express';

const router = express.Router();
import {TransactionFactory} from "../data/factories/transactions.ts";

/* GET home page. */
router.get('/', function (req, res, next) {
    let accounts = AccountFactory.get_all_accounts()
    let merchants = AccountFactory.get_all_merchants()
    let transactions = TransactionFactory.get_all_transactions()
    let transaction_groups = TransactionFactory.get_all_transaction_groups()
    res.status(200).json({
        accounts: accounts,
        merchants: merchants,
        transactions: transactions,
        transaction_groups: transaction_groups
    })
});

export default router;
