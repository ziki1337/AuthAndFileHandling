const db = require('../config/db.config');
const bcrypt = require('bcrypt');

// Создание пользователя
const createUser = (id, passwordHash) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO users (id, password) VALUES (?, ?)', [id, passwordHash], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Поиск пользователя по ID
const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

// Обновление пароля пользователя
const updatePassword = (id, newPasswordHash) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, id], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Удаление пользователя
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Валидация пароля пользователя
const validatePassword = async (id, password) => {
    const user = await findUserById(id);
    if (!user) return false;
    return bcrypt.compare(password, user.password);
};

module.exports = {
    createUser,
    findUserById,
    updatePassword,
    deleteUser,
    validatePassword
};