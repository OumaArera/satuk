const express = require('express');
const router = express.Router();
const { Candidate, Voter } = require('../models');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../models'); 
const CryptoJS = require('crypto-js');
require('dotenv').config();

// Decryption function
const decryptData = (iv, ciphertext) => {
  const key = process.env.SECRET_KEY;
  if (!key) {
    throw new Error('Missing required encryption key');
  }

  const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  decryptedData = decryptedData.replace(/\0+$/, ''); // Remove padding
  return JSON.parse(decryptedData);
};

// Endpoint to cast votes for candidates
router.post('/', [
    // Validate that encrypted data is present
    body('iv').notEmpty().withMessage('Missing initialization vector'),
    body('ciphertext').notEmpty().withMessage('Missing ciphertext'),
], async (req, res) => {
    // Check for encryption-related validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Destructure iv and ciphertext from request body
    const { iv, ciphertext } = req.body;

    let decryptedData;
    try {
        // Decrypt data using the decryptData function
        decryptedData = decryptData(iv, ciphertext);
    } catch (error) {
        console.error('Decryption error:', error);
        return res.status(400).json({ success: false, message: 'Invalid or malformed encrypted data.' });
    }

    // Extract decrypted data fields
    const { voterEmail, candidateIds, categoryIds } = decryptedData;

    // Validate the decrypted data
    const validationErrors = validationResult({ body: decryptedData });
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ success: false, errors: validationErrors.array() });
    }

    try {
        // Check if the voter has already voted
        const existingVoter = await Voter.findOne({ where: { email: voterEmail } });
        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted.',
            });
        }

        // Start a transaction for vote processing
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

            // Record the voter's email in the Voter model to prevent double voting
            await Voter.create({ email: voterEmail }, { transaction });
        });

        // Return a success response if transaction completes
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
