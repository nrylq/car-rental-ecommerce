const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const auth = require('./auth').auth;

// Get all cars with filters
router.get('/', async (req, res) => {
    try {
        const {
            type,
            minPrice,
            maxPrice,
            transmission,
            fuelType,
            seats,
            location,
            available
        } = req.query;

        const filter = {};

        if (type) filter.type = type;
        if (transmission) filter.transmission = transmission;
        if (fuelType) filter.fuelType = fuelType;
        if (seats) filter.seats = parseInt(seats);
        if (location) filter.location = new RegExp(location, 'i');
        if (available !== undefined) filter.available = available === 'true';

        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
            if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
        }

        const cars = await Car.find(filter);
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single car
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new car (admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const car = new Car(req.body);
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update car (admin only)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const car = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete car (admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add review to car
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const review = {
            user: req.user._id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        car.reviews.push(review);
        
        // Update average rating
        const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0);
        car.rating = totalRating / car.reviews.length;

        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 