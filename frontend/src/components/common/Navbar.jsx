import React, { useState } from 'react';
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

const navLinks = [
  { label: 'FAQ', to: 'faq' },
  { label: 'SERVICES', to: 'services' },
  { label: 'ABOUT US', to: 'aboutus' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleSignUp = () => {};
  const handleLogin = () => {};
  const activeBtn = "signup"; // or "login"

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Left - Company Name */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                flex: 1,
              }}
            >
              {links}
            </Box>
          )}

          {/* Right - Auth Buttons (DESKTOP only) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ borderRadius: 5, fontWeight: 700, px: 3 }}
              >
                Sign Up
              </Button>
              <Button
                color="inherit"
                variant="contained"
                sx={{ borderRadius: 5, fontWeight: 700, px: 3 }}
              >
                Login
              </Button>
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
          '& .MuiDrawer-paper': { width: 240, padding: 0 },
        }}
      >
        <Box sx={{ pt: 2, px: 2 }}>
          {/* Simple Auth Buttons in Drawer (optional) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              mb: 3,
            }}
          >
            <Button
              variant="text"
              disableElevation
              onClick={() => { setDrawerOpen(false); handleSignUp(); }}
              sx={{
                fontWeight: 700,
                minWidth: 60,
                fontSize: "1rem",
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                borderRadius: 0,
                bgcolor: "transparent",
                px: 1,
                py: 0,
                boxShadow: 'none',
              }}
            >
              SIGN UP
            </Button>
            <Button
              variant="text"
              disableElevation
              onClick={() => { setDrawerOpen(false); handleLogin(); }}
              disabled={activeBtn !== "login"}
              sx={{
                fontWeight: 700,
                minWidth: 60,
                fontSize: "1rem",
                color: activeBtn === "login" ? theme.palette.primary.main : "#9fa9b3",
                textTransform: 'uppercase',
                borderRadius: 0,
                bgcolor: "transparent",
                px: 1,
                py: 0,
                boxShadow: 'none',
                ml: 0.5,
              }}
            >
              LOGIN
            </Button>
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
                    cursor: "pointer",
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    width: "100%",
                    display: "block",
                    fontWeight: 600,
                    fontSize: "1rem",
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
