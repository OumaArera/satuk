// routes/user.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models'); 
const router = express.Router();

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
    if (!validateUserInput(email, password)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email or password format.',
        });
    }

    try {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists.',
            });
        }

        // Salt and hash the password
        const salt = await bcrypt.genSalt(parseInt(process.env.SALTING_KEY));
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user in the database
        const newUser = await db.User.create({
            name,
            email,
            password: hashedPassword,
            type: 'standard', 
        });

        // Generate access token
        const token = jwt.sign(
            { email: newUser.email, name: newUser.name, type: newUser.type },
            process.env.JWT_SECRET, // Make sure to define JWT_SECRET in your env variables
            { expiresIn: '1h' } // Token expiration time
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
        });
    }
});

module.exports = router;
