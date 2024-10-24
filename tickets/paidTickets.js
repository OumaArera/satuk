const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); // Assuming Ticket is defined in your models
const authenticateToken = require("../authentication/authenticate"); // Assuming you are using authentication middleware

// Endpoint to fetch all tickets with status 'paid'
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Find all tickets where status is 'paid'
        const paidTickets = await Ticket.findAll({
            where: {
                status: 'paid'
            }
        });

        // Check if there are any paid tickets
        if (paidTickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No paid tickets found'
            });
        }

        // Return the paid tickets
        return res.status(200).json({
            success: true,
            message: 'Paid tickets retrieved successfully',
            data: paidTickets
        });

    } catch (error) {
        console.error('Error fetching paid tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
