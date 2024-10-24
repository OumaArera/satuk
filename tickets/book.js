const express = require('express');
const router = express.Router();
const { Ticket } = require('../models'); 
const { body, validationResult } = require('express-validator');
const authenticateToken = require("../authentication/authenticate");

// Validation for Kenyan phone numbers
const isValidKenyanPhone = (phone) => {
    const regex = /^(07\d{8}|01\d{8}|2547\d{8}|2541\d{8})$/;
    return regex.test(phone);
};

// Endpoint to create a ticket
router.post('/', authenticateToken, [
    // Validate input fields
    body('name').isString().withMessage('Name must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('phone').custom((phone) => {
        if (!isValidKenyanPhone(phone)) {
            throw new Error('Invalid phone number format');
        }
        return true;
    }),
    body('type').isString().custom((value) => {
        if (!['VIP', 'STANDARD'].includes(value.toUpperCase())) {
            throw new Error('Type must be either VIP or STANDARD');
        }
        return true;
    }),
    body('transactionCode').isString().isLength({ min: 10, max: 10 }).withMessage('Invalid Mpesa Transaction Code')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // If validation passed, destructure the request body
    const { name, email, phone, type, transactionCode } = req.body;

    try {
        // Check if the transaction code is unique
        const existingTicket = await Ticket.findOne({ where: { transactionCode } });
        if (existingTicket) {
            return res.status(400).json({
                success: false,
                message: 'Transaction code has already been used.',
            });
        }

        // Extract userId from the authenticated request (from the token)
        const userId = req.user.id; 

        // Create a new ticket in the database
        const ticket = await Ticket.create({
            userId,  // Associate ticket with user
            name,
            email,
            phone,
            type: type.toUpperCase(), 
            transactionCode,
            status: 'pending', 
            ticketNumber: 'XXXX' 
        });

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
