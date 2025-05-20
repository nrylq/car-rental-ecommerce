const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT api/users/wishlist/:carId
// @desc    Add or remove a car from the user's wishlist
// @access  Private
router.put('/wishlist/:carId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const carId = req.params.carId;

        // Check if the car is already in the wishlist
        const isWishlisted = user.wishlist.some(item => item.toString() === carId);

        if (isWishlisted) {
            // Remove from wishlist
            user.wishlist = user.wishlist.filter(item => item.toString() !== carId);
            await user.save();
            res.json({ message: 'Car removed from wishlist' });
        } else {
            // Add to wishlist
            user.wishlist.push(carId);
            await user.save();
            res.json({ message: 'Car added to wishlist' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
    try {
        // Populate the wishlist with car details
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 