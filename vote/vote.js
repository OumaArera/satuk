const express = require('express');
const router = express.Router();
const { Candidate, Voter } = require('../models');
const CryptoJS = require('crypto-js');
const { sequelize } = require('../models'); 
require('dotenv').config();

// Decrypt function
const decryptData = (iv, ciphertext) => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required encryption key');
    }
  
    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, ''); 
    return JSON.parse(decryptedData);
};

// Endpoint to cast votes for candidates
router.post('/', async (req, res) => {
    const { iv, ciphertext } = req.body;

    // Validate the presence of iv and ciphertext
    if (!iv || !ciphertext) {
        return res.status(400).json({
            success: false,
            message: 'Invalid data. Missing required fields',
            statusCode: 400,
        });
    }

    try {
        // Decrypt and parse the data
        const votersData = decryptData(iv, ciphertext);
        const { voterEmail, candidateIds, categoryIds } = votersData;

        // Validate the decrypted data
        const emailPattern = /^[a-zA-Z0-9._%+-]+@(?:gmail\.com|yahoo\.com|outlook\.com|protonmail\.com)$/;
        if (!emailPattern.test(voterEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        if (!Array.isArray(candidateIds) || candidateIds.length !== 25) {
            return res.status(400).json({ success: false, message: 'Voter must vote for exactly 25 candidates.' });
        }

        if (!Array.isArray(categoryIds) || categoryIds.length !== 25) {
            return res.status(400).json({ success: false, message: 'Voter must vote for all 25 categories.' });
        }

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
