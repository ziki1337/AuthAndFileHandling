const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Создание подключения к базе данных
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Подключение к базе данных
connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    } else {
        console.log('Successfully connected to the database.');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                password VARCHAR(255) NOT NULL
            );
        `;
        const createTableTokens = `
            CREATE TABLE IF NOT EXISTS tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            );
        `;
        
        connection.query(createTableQuery, (error, results) => {
            if (error) {
                console.error('Error creating table:', error);
                process.exit(1);
            } else {
                console.log('Table "users" is ready.');
            }
        });
        connection.query(createTableTokens, (error, results) => {
            if (error) {
                console.error('Error creating table:', error);
                process.exit(1);
            } else {
                console.log('Table "tokens" is ready.');
            }
        });
    }
});

module.exports = connection;