const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { body, validationResult } = require('express-validator');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to create a new category
router.post('/', authenticateToken, [
    // Validate that 'name' is a string
    body('name').isString().withMessage('Category name must be a valid string'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Destructure the request body to get the category name
    const { name } = req.body;

    try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists.',
            });
        }

        // Create a new category in the database
        const category = await Category.create({ name });

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });

    } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
