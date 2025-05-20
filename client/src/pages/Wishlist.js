import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Wishlist = () => {
  const [wishlistCars, setWishlistCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/wishlist');
      setWishlistCars(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch wishlist');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading wishlist...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {wishlistCars.length === 0 ? (
          <Typography variant="body1">Your wishlist is empty.</Typography>
        ) : (
          <Grid container spacing={3}>
            {wishlistCars.map((car) => (
              <Grid item key={car._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/cars/${car._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                      {car.make} {car.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {car.type} • {car.transmission} • {car.seats} seats
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ${car.pricePerDay}/day
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Wishlist; 