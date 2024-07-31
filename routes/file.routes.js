const express = require('express');
const router = express.Router();
const {
    uploadFile,
    listFiles,
    deleteFileById,
    getFileInfo,
    updateFileById,
    downloadFile
} = require('../controllers/file.controller');

// Маршрут для загрузки файла
router.post('/upload', uploadFile);

// Маршрут для получения списка файлов
router.get('/list', listFiles);

// Маршрут для удаления файла
router.delete('/delete/:id', deleteFileById);

// Маршрут для получения информации о файле
router.get('/:id', getFileInfo);

// Маршрут для скачивания файла
router.get('/download/:id', downloadFile);

// Маршрут для обновления файла
router.put('/update/:id', updateFileById);

module.exports = router;