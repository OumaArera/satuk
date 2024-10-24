const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); // Assuming Ticket is defined in your models
const authenticateToken = require("../authentication/authenticate"); // Assuming you are using authentication middleware

// Endpoint to fetch all tickets associated with the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Get userId from the authenticated request (extracted from the token)
        const userId = req.user.id;

        // Fetch all tickets associated with this userId
        const userTickets = await Ticket.findAll({
            where: {
                userId
            }
        });

        // Check if the user has any tickets
        if (userTickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tickets found for this user'
            });
        }

        // Return the user's tickets
        return res.status(200).json({
            success: true,
            message: 'Tickets retrieved successfully',
            data: userTickets
        });

    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
