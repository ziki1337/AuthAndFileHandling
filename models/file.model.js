const db = require('../config/db.config');

// Создание таблицы
const createTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            extension VARCHAR(10) NOT NULL,
            mimeType VARCHAR(255) NOT NULL,
            size BIGINT NOT NULL,
            uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.query(createTableQuery, (error, results) => {
        if (error) throw error;
        console.log('Table "files" is ready.');
    });
};

// Добавление файла
const addFile = (file) => {
    const { name, extension, mimeType, size } = file;
    const query = 'INSERT INTO files (name, extension, mimeType, size) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(query, [name, extension, mimeType, size], (error, results) => {
            if (error) return reject(error);
            resolve(results.insertId);
        });
    });
};

// Список файлов
const getFiles = (page = 1, listSize = 10) => {
    const offset = (page - 1) * listSize;
    const query = 'SELECT * FROM files LIMIT ? OFFSET ?';
    return new Promise((resolve, reject) => {
        db.query(query, [parseInt(listSize), parseInt(offset)], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Удаление файла
const deleteFile = (id) => {
    const query = 'DELETE FROM files WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [id], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Получем информацию о файле
const getFileById = (id) => {
    const query = 'SELECT * FROM files WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [id], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

// Обновление файла
const updateFile = (id, file) => {
    const { name, extension, mimeType, size } = file;
    const query = 'UPDATE files SET name = ?, extension = ?, mimeType = ?, size = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [name, extension, mimeType, size, id], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

createTable();

module.exports = {
    addFile,
    getFiles,
    deleteFile,
    getFileById,
    updateFile
};