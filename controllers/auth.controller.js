const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
const { addToken, deactivateToken } = require('../models/token.models');


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

// Создание JWT токена
const createToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

// Создание refresh-токена
const createRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
};

// Проверка JWT токена
const verifyToken = (token, type = 'access') => {
    return new Promise(async (resolve, reject) => {
        const secret = type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;

        jwt.verify(token, secret, async (error, decoded) => {
            if (error) return reject({ status: 401, message: 'Invalid or expired token' });

            try {
                const tokenData = await getTokenByValue(token);
                if (!tokenData || !tokenData.isActive) {
                    return reject({ status: 401, message: 'Token is no longer active' });
                }

                resolve(decoded); 
            } catch (dbError) {
                reject({ status: 500, message: 'Database error during token verification' });
            }
        });
    });
};

// Регистрация пользователя
const signup = async (req, res) => {
    const { id, password } = req.body;

    try {
        const existingUser = await findUserById(id);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await createUser(id, passwordHash);

        const user = await findUserById(id);
        const token = createToken(user);
        const refreshToken = createRefreshToken(user);

        // Сохранение токенов в базе данных
        await addToken(user.id, token);
        await addToken(user.id, refreshToken);

        res.status(201).json({ 
            message: 'User created',
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Вход в систему и получение JWT
const signin = async (req, res) => {
    const { id, password } = req.body;

    try {
        const user = await findUserById(id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user);
        const refreshToken = createRefreshToken(user);

        await addToken(user.id, token);
        await addToken(user.id, refreshToken);

        res.json({ token, refreshToken });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Обновление JWT токена
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = await verifyToken(refreshToken);
        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newToken = createToken(user);
        res.json({ token: newToken });
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};
const getUserInfo = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        res.json({ id: decoded.id }); // Возвращаем ID пользователя
    });
};
const logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Получение токена из заголовков

    if (!token) return res.status(400).json({ message: 'Token is required' });

    try {
        // Удаление токена из базы данных
        await deactivateToken(token);

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getUserInfo,
    logout,
    signup,
    signin,
    refreshToken
};