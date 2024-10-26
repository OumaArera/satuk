const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const authenticateToken = require("../authentication/authenticate");

// Endpoint to get all categories
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Retrieve all categories from the database
        const categories = await Category.findAll();

        // Return success response with the categories data
        return res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });

    } catch (error) {
        console.error('Error retrieving categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
