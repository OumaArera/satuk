const express = require('express');
const db = require('../models');  
const router = express.Router();

// Route to delete all data in Nominator, Nominees, and Votes tables
router.delete('/', async (req, res) => {
    try {
        // Truncate Votes, Nominees, and Nominator tables using CASCADE
        await db.sequelize.query('TRUNCATE "Votes", "Nominees", "Nominators" CASCADE');

        return res.status(200).json({
            success: true,
            message: 'All data from Nominator, Nominees, and Votes tables have been deleted.',
        });
    } catch (error) {
        console.error('Error deleting data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting data from the tables.',
        });
    }
});

module.exports = router;
