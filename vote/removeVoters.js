const express = require('express');
const router = express.Router();
const { Voter } = require('../models');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to delete all voters
router.delete('/', authenticateToken, async (req, res) => {
    try {
        // Delete all records in the Voter model
        await Voter.destroy({
            where: {}, // No conditions to target all records
            truncate: true // Optionally truncate the table for reset
        });

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'All voters have been deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting voters:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
});

module.exports = router;
