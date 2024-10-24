const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); // Assuming Ticket is defined in your models
const authenticateToken = require("../authentication/authenticate"); // Assuming you are using authentication middleware

// Endpoint to fetch all tickets with status 'pending'
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Find all tickets where status is 'pending'
        const pendingTickets = await Ticket.findAll({
            where: {
                status: 'pending'
            }
        });

        // Check if there are any pending tickets
        if (pendingTickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No pending tickets found'
            });
        }

        // Return the pending tickets
        return res.status(200).json({
            success: true,
            message: 'Pending tickets retrieved successfully',
            data: pendingTickets
        });

    } catch (error) {
        console.error('Error fetching pending tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
