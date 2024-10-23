const express = require('express');
const db = require('../models');  
require('dotenv').config();

const router = express.Router();

// Utility function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Array of category names, where the index represents the category number
const categories = [
    "The_Vice_Chancellor's_Award",
    "The_President's_Commendation_Award",
    "The_Student_Leader_of_the_Year_Award",
    "The_Upcoming_Student_Leader_of_the_Year_Award",
    "The_Most_Influential_Student_of_the_Year_Award",
    "The_Student's_Affairs_Advocate_of_the_Year_Award",
    "The_Blogger_of_the_Year_Award",
    "The_Faculty_of_the_Year_Award",
    "The_Content_Creator_of_the_Year_Award",
    "The_Club_and_or_Society_of_the_Year_Award",
    "The_Humanitarian_of_the_Year_Award",
    "The_Most_Innovative_and_Creative_Student_of_the_Year_Award",
    "The_Entrepreneurial_Student_of_the_Year_Award",
    "The_Graphic_Designer_of_the_Year_Award",
    "The_Poet_and_Song_Writer_of_the_Year_Award",
    "The_Photographer_of_the_Year_Award",
    "The_Dance_Crew_of_the_Year_Award",
    "The_Service_Provider_of_the_Year_Award",
    "The_Environment_Advocate_of_the_Year_Award",
    "The_PWDs_Advocate_of_the_Year_Award",
    "The_Volunteer_of_the_Year_Award",
    "Indoor_Games_Sports_Team_of_the_Year_Award",
    "Outdoor_Games_Sports_Team_of_the_Year_Award",
    "Indoor_Games_Sports_Person_of_the_Year_Award",
    "Outdoor_Games_Sports_Person_of_the_Year_Award"
];


router.post('/', async (req, res) => {
    try {
        const { nominator, nominees } = req.body;

        console.log(nominator);
        Object.entries(nominees).forEach(([key, value]) => console.log(`${key}: ${value}`));

        // Validate required fields
        if (!nominator || !Array.isArray(nominees) || nominees.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: nominator and nominees",
                statusCode: 400
            });
        }

        // Validate if nominator is a valid email
        if (!validateEmail(nominator)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email for nominator.',
                statusCode: 400
            });
        }

        // Check if the nominator already voted
        const nominatorExists = await db.Nominator.findOne({
            where: { email: nominator }
        });

        if (nominatorExists) {
            return res.status(400).json({
                success: false,
                message: 'This user has already participated in nomination.',
                statusCode: 400
            });
        }

        // Create new nominator and get the ID
        const newNominator = await db.Nominator.create({ email: nominator });
        const nominatorId = newNominator.id;

        // Iterate over the nominees array
        for (let nomineeData of nominees) {
            const { name, category } = nomineeData;

            // Validate required fields inside nominee object
            if (!name || !category || typeof category !== 'number' || category < 1 || category > categories.length) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid nominee data: name and category must be provided, category must be a valid number.",
                    statusCode: 400
                });
            }

            const lowercasedName = name.toLowerCase();
            const categoryName = categories[category - 1]; 

            // Check if the nominee already exists in the Nominees table for the same category
            const existingNominee = await db.Nominees.findOne({
                where: {
                    name: lowercasedName,
                    category: categoryName
                }
            });

            if (existingNominee) {
                const existingVote = await db.Votes.findOne({
                    where: { nomineeId: existingNominee.id }
                });

                if (existingVote) {
                    existingVote.count += 1;
                    await existingVote.save();
                } else {
                    await db.Votes.create({
                        nomineeId: existingNominee.id,
                        count: 1
                    });
                }
            } else {
                const newNominee = await db.Nominees.create({
                    name: lowercasedName,
                    category: categoryName,
                    nominatorId: nominatorId
                });

                await db.Votes.create({
                    nomineeId: newNominee.id,
                    count: 1
                });
            }
        }

        return res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Nomination process completed successfully."
        });

    } catch (error) {
        console.error('Error processing nominations:', error);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error processing nominations.'
        });
    }
});


module.exports = router;


