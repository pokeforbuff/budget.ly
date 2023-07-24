import express from 'express';

const router = express.Router();
import {TransactionFactory} from "../data/factories/transactions.ts";
import {SQLite} from "../utils/database_socket.ts";

/* GET home page. */
router.post('/', function (req, res, next) {
    return new Promise((resolve, reject) => {
        SQLite.open().then(() => {
            TransactionFactory.remove_transaction_from_group(
                req.body.transaction_id, req.body.transaction_group_id
            ).then(() => {
                TransactionFactory.delete_transaction(
                    req.body.transaction_id
                ).then(() => {
                    if (TransactionFactory.transaction_group_is_empty(req.body.transaction_group_id)) {
                        TransactionFactory.delete_transaction_group(req.body.transaction_group_id).then(() => {
                            SQLite.close().then(() => {
                                res.status(200).json({message: "SUCCESS"})
                                resolve();
                            }).catch((err) => {
                                res.status(500).json({error: err.message})
                                resolve();
                            })
                        }).catch((err) => {
                            res.status(500).json({error: err.message})
                            resolve();
                        })
                    } else {
                        SQLite.close().then(() => {
                            res.status(200).json({message: "SUCCESS"})
                            resolve();
                        }).catch((err) => {
                            res.status(500).json({error: err.message})
                            resolve();
                        })
                    }
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
    })
});

export default router;
