const express = require('express');
const router = express.Router();
const { Voter } = require('../models');

// Utility function to generate random emails
const generateRandomEmail = (names) => {
    const randomName1 = names[Math.floor(Math.random() * names.length)];
    const randomName2 = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const emailDomain = Math.random() > 0.5 ? '@gmail.com' : '@hotmail.com';
    return `${randomName1}${randomName2}${randomNumber ? randomNumber : ''}${emailDomain}`;
};

// Endpoint to generate and add 2000 random unique emails to the database
router.post('/', async (req, res) => {
    const { names } = req.body;

    if (!Array.isArray(names) || names.length < 2) {
        return res.status(400).json({ success: false, message: 'Provide an array of at least two names' });
    }

    const emails = new Set();

    try {
        // Fetch all existing emails to avoid duplicates
        const existingEmails = await Voter.findAll({ attributes: ['email'] });
        const existingEmailSet = new Set(existingEmails.map((record) => record.email));

        // Generate a minimum of 2000 unique emails, accounting for duplicates in the database
        while (emails.size < 2000) {
            const email = generateRandomEmail(names);
            if (!existingEmailSet.has(email) && !emails.has(email)) {
                emails.add(email);  // Add to new emails set if it's unique
            }
        }

        // Prepare records for insertion
        const emailRecords = Array.from(emails).map(email => ({ email }));
        
        // Insert generated emails into the database
        await Voter.bulkCreate(emailRecords, { fields: ['email'], ignoreDuplicates: true });

        return res.status(200).json({
            success: true,
            message: '2000+ unique emails generated and stored in the database.',
            emailCount: emailRecords.length
        });
    } catch (error) {
        console.error('Error generating and storing emails:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
