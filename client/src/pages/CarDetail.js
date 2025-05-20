import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  CardMedia,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  IconButton,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const isAuthenticated = localStorage.getItem('token');

  useEffect(() => {
    fetchCarDetails();
    fetchCarReviews();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [id, isAuthenticated]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cars/${id}`);
      setCar(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch car details');
      setLoading(false);
    }
  };

   const fetchCarReviews = async () => {
    try {
      setReviewLoading(true);
      // Assuming an endpoint to get reviews for a specific car
      const response = await api.get(`/reviews/car/${id}`); 
      setReviews(response.data);
      setReviewLoading(false);
    } catch (err) {
      setReviewError('Failed to fetch reviews');
      setReviewLoading(false);
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

  const handleBookNow = () => {
    navigate(`/book/${id}`);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };
  
   const handleOpenReviewDialog = (review) => {
    setSelectedReview(review);
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setSelectedReview(null);
    setOpenReviewDialog(false);
  };

   const handleToggleWishlist = async () => {
     if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.put(`/users/wishlist/${id}`);
      // Update the local wishlist state
      if (wishlist.includes(id)) {
        setWishlist(wishlist.filter(carId => carId !== id));
      } else {
        setWishlist([...wishlist, id]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Potentially refetch wishlist on error for accuracy
      fetchWishlist();
    }
   };

   const isCarWishlisted = (carId) => wishlist.includes(carId);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Loading car details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Car not found.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          {/* Main Image */}
          <Box sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              image={car.images[currentImageIndex]}
              alt={`${car.make} ${car.model}`}
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Box>
          {/* Thumbnails */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
            {car.images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                sx={{
                  width: 80,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 0.5,
                  cursor: 'pointer',
                  border: index === currentImageIndex ? '2px solid primary.main' : 'none',
                }}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0}}>
              {car.make} {car.model} ({car.year})
            </Typography>
            {isAuthenticated && (
                <IconButton onClick={handleToggleWishlist} color="error" aria-label="add to wishlist">
                  {isCarWishlisted(car._id) ? <FavoriteIcon sx={{ fontSize: '2rem' }}/> : <FavoriteBorderIcon sx={{ fontSize: '2rem' }}/>}
                </IconButton>
             )}
          </Box>
          
          <Typography variant="h6" color="primary" gutterBottom>
            ${car.pricePerDay}/day
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Specifications</Typography>
          <Typography variant="body1">Type: {car.type}</Typography>
          <Typography variant="body1">Transmission: {car.transmission}</Typography>
          <Typography variant="body1">Fuel Type: {car.fuelType}</Typography>
          <Typography variant="body1">Seats: {car.seats}</Typography>
          <Typography variant="body1">Location: {car.location}</Typography>
          <Divider sx={{ my: 2 }} />
           <Typography variant="h6" gutterBottom>Description</Typography>
           <Typography variant="body1">{car.description}</Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleBookNow}
            sx={{ mt: 3 }}
          >
            Book Now
          </Button>
        </Grid>
      </Grid>
       <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
         {reviewLoading ? (
           <Typography>Loading reviews...</Typography>
         ) : reviewError ? (
           <Alert severity="error">{reviewError}</Alert>
         ) : reviews.length === 0 ? (
           <Typography>No reviews yet.</Typography>
         ) : (
           <Grid container spacing={2}>
             {reviews.map(review => (
               <Grid item xs={12} sm={6} md={4} key={review._id}>
                  <Paper sx={{ p: 2 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                     <Typography variant="subtitle1" sx={{ mr: 1 }}>{review.user ? review.user.name : 'Anonymous'}</Typography>
                     <Rating value={review.rating} readOnly size="small"/>
                   </Box>
                   <Typography variant="body2">{review.comment}</Typography>
                  </Paper>
               </Grid>
             ))}
           </Grid>
         )}
      </Box>
    </Container>
  );
};

export default CarDetail; 