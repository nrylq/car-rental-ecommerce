import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  FormLabel,
  IconButton,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const CarList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    transmission: '',
    fuelType: '',
    minPrice: 0,
    maxPrice: 1000,
    seats: '',
    location: '',
  });
  const [sort, setSort] = useState('priceAsc'); // Default sort: price ascending
  const [wishlist, setWishlist] = useState([]);
  const isAuthenticated = localStorage.getItem('token');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setFilters(prev => ({ ...prev, location: locationParam }));
    }
  }, [location]);

  useEffect(() => {
    fetchCars();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [filters, sort, isAuthenticated]);

  const fetchCars = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && !(key === 'minPrice' && value === 0) && !(key === 'maxPrice' && value === 1000)) {
           queryParams.append(key, value);
        }
      });
       // Add sorting parameters
      if (sort === 'priceAsc') {
        queryParams.append('sortBy', 'pricePerDay');
        queryParams.append('order', 'asc');
      } else if (sort === 'priceDesc') {
        queryParams.append('sortBy', 'pricePerDay');
        queryParams.append('order', 'desc');
      } else if (sort === 'yearAsc') {
        queryParams.append('sortBy', 'year');
        queryParams.append('order', 'asc');
      } else if (sort === 'yearDesc') {
         queryParams.append('sortBy', 'year');
        queryParams.append('order', 'desc');
      }

      const response = await api.get(`/cars?${queryParams}`);
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/users/wishlist');
      setWishlist(response.data.map(car => car._id)); // Store only car IDs in wishlist state
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleToggleWishlist = async (carId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.put(`/users/wishlist/${carId}`);
      // Update the local wishlist state
      if (wishlist.includes(carId)) {
        setWishlist(wishlist.filter(id => id !== carId));
      } else {
        setWishlist([...wishlist, carId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Potentially refetch wishlist on error for accuracy
      fetchWishlist();
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    }));
  };

   const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSort(newSort);
    }
  };


  const clearFilters = () => {
    setFilters({
      type: '',
      transmission: '',
      fuelType: '',
      minPrice: 0,
      maxPrice: 1000,
      seats: '',
      location: '',
    });
     setSort('priceAsc'); // Reset sort as well
  };

  const isCarWishlisted = (carId) => wishlist.includes(carId);

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Car Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Car Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Compact">Compact</MenuItem>
                <MenuItem value="Van">Van</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Transmission</InputLabel>
              <Select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                label="Transmission"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Automatic">Automatic</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                label="Fuel Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Petrol">Petrol</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Price Range (${filters.minPrice} - ${filters.maxPrice})</Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              sx={{ mb: 2 }}
            />
             <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Seats</InputLabel>
              <Select
                name="seats"
                value={filters.seats}
                onChange={handleFilterChange}
                label="Seats"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="7">7+</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ mb: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>

        {/* Car List */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom component="div">
              Available Cars ({cars.length})
            </Typography>
             <Box>
               <FormLabel component="legend" sx={{ mr: 1, display: 'inline-block' }}>Sort By:</FormLabel>
              <ToggleButtonGroup
                value={sort}
                exclusive
                onChange={handleSortChange}
                aria-label="car sorting"
                size="small"
              >
                <ToggleButton value="priceAsc" aria-label="price ascending">
                  Price <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>&#x25B2;</span>
                </ToggleButton>
                <ToggleButton value="priceDesc" aria-label="price descending">
                   Price <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>&#x25BC;</span>
                </ToggleButton>
                 <ToggleButton value="yearAsc" aria-label="year ascending">
                  Year <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>&#x25B2;</span>
                </ToggleButton>
                <ToggleButton value="yearDesc" aria-label="year descending">
                  Year <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>&#x25BC;</span>
                </ToggleButton>
              </ToggleButtonGroup>
             </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
             {Object.entries(filters).map(([key, value]) => {
              // Don't show default price range as chips unless changed
              if (value !== '' && !(key === 'minPrice' && value === 0) && !(key === 'maxPrice' && value === 1000) && key !== 'location') {
                return (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => setFilters(prev => ({ ...prev, [key]: key.includes('Price') ? (key === 'minPrice' ? 0 : 1000) : '' }))}
                    sx={{ mr: 1, mb: 1 }}
                  />
                );
              } else if (key === 'location' && value !== '') {
                 return (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                    sx={{ mr: 1, mb: 1 }}
                  />
                );
              }
              return null;
            })}
             {filters.minPrice !== 0 || filters.maxPrice !== 1000 ? (
               <Chip
                 label={`Price Range: ${filters.minPrice} - ${filters.maxPrice}`}
                 onDelete={() => setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 1000 }))}
                 sx={{ mr: 1, mb: 1 }}
               />
             ) : null}
          </Box>

          <Grid container spacing={3}>
            {cars.map((car) => (
              <Grid item key={car._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                       onClick={() => navigate(`/cars/${car._id}`)}
                       sx={{ cursor: 'pointer' }}
                    />
                     {isAuthenticated && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: isCarWishlisted(car._id) ? 'red' : 'white',
                        }}
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent card click when clicking icon
                          handleToggleWishlist(car._id);
                        }}
                        aria-label="add to wishlist"
                      >
                        {isCarWishlisted(car._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }}  onClick={() => navigate(`/cars/${car._id}`)}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {car.make} {car.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {car.type} • {car.transmission} • {car.seats} seats
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {car.location}
                    </Typography>
                     <Typography variant="body2" color="text.secondary">
                      Year: {car.year}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ${car.pricePerDay}/day
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CarList; 