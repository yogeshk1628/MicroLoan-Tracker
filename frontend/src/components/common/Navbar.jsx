import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link as ScrollLink } from 'react-scroll';

export default function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Left - Company Name */}
        <Typography variant="h6" component="div">
          CompanyName
        </Typography>

        {/* Center - Scroll Links */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <ScrollLink 
            to="faq" 
            smooth={true} 
            duration={500} 
            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
            FAQ
          </ScrollLink>
          <ScrollLink 
            to="services" 
            smooth={true} 
            duration={500} 
            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
            SERVICES
          </ScrollLink>
          <ScrollLink 
            to="aboutus" 
            smooth={true} 
            duration={500} 
            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
            ABOUT US
          </ScrollLink>
        </Box>

        {/* Right - Sign Up and Login buttons */}
        <Box>
          <Button color="inherit" variant="outlined" sx={{ mr: 1 }}>
            Sign Up
          </Button>
          <Button color="inherit" variant="contained">
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
