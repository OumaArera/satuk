const express = require('express');
const router = express.Router();
const { Candidate } = require('../models');
const { body, validationResult } = require('express-validator');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to update a candidate's name
router.put('/:candidateId', authenticateToken, [
    // Validate that 'name' is a string
    body('name').isString().withMessage('Candidate name must be a valid string'),
    // Validate categoryId is a number between 1 and 25
    body('categoryId').isInt({ min: 1, max: 25 }).withMessage('categoryId must be a number between 1 and 25'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Destructure request parameters and body
    const { candidateId } = req.params; // Extract candidateId from URL parameters
    const { name, categoryId } = req.body;

    try {
        // Find the candidate with the given candidateId and categoryId
        const candidate = await Candidate.findOne({ where: { id: candidateId, categoryId } });

        // Check if candidate exists
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found for the provided candidateId and categoryId.',
            });
        }

        // Update the candidate's name
        candidate.name = name;
        candidate.vote =0;
        await candidate.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Candidate name updated successfully',
            data: candidate
        });

    } catch (error) {
        console.error('Error updating candidate:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
