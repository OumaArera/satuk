const express = require('express');
const router = express.Router();
const { Candidate, Voter } = require('../models');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../models'); 


// Endpoint to cast votes for candidates
router.post('/', [
    // Validate input fields
    body('voterEmail').isEmail().withMessage('Invalid email format'),
    body('candidateIds').isArray({ min: 25, max: 25 }).withMessage('Voter must vote for exactly 25 candidates'),
    body('categoryIds').isArray({ min: 25, max: 25 }).withMessage('Voter must vote for all 25 categories'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Destructure the request body
    const { voterEmail, candidateIds, categoryIds } = req.body;

    try {
        // Check if the voter has already voted
        const existingVoter = await Voter.findOne({ where: { email: voterEmail } });
        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted.',
            });
        }

        // Start a transaction
        await sequelize.transaction(async (transaction) => {
            // Iterate through candidateIds and categoryIds
            for (let i = 0; i < candidateIds.length; i++) {
                const candidateId = candidateIds[i];
                const categoryId = categoryIds[i];

                // Find the candidate within the specified category
                const candidate = await Candidate.findOne({ 
                    where: { id: candidateId, categoryId }, 
                    transaction 
                });

                if (candidate) {
                    // Increment the vote count for the candidate
                    candidate.vote += 1;
                    await candidate.save({ transaction });
                } else {
                    throw new Error(`Candidate with ID ${candidateId} does not exist for category ${categoryId}.`);
                }
            }

            // Add voter to the Voter model
            await Voter.create({ email: voterEmail }, { transaction });
        });

        // Return success response if transaction completes
        return res.status(200).json({
            success: true,
            message: 'Votes cast successfully.',
        });

    } catch (error) {
        console.error('Error casting votes:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
});

module.exports = router;
