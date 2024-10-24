const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); 
const authenticateToken = require("../authentication/authenticate"); 

// Endpoint to update ticket status to "declined"
router.put('/:id', authenticateToken, async (req, res) => {
    const ticketId = req.params.id;

    try {
        // Check if the ticket exists
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        // Check if the ticket is already declined
        if (ticket.status === 'declined') {
            return res.status(400).json({
                success: false,
                message: 'Ticket is already declined',
            });
        }

        // Update the ticket status to "declined"
        ticket.status = 'declined';

        // Save the updated ticket
        await ticket.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Ticket status updated to declined successfully',
            data: {
                id: ticket.id,
                status: ticket.status,
                ticketNumber: ticket.ticketNumber
            }
        });

    } catch (error) {
        console.error('Error updating ticket status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
