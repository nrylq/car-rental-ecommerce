import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars?available=true&limit=3');
        setFeaturedCars(response.data);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      }
    };

    fetchFeaturedCars();
  }, []);

  const handleSearch = () => {
    navigate(`/cars?location=${searchLocation}`);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Ride
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Rent a car for your next adventure
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              sx={{
                maxWidth: 500,
                bgcolor: 'white',
                borderRadius: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleSearch}
                      startIcon={<Search />}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Featured Cars Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Cars
        </Typography>
        <Grid container spacing={4}>
          {featuredCars.map((car) => (
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
                  <Typography gutterBottom variant="h5" component="h2">
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
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Wide Selection
              </Typography>
              <Typography>
                Choose from our extensive fleet of vehicles, from economy to luxury.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Best Prices
              </Typography>
              <Typography>
                Competitive rates and transparent pricing with no hidden fees.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                24/7 Support
              </Typography>
              <Typography>
                Our customer service team is always available to assist you.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 