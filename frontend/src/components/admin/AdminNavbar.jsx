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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Chip } from '@mui/material';

const adminNavLinks = [
  { label: 'Users', to: '/admin/users', icon: <PeopleIcon /> },
  { label: 'Payments', to: '/admin/payments', icon: <PaymentIcon /> },
];

export default function Navbar({ userProfile, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Get user info from localStorage or props
  const user = userProfile || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  // Navigation Links for Admin Panel
  const links = (
    <>
      {adminNavLinks.map((link) => (
        <Button
          key={link.to}
          startIcon={link.icon}
          onClick={() => navigate(link.to)}
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
      ))}
    </>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/');
    window.location.reload();
  };

  // NEW: Handle profile click
  const handleProfileClick = () => {
    navigate('/profile');
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
          {/* Left - Company Name with Admin Badge */}
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
              onClick={() => navigate('/admin/dashboard')}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
              CompanyName
            </Typography>
            <Chip
              label="ADMIN"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
              }}
            />
          </Box>

          {/* Center - Admin Navigation Links (Desktop) */}
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

          {/* Right - Admin Profile & Logout (Clickable Profile) */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton onClick={handleProfileClick} sx={{ color: 'inherit' }}>
                <AccountCircleIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <Box 
                sx={{ ml: 1, cursor: 'pointer' }}
                onClick={handleProfileClick}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                  Administrator
                </Typography>
              </Box>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 700, 
                  px: 3,
                  ml: 2,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Logout
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
          {/* Admin Profile Section in Mobile Drawer (Clickable) */}
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
              cursor: 'pointer',
            }}
            onClick={() => {
              setDrawerOpen(false);
              handleProfileClick();
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 48 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                System Administrator
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              setDrawerOpen(false);
              handleLogout();
            }}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              mb: 3,
              width: '100%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Logout
          </Button>

          {/* Admin Navigation Links */}
          <List sx={{ pt: 0 }}>
            {adminNavLinks.map((link) => (
              <ListItemButton 
                key={link.to} 
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(link.to);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
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
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
