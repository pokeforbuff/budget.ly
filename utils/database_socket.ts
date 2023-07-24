
import path from "path";
import pkg from 'sqlite3';
const { Database } = pkg;


type schema_type = { [column: string]: Array<string> }
type values_schema_type = { [column: string]: string | number | Array<any>}

export class SQLite {
    private static connection: any;
    static modifiers = {
        PRIMARY_KEY: "PRIMARY KEY",
        UNIQUE: "UNIQUE",
        NOT_NULL: "NOT NULL",
        SUM: "SUM",
        GROUP_BY: "GROUP BY",
        INTEGER: "INTEGER",
        STRING: "VARCHAR(255)",
        REAL: "REAL",
        BOOLEAN: "BOOLEAN"
    }

    static open() {
        return new Promise<void>((resolve, reject) => {
            if (!SQLite.connection) {
                let database_path = path.join('data', 'info.db')
                SQLite.connection = new Database(database_path, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                });
            } else {
                resolve()
            }
        })
    }

    static close() {
        return new Promise<void>((resolve, reject) => {
            if (SQLite.connection) {
                SQLite.connection.close((err?: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        SQLite.connection = null
                        resolve()
                    }
                });
            } else {
                resolve()
            }
        })
    }

    static run(query: string) {
        return new Promise<void>((resolve, reject) => {
            if (SQLite.connection) {
                SQLite.connection.run(query, (err?: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            } else {
                reject(new Error('Database connection is not open'))
            }
        })
    }

    static query_all(query: string) {
        return new Promise<Array<object>>((resolve, reject) => {
            if (SQLite.connection) {
                SQLite.connection.all(query, [], (err?: any, rows?: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                })
            } else {
                reject(new Error('Database connection is not open'))
            }
        })
    }

    static build_create_query(table_name: string, schema: schema_type): string {
        let query = ""
        if (Object.keys(schema).length > 0) {
            for (const [column, modifiers] of Object.entries(schema)) {
                query += column
                for (const modifier of modifiers) {
                    query += " " + modifier
                }
                query += ", "
            }
            query = query.substring(0, query.length - 2);
            query = "CREATE TABLE IF NOT EXISTS " + table_name + " (" + query + ")"
        }
        return query
    }

    static build_insert_query(table_name: string, values: values_schema_type): string {
        let query_columns = ""
        let query_values = ""
        let query = ""
        if (Object.keys(values).length > 0) {
            for (const [column, value] of Object.entries(values)) {
                query_columns += (column + ", ")
                if (typeof value === "number") {
                    query_values += (value.toString() + ", ")
                } else if (typeof value === "string") {
                    query_values += ("'" + value + "', ")
                } else {
                    query_values += ("'" + JSON.stringify(value) + "', ")
                }
            }
            query_columns = query_columns.substring(0, query_columns.length - 2);
            query_values = query_values.substring(0, query_values.length - 2);
            query = "INSERT INTO " + table_name + " (" + query_columns + ") VALUES (" + query_values + ")"
        }
        return query
    }

    static build_update_query(
        table_name: string,
        values: values_schema_type,
        conditions: values_schema_type
    ): string {
        let query_columns = ""
        let query_conditions = ""
        let query = ""
        if (Object.keys(values).length > 0) {
            for (const [column, value] of Object.entries(values)) {
                if (typeof value === "number") {
                    query_columns += (column + " = " + value.toString() + ", ")
                } else if (typeof value === "string") {
                    query_columns += (column + " = '" + value + "', ")
                } else {
                    query_columns += (column + " = '" + JSON.stringify(value) + "', ")
                }
            }
            query_columns = query_columns.substring(0, query_columns.length - 2);
            query += "UPDATE " + table_name + " SET " + query_columns
        }
        if (Object.keys(conditions).length > 0) {
            for (const [column, value] of Object.entries(conditions)) {
                if (typeof value === "number") {
                    query_conditions += (column + " = " + value.toString() + " AND ")
                } else if (typeof value === "string") {
                    query_conditions += (column + " = '" + value + "' AND ")
                } else {
                    query_conditions += (column + " = '" + JSON.stringify(value) + "' AND ")
                }
            }
            query_conditions = query_conditions.substring(0, query_conditions.length - 5);
            query += " WHERE " + query_conditions
        }
        return query
    }

    static build_delete_query(
        table_name: string,
        conditions: values_schema_type
    ): string {
        let query_conditions = ""
        let query = "DELETE FROM " + table_name
        if (Object.keys(conditions).length > 0) {
            for (const [column, value] of Object.entries(conditions)) {
                if (typeof value === "number") {
                    query_conditions += (column + " = " + value.toString() + " AND ")
                } else if (typeof value === "string") {
                    query_conditions += (column + " = '" + value + "' AND ")
                } else {
                    query_conditions += (column + " = '" + JSON.stringify(value) + "' AND ")
                }
            }
            query_conditions = query_conditions.substring(0, query_conditions.length - 5);
            query += " WHERE " + query_conditions
        }
        return query
    }

    static build_select_query(
        table_name: string,
        schema: schema_type,
        conditions: values_schema_type
    ): string {
        let query_columns = ""
        let query_conditions = ""
        let query_addon = ""
        let query = ""
        if (Object.keys(schema).length > 0) {
            for (const [column, modifiers] of Object.entries(schema)) {
                let substring = (column + ", ")
                if (modifiers) {
                    for (const modifier of modifiers) {
                        if (modifier == SQLite.modifiers.SUM) {
                            substring = (SQLite.modifiers.SUM + "(" + column + "), ")
                        }
                        if (modifier == SQLite.modifiers.GROUP_BY) {
                            query_addon += (" " + SQLite.modifiers.GROUP_BY + " " + column)
                        }
                    }
                }
                query_columns += substring
            }
            query_columns = query_columns.substring(0, query_columns.length - 2);
        } else {
            query_columns = "*"
        }
        query += "SELECT " + query_columns + " FROM " + table_name
        if (Object.keys(conditions).length > 0) {
            for (const [column, value] of Object.entries(conditions)) {
                if (typeof value === "number") {
                    query_conditions += (column + " = " + value.toString() + " AND ")
                } else if (typeof value === "string") {
                    query_conditions += (column + " = '" + value + "' AND ")
                } else {
                    query_conditions += (column + " = '" + JSON.stringify(value) + "' AND ")
                }
            }
            query_conditions = query_conditions.substring(0, query_conditions.length - 5);
            query += " WHERE " + query_conditions
        }
        query += query_addon
        return query
    }
}