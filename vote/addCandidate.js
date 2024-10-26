const express = require('express');
const router = express.Router();
const { Candidate } = require('../models');
const { body, validationResult } = require('express-validator');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to create multiple candidates for each category
router.post('/', authenticateToken, [
    // Validate input is an array of strings
    body('names').isArray({ min: 3, max: 3 }).withMessage('Must provide an array with exactly three candidate names'),
    body('names.*').isString().withMessage('Each candidate name must be a valid string')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Destructure the array of names from the request body
    const { names } = req.body;

    try {
        // Initialize an array to hold successful entries
        const addedCandidates = [];

        // Loop through categories 1 to 25
        for (let categoryId = 1; categoryId <= 25; categoryId++) {
            for (const name of names) {
                // Check if candidate with the same name and categoryId already exists
                const existingCandidate = await Candidate.findOne({ where: { name, categoryId } });
                if (!existingCandidate) {
                    // Create a new candidate if it doesn't exist for the category
                    const candidate = await Candidate.create({
                        name,
                        categoryId,
                        vote: 0 // Initialize votes to 0
                    });
                    addedCandidates.push(candidate);
                }
            }
        }

        // Return success response with the list of added candidates
        return res.status(201).json({
            success: true,
            message: 'Candidates added successfully for each category',
            data: addedCandidates
        });

    } catch (error) {
        console.error('Error creating candidates:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
