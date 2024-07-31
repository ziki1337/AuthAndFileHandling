const path = require('path');
const fs = require('fs');
const { addFile, getFiles, deleteFile, getFileById, updateFile } = require('../models/file.model');
const upload = require('../config/multer.config'); 
const fileModel = require('../models/file.model'); 

const uploadFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Error during file upload:', err);
            return res.status(500).json({ message: 'File upload failed' });
        }

        const { file } = req;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileData = {
            name: file.originalname,
            extension: path.extname(file.originalname).slice(1),
            mimeType: file.mimetype,
            size: file.size
        };

        fileModel.addFile(fileData, (error, results) => {
            if (error) {
                console.error('Error saving file to database:', error);
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'File uploaded successfully', file: fileData });
        });
    });
};

// Получение списка файлов
const listFiles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const listSize = parseInt(req.query.list_size) || 10;

    try {
        const files = await getFiles(page, listSize);
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve files' });
    }
};

// Удаление файла
const deleteFileById = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await getFileById(id);
        if (!file) return res.status(404).json({ message: 'File not found' });

        fs.unlink(path.join('uploads', file.name), async (err) => {
            if (err) return res.status(500).json({ message: 'Failed to delete file from storage', err});

            await deleteFile(id);
            res.json({ message: 'File deleted successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete file' });
    }
};

// Получение информации о файле
const getFileInfo = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await getFileById(id);
        if (!file) return res.status(404).json({ message: 'File not found' });

        res.json(file);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve file information' });
    }
};

// Обновление файла
const updateFileById = (req, res) => {
    const { id } = req.params;

    upload.single('file')(req, res, async (err) => {
        if (err) return res.status(500).json({ message: 'File upload failed' });

        const { file } = req;
        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const fileInfo = {
            name: file.filename,
            extension: path.extname(file.originalname),
            mimeType: file.mimetype,
            size: file.size
        };

        try {
            const existingFile = await getFileById(id);
            if (!existingFile) return res.status(404).json({ message: 'File not found' });

            fs.unlink(path.join('uploads', existingFile.name), (unlinkErr) => {
                if (unlinkErr) return res.status(500).json({ message: 'Failed to delete old file' });

                updateFile(id, fileInfo).then(() => {
                    res.json({ message: 'File updated successfully' });
                }).catch((updateErr) => {
                    res.status(500).json({ message: 'Failed to update file in database' });
                });
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update file' });
        }
    });
};

// Загрузка файла
const downloadFile = (req, res) => {
    const { id } = req.params;

    getFileById(id).then((file) => {
        if (!file) return res.status(404).json({ message: 'File not found' });

        const filePath = path.join('uploads', file.name);
        res.download(filePath);
    }).catch((error) => {
        res.status(500).json({ message: 'Failed to retrieve file' });
    });
};

module.exports = {
    uploadFile,
    listFiles,
    deleteFileById,
    getFileInfo,
    updateFileById,
    downloadFile
};