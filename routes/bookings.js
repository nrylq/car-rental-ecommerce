const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const auth = require('./auth').auth;

// Create new booking
router.post('/', auth, async (req, res) => {
    try {
        const car = await Car.findById(req.body.car);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (!car.available) {
            return res.status(400).json({ message: 'Car is not available for booking' });
        }

        // Check if car is already booked for the selected dates
        const existingBooking = await Booking.findOne({
            car: req.body.car,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    startDate: { $lte: req.body.endDate },
                    endDate: { $gte: req.body.startDate }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Car is already booked for these dates' });
        }

        const booking = new Booking({
            ...req.body,
            user: req.user._id
        });

        await booking.save();

        // Update user's bookings array
        req.user.bookings.push(booking._id);
        await req.user.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('car')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('car')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to view this booking
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update booking status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only admin can update booking status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.body;
        booking.status = status;

        // Update car availability based on booking status
        const car = await Car.findById(booking.car);
        if (status === 'cancelled' || status === 'completed') {
            car.available = true;
        } else if (status === 'confirmed') {
            car.available = false;
        }
        await car.save();

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to cancel this booking
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only allow cancellation of pending or confirmed bookings
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Update car availability
        const car = await Car.findById(booking.car);
        car.available = true;
        await car.save();

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const bookings = await Booking.find()
            .populate('car')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 