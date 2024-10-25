const express = require('express');
const db = require('../models');  
const router = express.Router();
const authenticateToken = require("../authentication/authenticate");

// Route to delete all data in the Ticket table
router.delete('/', authenticateToken, async (req, res) => {
    try {
        // Truncate the Ticket table
        await db.sequelize.query('TRUNCATE "Tickets" CASCADE');

        return res.status(200).json({
            success: true,
            message: 'All data from the Ticket table has been deleted.',
        });
    } catch (error) {
        console.error('Error deleting data from Ticket table:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting data from the Ticket table.',
        });
    }
});

module.exports = router;
