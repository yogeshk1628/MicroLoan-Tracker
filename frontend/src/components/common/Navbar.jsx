import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link as ScrollLink } from 'react-scroll';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import BusinessIcon from '@mui/icons-material/Business';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import { Chip } from '@mui/material';

const navLinks = [
  { label: 'FAQ', to: 'faq', icon: <HelpIcon /> },
  { label: 'SERVICES', to: 'services', icon: <RoomServiceIcon /> },
  { label: 'ABOUT US', to: 'aboutus', icon: <InfoIcon /> },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Navigation Links for Scroll (Desktop)
  const links = (
    <>
      {navLinks.map((link) => (
        <ScrollLink
          key={link.to}
          to={link.to}
          smooth={true}
          duration={500}
          style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
          onClick={() => setDrawerOpen(false)}
        >
          <Button
            startIcon={link.icon}
            sx={{
              color: 'inherit',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {link.label}
          </Button>
        </ScrollLink>
      ))}
    </>
  );

  const handleSignUp = () => {
    navigate('/signup');
  };
  
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 5,
          mb: 2,
        }}
        elevation={6}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Left - Company Name with Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
              onClick={() => navigate('/')}
            >
              <BusinessIcon sx={{ fontSize: 28 }} />
              CompanyName
            </Typography>
            <Chip
              label="VISITOR"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
              }}
            />
          </Box>

          {/* Center - Navigation Links (Desktop) */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                flex: 1,
              }}
            >
              {links}
            </Box>
          )}

          {/* Right - Auth Buttons (Desktop) */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleSignUp}
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 700, 
                  px: 3,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Sign Up
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={handleLogin}
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  px: 3,
                  ml: 1,
                  color: '#667eea',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          ) : (
            // Mobile - Hamburger Menu
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 320, 
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ pt: 3, px: 3 }}>
          {/* Welcome Section in Mobile Drawer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 4,
              p: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 48 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Welcome Visitor
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Join us today!
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setDrawerOpen(false);
                  handleSignUp();
                }}
                sx={{
                  flex: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogin();
                }}
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </Box>

          {/* Navigation Links */}
          <List sx={{ pt: 0 }}>
            {navLinks.map((link) => (
              <ListItemButton 
                key={link.to} 
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ScrollLink
                  to={link.to}
                  smooth
                  duration={500}
                  style={{
                    cursor: 'pointer',
                    color: 'inherit',
                    textDecoration: 'none',
                    width: '100%',
                    display: 'block',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {link.icon}
                    <ListItemText 
                      primary={link.label}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    />
                  </Box>
                </ScrollLink>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
