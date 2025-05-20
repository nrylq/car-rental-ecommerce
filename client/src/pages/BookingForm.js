import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInDays } from 'date-fns';
import axios from 'axios';

const BookingForm = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    pickupLocation: '',
    dropoffLocation: '',
    additionalDrivers: 0,
    insurance: false,
    paymentMethod: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${carId}`);
        setCar(response.data);
      } catch (error) {
        console.error('Error fetching car details:', error);
        setError('Error loading car details');
      }
    };

    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && car) {
      const days = differenceInDays(formData.endDate, formData.startDate);
      const basePrice = days * car.pricePerDay;
      const additionalDriverCost = formData.additionalDrivers * 10 * days;
      const insuranceCost = formData.insurance ? 20 * days : 0;
      setTotalPrice(basePrice + additionalDriverCost + insuranceCost);
    }
  }, [formData, car]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'insurance' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          ...formData,
          car: carId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/my-bookings');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during booking');
    }
  };

  if (!car) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book {car.make} {car.model}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      startDate: newValue,
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      endDate: newValue,
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={formData.startDate || new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pickup Location"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dropoff Location"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Additional Drivers"
                name="additionalDrivers"
                value={formData.additionalDrivers}
                onChange={handleChange}
                inputProps={{ min: 0, max: 3 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  label="Payment Method"
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="insurance"
                    checked={formData.insurance}
                    onChange={handleChange}
                  />
                }
                label="Add Insurance Coverage (+$20/day)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Typography>
                  Base Price: ${car.pricePerDay}/day
                </Typography>
                {formData.additionalDrivers > 0 && (
                  <Typography>
                    Additional Drivers: ${formData.additionalDrivers * 10}/day
                  </Typography>
                )}
                {formData.insurance && (
                  <Typography>
                    Insurance: $20/day
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Total Price: ${totalPrice}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!formData.startDate || !formData.endDate || !formData.paymentMethod}
              >
                Confirm Booking
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default BookingForm; 