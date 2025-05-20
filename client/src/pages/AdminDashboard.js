import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the Admin Dashboard. Choose an option from the navigation to manage data.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 