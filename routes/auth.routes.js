const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Регистрация нового пользователя
router.post('/signup', authController.signup);

// Вход в систему и получение JWT
router.post('/signin', authController.signin);

// Обновление JWT токена по refresh-токену
router.post('/signin/new_token', authController.refreshToken);

// Получение информации о пользователе
router.get('/info', authController.getUserInfo);

// Выход из системы
router.get('/logout', authController.logout);

module.exports = router;