import express from 'express';

const router = express.Router();
import {TransactionFactory} from "../data/factories/transactions.ts";
import {SQLite} from "../utils/database_socket.ts";

/* GET home page. */
router.post('/', function (req, res, next) {
    return new Promise((resolve, reject) => {
        SQLite.open().then(() => {
            if (!req.body.hasOwnProperty('transaction_group_id')) {
                TransactionFactory.create_transaction_group(
                    req.body.description,
                    req.body.category,
                    req.body.date
                ).then((transaction_group_id) => {
                    TransactionFactory.create_transaction(
                        req.body.category,
                        req.body.sender_account_id,
                        req.body.recipient_account_id,
                        req.body.amount,
                        req.body.date
                    ).then((transaction_id) => {
                        TransactionFactory.add_transaction_to_group(
                            transaction_id, transaction_group_id
                        ).then(() => {
                            SQLite.close().then(() => {
                                res.status(200).json({name: transaction_id})
                                resolve();
                            }).catch((err) => {
                                res.status(500).json({error: err.message})
                                resolve();
                            })
                        }).catch((err) => {
                            res.status(500).json({error: err.message})
                            resolve();
                        })
                    }).catch((err) => {
                        res.status(500).json({error: err.message})
                        resolve();
                    })
                }).catch((err) => {
                    res.status(500).json({error: err.message})
                    resolve();
                })
            } else {
                TransactionFactory.create_transaction(
                    req.body.category,
                    req.body.sender_account_id,
                    req.body.recipient_account_id,
                    req.body.amount,
                    req.body.date
                ).then((transaction_id) => {
                    TransactionFactory.add_transaction_to_group(
                        transaction_id, req.body.transaction_group_id
                    ).then(() => {
                        SQLite.close().then(() => {
                            res.status(200).json({name: transaction_id})
                            resolve();
                        }).catch((err) => {
                            res.status(500).json({error: err.message})
                            resolve();
                        })
                    }).catch((err) => {
                        res.status(500).json({error: err.message})
                        resolve();
                    })
                }).catch((err) => {
                    res.status(500).json({error: err.message})
                    resolve();
                })
            }
        }).catch((err) => {
            res.status(500).json({error: err.message})
            resolve();
        })
    })
});

export default router;
