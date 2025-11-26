const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = require('../config/database');
        await db.query('SELECT 1');
        
        res.json({
            success: true,
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Conectado',
            message: 'API funcionando corretamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'ERROR',
            message: error.message
        });
    }
});

module.exports = router;
