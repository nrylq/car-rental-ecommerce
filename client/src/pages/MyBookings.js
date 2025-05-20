import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setReviewDialog(true);
  };

  const handleCloseReview = () => {
    setReviewDialog(false);
    setReview({ rating: 0, comment: '' });
  };

  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/reviews/${selectedBooking.car._id}`,
        review,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      handleCloseReview();
      fetchBookings();
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <img
                        src={booking.car.images[0]}
                        alt={booking.car.name}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        {booking.car.name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Total: ${booking.totalPrice}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={booking.status.toUpperCase()}
                          color={getStatusColor(booking.status)}
                          sx={{ mr: 1 }}
                        />
                        {booking.status === 'completed' && !booking.review && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenReview(booking)}
                            sx={{ ml: 1 }}
                          >
                            Write Review
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetails(booking)}
                          sx={{ ml: 1 }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Booking Details Dialog */}
        <Dialog
          open={Boolean(selectedBooking)}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          {selectedBooking && (
            <>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Car Details
                    </Typography>
                    <Typography>Name: {selectedBooking.car.name}</Typography>
                    <Typography>Type: {selectedBooking.car.type}</Typography>
                    <Typography>Transmission: {selectedBooking.car.transmission}</Typography>
                    <Typography>Price per day: ${selectedBooking.car.pricePerDay}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Booking Details
                    </Typography>
                    <Typography>
                      Start Date: {new Date(selectedBooking.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography>
                      End Date: {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography>Pickup Location: {selectedBooking.pickupLocation}</Typography>
                    <Typography>Dropoff Location: {selectedBooking.dropoffLocation}</Typography>
                    <Typography>Additional Drivers: {selectedBooking.additionalDrivers}</Typography>
                    <Typography>Insurance: {selectedBooking.insurance ? 'Yes' : 'No'}</Typography>
                    <Typography>Total Price: ${selectedBooking.totalPrice}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialog} onClose={handleCloseReview}>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={review.rating}
                onChange={(event, newValue) => {
                  setReview({ ...review, rating: newValue });
                }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReview}>Cancel</Button>
            <Button onClick={handleReviewSubmit} variant="contained">
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyBookings; 