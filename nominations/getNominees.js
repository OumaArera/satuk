const express = require('express');
const db = require('../models');  
require('dotenv').config();
const authenticateToken = require("../authentication/authenticate");

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetch nominees along with their votes and nominators
        const nominationsData = await db.Nominees.findAll({
            attributes: [
                'name',
                'category',
                [db.sequelize.fn('SUM', db.sequelize.col('votes.count')), 'totalVotes']
            ],
            include: [
                {
                    model: db.Votes,
                    as: 'votes',
                    attributes: [], // No need to select individual votes
                },
                {
                    model: db.Nominator,
                    attributes: ['email'], // Fetch nominator email
                },
            ],
            group: ['Nominees.id', 'Nominator.id'], // Group by nominee and nominator
            order: [['category', 'ASC'], [db.sequelize.fn('SUM', db.sequelize.col('votes.count')), 'DESC']], // Order by category and total votes
        });

        // Organize data by category
        const organizedData = nominationsData.reduce((acc, nomination) => {
            const category = nomination.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                nominatorEmail: nomination.Nominator.email,
                nomineeName: nomination.name,
                totalVotes: nomination.get('totalVotes'),
            });
            return acc;
        }, {});

        // Fetch all nominators (distinct emails)
        const nominatorsData = await db.Nominator.findAll({
            attributes: ['email'], // Fetch all nominator emails
            distinct: true, // Ensure only distinct emails
        });

        // Map nominators to a simpler array of emails
        const nominators = nominatorsData.map(nominator => nominator.email);

        // Return both organized data and nominators
        return res.status(200).json({
            success: true,
            statusCode: 200,
            nominators, // Add nominators to the response
            data: organizedData, // Organized nominations by category
        });

    } catch (error) {
        console.error('Error fetching nominations:', error);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error fetching nominations.',
        });
    }
});

module.exports = router;
