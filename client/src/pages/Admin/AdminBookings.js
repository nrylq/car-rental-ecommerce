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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({ status: '' });
  const [formError, setFormError] = useState('');


  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings'); // Assuming an /api/bookings endpoint for admin
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleOpenDetailsDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setSelectedBooking(null);
    setOpenDetailsDialog(false);
  };

   const handleOpenEditDialog = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({ status: booking.status });
    setFormError('');
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedBooking(null);
    setOpenEditDialog(false);
    setFormError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

   const handleEditSubmit = async () => {
    setFormError('');
    try {
      await api.put(`/bookings/${selectedBooking._id}`, editFormData); // Assuming a PUT /api/bookings/:id endpoint
      handleCloseEditDialog();
      fetchBookings();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`); // Assuming a DELETE /api/bookings/:id endpoint
      fetchBookings();
    } catch (err) {
      setError('Failed to delete booking');
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
          Manage Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Car</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking._id}</TableCell>
                  <TableCell>{booking.car ? booking.car.make + ' ' + booking.car.model : 'N/A'}</TableCell>
                  <TableCell>{booking.user ? booking.user.name : 'N/A'}</TableCell>
                   <TableCell>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>${booking.totalPrice}</TableCell>
                     <TableCell>{booking.status}</TableCell>
                  <TableCell>
                     <IconButton onClick={() => handleOpenDetailsDialog(booking)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenEditDialog(booking)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(booking._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Booking Details Dialog */}
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
          {selectedBooking && (
            <>
              <DialogTitle>Booking Details</DialogTitle>
               <DialogContent>
                <Typography variant="h6" gutterBottom>Booking Information</Typography>
                <Typography>ID: {selectedBooking._id}</Typography>
                <Typography>Car: {selectedBooking.car ? selectedBooking.car.make + ' ' + selectedBooking.car.model : 'N/A'}</Typography>
                 <Typography>User: {selectedBooking.user ? selectedBooking.user.name : 'N/A'}</Typography>
                <Typography>Dates: {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}</Typography>
                <Typography>Pickup: {selectedBooking.pickupLocation}</Typography>
                <Typography>Dropoff: {selectedBooking.dropoffLocation}</Typography>
                <Typography>Additional Drivers: {selectedBooking.additionalDrivers}</Typography>
                <Typography>Insurance: {selectedBooking.insurance ? 'Yes' : 'No'}</Typography>
                <Typography>Total Price: ${selectedBooking.totalPrice}</Typography>
                <Typography>Status: {selectedBooking.status}</Typography>
                 {selectedBooking.notes && <Typography>Notes: {selectedBooking.notes}</Typography>}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetailsDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
         {/* Edit Status Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Booking Status</DialogTitle>
          <DialogContent>
             {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
             <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editFormData.status}
                onChange={handleEditChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained" color="primary">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminBookings; 