const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kegs.db')
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error('Database connection failed', err) }
    else { console.log('Database connection successful') }
})

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS "PRODUCTS" (
            "id"	INTEGER,
            "name"	TEXT NOT NULL,
            "description"	TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        );
        CREATE TABLE IF NOT EXISTS "APPLICATIONS" (
            "id"	INTEGER NOT NULL,
            "name"	TEXT NOT NULL,
            "description"	TEXT,
            "price"	NUMERIC NOT NULL,
            "process_date"	INTEGER NOT NULL,
            "approved"	INTEGER NOT NULL,
            "creation_date"	INTEGER NOT NULL,
            "applicant"	INTEGER NOT NULL,
            "processing_user"	INTEGER,
            PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "USERS" (
	        "id"	NUMERIC NOT NULL,
	        "name"	INTEGER,
	        "avatar"    TEXT,
	        "nonce" TEXT UNIQUE,
	        PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "APPLICATIONITEMS" (
            "id"    NUMERIC NOT NULL AUTOINCREMENT,
            "productID" INTEGER NOT NULL,
            "quantity" INTEGER NOT NULL,
            FOREIGN KEY("productId") REFERENCES PRODUCTS("id")
            PRIMARY KEY("id")
        );
        `
    )
})

module.exports = db