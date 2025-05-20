# Car Rental E-commerce Platform

A modern web application for renting cars online. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization
- Browse available cars with filters
- Detailed car information and images
- Booking system with date selection
- Payment integration
- Admin dashboard for managing cars and bookings
- User profile management
- Reviews and ratings system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd car-rental-ecommerce
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Install frontend dependencies:
```bash
cd client
npm install
```

5. Start the development servers:

For backend only:
```bash
npm run dev
```

For frontend only:
```bash
npm run client
```

For both frontend and backend:
```bash
npm run dev:full
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Cars
- GET /api/cars - Get all cars
- GET /api/cars/:id - Get car details
- POST /api/cars - Create new car (admin only)
- PUT /api/cars/:id - Update car (admin only)
- DELETE /api/cars/:id - Delete car (admin only)

### Bookings
- POST /api/bookings - Create new booking
- GET /api/bookings - Get user bookings
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id - Update booking status

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 