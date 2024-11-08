const express = require('express');
const router = express.Router();
const { Candidate } = require('../models');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to increment a candidate's votes by 2000
router.put('/:candidateId', authenticateToken, async (req, res) => {
    const { candidateId } = req.params; // Extract candidateId from URL parameters

    try {
        // Find the candidate with the given candidateId
        const candidate = await Candidate.findByPk(candidateId);

        // Check if candidate exists
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found for the provided candidateId.',
            });
        }

        // Add 2000 to the candidate's current votes
        candidate.vote += 2000;
        await candidate.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Candidate votes updated successfully',
            data: { id: candidate.id, name: candidate.name, votes: candidate.vote }
        });

    } catch (error) {
        console.error('Error updating candidate votes:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
