const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const multer = require('multer');
const upload = require('./config/multer.config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение маршрутов
app.use('/api/auth', authRoutes); // Все маршруты для аутентификации будут начинаться с /api/auth
app.use('/api/file', fileRoutes); 

// Основной маршрут
app.get('/', (req, res) => {
    res.send('API is running!');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});