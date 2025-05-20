const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal'],
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    additionalDrivers: {
        type: Number,
        default: 0
    },
    insurance: {
        type: Boolean,
        default: false
    },
    notes: String
}, {
    timestamps: true
});

// Calculate total price before saving
bookingSchema.pre('save', async function(next) {
    if (this.isModified('startDate') || this.isModified('endDate')) {
        const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
        const car = await mongoose.model('Car').findById(this.car);
        this.totalPrice = days * car.pricePerDay;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema); 