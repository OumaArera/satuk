const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); 
const { Op } = require('sequelize');
const authenticateToken = require("../authentication/authenticate"); 

// Endpoint to update ticket status to "paid" and generate ticket number
router.put('/:id', authenticateToken, async (req, res) => {
    const ticketId = req.params.id;

    try {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        // Check if the status is already paid
        if (ticket.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Ticket is already paid',
            });
        }

        // Find the last ticket number in the format "SATUK-2024-XXXX"
        const lastTicket = await Ticket.findOne({
            where: {
                ticketNumber: { [Op.like]: 'SATUK-2024-%' }
            },
            order: [['ticketNumber', 'DESC']]
        });

        let nextTicketNumber = 'SATUK-2024-0001'; // Default first ticket number

        // If there is a last ticket number, increment the number
        if (lastTicket) {
            const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[2]);
            const newNumber = String(lastNumber + 1).padStart(4, '0');
            nextTicketNumber = `SATUK-2024-${newNumber}`;
        }

        // Update the ticket status to "paid" and assign the new ticket number
        ticket.status = 'paid';
        ticket.ticketNumber = nextTicketNumber;

        // Save the updated ticket
        await ticket.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Ticket paid and ticket number generated successfully',
            data: {
                id: ticket.id,
                status: ticket.status,
                ticketNumber: ticket.ticketNumber
            }
        });

    } catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
