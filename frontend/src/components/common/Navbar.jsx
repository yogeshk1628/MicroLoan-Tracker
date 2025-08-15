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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as ScrollLink } from 'react-scroll';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const navLinks = [
  { label: 'FAQ', to: 'faq' },
  { label: 'SERVICES', to: 'services' },
  { label: 'ABOUT US', to: 'aboutus' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Get user info from localStorage if logged in
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Navigation Links for Scroll
  const links = (
    <>
      {navLinks.map((link) => (
        <ScrollLink
          key={link.to}
          to={link.to}
          smooth={true}
          duration={500}
          style={{
            cursor: 'pointer',
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 500,
            padding: '0 8px',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          {link.label}
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
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Refresh to update navbar state
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={0} sx={{borderRadius: 5}}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Left - Company Name */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            CompanyName
          </Typography>

          {/* Center - Links or Hamburger */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                left: 200,
                flex: 10,
              }}
            >
              {links}
            </Box>
          )}

          {/* Right - Auth Buttons or User Info (DESKTOP only) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {user ? (
                // Show user info when logged in
                <>
                  <AccountCircleIcon sx={{ mr: 1, fontSize: 28 }} />
                  <Typography sx={{ mr: 2, fontWeight: 500 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{ borderRadius: 5, fontWeight: 700, px: 3 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                // Show login/signup buttons when not logged in
                <>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={handleSignUp}
                    sx={{ borderRadius: 5, fontWeight: 700, px: 3 }}
                  >
                    Sign Up
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={handleLogin}
                    sx={{
                      border: '1px solid #fff',
                      borderRadius: 5,
                      fontWeight: 700,
                      px: 3,
                      color: '#1565c0',
                      backgroundColor: '#fff',
                    }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile nav */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: 280, padding: 0 },
        }}
      >
        <Box sx={{ pt: 2, px: 2 }}>
          {/* Auth Section in Mobile Drawer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {user ? (
              // Show user profile in mobile drawer
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              // Show login/signup in mobile drawer
              <>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleSignUp();
                  }}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    px: 4,
                    width: '100%',
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
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    px: 4,
                    width: '100%',
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Box>

          {/* Navigation Links */}
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.to} onClick={() => setDrawerOpen(false)}>
                <ScrollLink
                  to={link.to}
                  smooth
                  duration={500}
                  style={{
                    cursor: 'pointer',
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    width: '100%',
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  <ListItemText primary={link.label} />
                </ScrollLink>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
