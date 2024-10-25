// routes/user.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models'); 
const router = express.Router();
require('dotenv').config();

// Validation function for email and password
const validateUserInput = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);

    return isEmailValid && isPasswordValid;
};

// POST endpoint for user registration
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: name, email, or password.',
            statusCode: 400
        });
    }

    if (!validateUserInput(email, password)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email or password format.',
            statusCode: 400
        });
    }

    try {
        // Check if user already exists
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists.',
                statusCode: 409
            });
        }

        const saltKey = process.env.SALTING_KEY;
        if (!saltKey) {
            throw new Error('Missing required keys');
        }

        const saltedPass = password + saltKey;
        const hashedPassword = await bcrypt.hash(saltedPass, 10);

        // Create new user with type 'standard'
        const newUser = await db.User.create({
            name,
            email,
            password: hashedPassword,
            type: 'standard', 
        });

        // Generate a JWT token
        const token = jwt.sign(
            { email: newUser.email, name: newUser.name, type: newUser.type },
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } 
        );

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            statusCode: 201,
            token, 
        });
    } catch (error) {
        console.error('Error creating account:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating account.',
            statusCode: 500
        });
    }
});

module.exports = router;
