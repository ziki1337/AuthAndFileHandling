const db = require('../config/db.config');

// Добавление токена в базу данных
const addToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO tokens (userId, token) VALUES (?, ?)', [userId, token], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Получение токена по значению
const getTokenByValue = (token) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM tokens WHERE token = ?', [token], (error, results) => {
            if (error) return reject(error);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

// Пометка токена как неактивного
const deactivateToken = (token) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE tokens SET isActive = FALSE WHERE token = ?', [token], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

module.exports = {
    addToken,
    getTokenByValue,
    deactivateToken
};