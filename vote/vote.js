const express = require('express');
const router = express.Router();
const { Candidate, Voter } = require('../models');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../models'); 
const crypto = require('crypto');


const SECRET_KEY = process.env.SECRET_KEY;

// Decrypt function
function decryptData(encryptedData) {
    const iv = Buffer.from(encryptedData.iv, 'hex'); // Initialization vector
    const encryptedText = Buffer.from(encryptedData.content, 'hex'); // Encrypted data

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString()); // Parse JSON formatted decrypted data
}


// Endpoint to cast votes for candidates
router.post('/', [
    // Validate the fields assuming they will be decrypted into this format
    body('voterEmail').isEmail().withMessage('Invalid email format'),
    body('candidateIds').isArray({ min: 25, max: 25 }).withMessage('Voter must vote for exactly 25 candidates'),
    body('categoryIds').isArray({ min: 25, max: 25 }).withMessage('Voter must vote for all 25 categories'),
], async (req, res) => {
    let decryptedData;
    
    try {
        // Decrypt the incoming data
        decryptedData = decryptData(req.body); // Assuming encrypted data is sent in the `req.body`
    } catch (error) {
        console.error('Decryption error:', error);
        return res.status(400).json({ success: false, message: 'Invalid or malformed encrypted data.' });
    }

    // After decryption, extract fields from decryptedData
    const { voterEmail, candidateIds, categoryIds } = decryptedData;

    // Validate decrypted data
    const errors = validationResult({ body: decryptedData });
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Check if voter has already voted
        const existingVoter = await Voter.findOne({ where: { email: voterEmail } });
        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted.',
            });
        }

        // Process votes with a transaction
        await sequelize.transaction(async (transaction) => {
            for (let i = 0; i < candidateIds.length; i++) {
                const candidateId = candidateIds[i];
                const categoryId = categoryIds[i];

                const candidate = await Candidate.findOne({ 
                    where: { id: candidateId, categoryId }, 
                    transaction 
                });

                if (candidate) {
                    candidate.vote += 1;
                    await candidate.save({ transaction });
                } else {
                    throw new Error(`Candidate with ID ${candidateId} does not exist for category ${categoryId}.`);
                }
            }

            // Record voter as having voted
            await Voter.create({ email: voterEmail }, { transaction });
        });

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
