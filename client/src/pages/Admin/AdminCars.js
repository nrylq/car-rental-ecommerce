import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCar, setCurrentCar] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    type: '',
    transmission: '',
    fuelType: '',
    seats: '',
    pricePerDay: '',
    location: '',
    description: '',
    images: [], // Assuming image URLs or base64 strings
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cars');
      setCars(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cars');
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setCurrentCar(null);
    setFormData({
      make: '',
      model: '',
      year: '',
      type: '',
      transmission: '',
      fuelType: '',
      seats: '',
      pricePerDay: '',
      location: '',
      description: '',
      images: [],
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (car) => {
    setIsEditing(true);
    setCurrentCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      type: car.type,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      location: car.location,
      description: car.description,
      images: car.images,
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCar(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle image file selection (for adding/editing images)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // You might need to convert files to base64 or handle uploads separately
    // For simplicity, let's assume we are just adding file objects for now
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleSubmit = async () => {
    setFormError('');
    try {
      if (isEditing) {
        await api.put(`/cars/${currentCar._id}`, formData);
      } else {
        await api.post('/cars', formData);
      }
      handleCloseDialog();
      fetchCars();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save car');
    }
  };

  const handleDelete = async (carId) => {
    try {
      await api.delete(`/cars/${carId}`);
      fetchCars();
    } catch (err) {
      setError('Failed to delete car');
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
          Manage Cars
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ mb: 2 }}
        >
          Add New Car
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price per Day</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car._id}>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.type}</TableCell>
                  <TableCell>${car.pricePerDay}</TableCell>
                  <TableCell>{car.location}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditDialog(car)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(car._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Car Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{isEditing ? 'Edit Car' : 'Add New Car'}</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Car Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Car Type"
              >
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Compact">Compact</MenuItem>
                <MenuItem value="Van">Van</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Transmission</InputLabel>
              <Select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                label="Transmission"
              >
                <MenuItem value="Automatic">Automatic</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                label="Fuel Type"
              >
                <MenuItem value="Petrol">Petrol</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
             <TextField
              fullWidth
              label="Seats"
              name="seats"
              type="number"
              value={formData.seats}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price per Day"
              name="pricePerDay"
              type="number"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
             <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
             <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
             <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                Upload Images
                <input type="file" hidden multiple onChange={handleImageChange} />
              </Button>
              {/* Display selected image names or previews here if needed */}
              <Box>
                {formData.images.map((image, index) => (
                   // Assuming images are strings (URLs) for existing cars or File objects for new uploads
                   <Typography key={index} variant="body2">{typeof image === 'string' ? image : image.name}</Typography>
                ))}
              </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {isEditing ? 'Update Car' : 'Add Car'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminCars; 