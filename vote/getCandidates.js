const express = require('express');
const router = express.Router();
const { Candidate, Category, Voter } = require('../models');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to get all candidates, grouped by category
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetch all candidates along with their associated category
        const candidates = await Candidate.findAll({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'], // Include only necessary fields from Category
                },
            ],
            order: [['vote', 'DESC']], // Order candidates by votes in descending order
        });

        // Group candidates by category
        const groupedCandidates = candidates.reduce((result, candidate) => {
            const categoryId = candidate.category.id;
            const categoryName = candidate.category.name;

            // If category not yet added to result, add it
            if (!result[categoryId]) {
                result[categoryId] = {
                    categoryId: categoryId,
                    categoryName: categoryName,
                    candidates: [],
                };
            }

            // Add candidate to the appropriate category
            result[categoryId].candidates.push({
                id: candidate.id,
                name: candidate.name,
                vote: candidate.vote,
            });

            return result;
        }, {});

        // Convert grouped data into an array
        const responseData = Object.values(groupedCandidates);

        // Fetch all voter emails
        const voters = await Voter.findAll({
            attributes: ['email'], // Only select the email column
        });

        // Map to extract only emails into an array
        const voterEmails = voters.map(voter => voter.email);

        // Return success response with candidates and voter emails
        return res.status(200).json({
            success: true,
            message: 'Candidates and voters retrieved successfully',
            data: responseData,
            voters: voterEmails // Return only emails in an array
        });
    } catch (error) {
        console.error('Error retrieving candidates and voters:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
});

module.exports = router;
