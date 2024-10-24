// routes/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models'); 
const router = express.Router();
require('dotenv').config();

// POST endpoint for user login
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: email or password.',
            statusCode: 400
        });
    }

    try {
        // Check if user exists by email
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid username or password.',
                statusCode: 404
            });
        }

        // Fetch the salt key from the environment variables
        const saltKey = process.env.SALTING_KEY;
        if (!saltKey) {
            throw new Error('Missing required keys');
        }

        // Append the salt to the provided password
        const saltedPassword = password + saltKey;

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(saltedPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
                statusCode: 401
            });
        }

        // Generate a JWT token if authentication is successful
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, type: user.type },
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } 
        );

        // Respond with the token
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            statusCode: 200,
            token, 
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during login.',
            statusCode: 500
        });
    }
});

module.exports = router;
