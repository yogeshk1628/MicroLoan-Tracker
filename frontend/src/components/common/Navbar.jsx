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

  // Change as needed for routing
  const handleSignUp = () => {};
  const handleLogin = () => {};

  const activeBtn = "signup"; // or "login" if you want to highlight login

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: 'relative'
          }}
        >
          {/* Left: Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              letterSpacing: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              flexShrink: 0
            }}
          >
            CompanyName
          </Typography>

          {/* Center: Auth Buttons (desktop only) */}
          {!isMobile && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: theme.palette.primary.light,
              borderRadius: '32px',
              p: '2px',
              boxShadow: 1,
              gap: 1,
            }}>
              <Button
                variant="contained"
                disableElevation
                onClick={handleSignUp}
                sx={{
                  borderRadius: '32px',
                  fontWeight: 700,
                  px: 3,
                  py: 0.5,
                  fontSize: { xs: 13, sm: 15 },
                  bgcolor: activeBtn === "signup" ? "white" : theme.palette.primary.light,
                  color: activeBtn === "signup" ? theme.palette.primary.main : "white",
                  minWidth: 80,
                  boxShadow: "none",
                }}
              >
                SIGN UP
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleLogin}
                disabled={activeBtn !== "login"}
                sx={{
                  borderRadius: '32px',
                  fontWeight: 700,
                  px: 3,
                  py: 0.5,
                  fontSize: { xs: 13, sm: 15 },
                  bgcolor: activeBtn === "login" ? "white" : "#d5dbe3",
                  color: activeBtn === "login" ? theme.palette.primary.main : "#9fa9b3",
                  minWidth: 80,
                  boxShadow: "none",
                  "&.Mui-disabled": {
                    bgcolor: "#d5dbe3",
                    color: "#9fa9b3"
                  }
                }}
              >
                LOGIN
              </Button>
            </Box>
          )}

          {/* Desktop Center: Nav Links - Mobile Right: Hamburger */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' }, alignItems: 'center' }}>
            {!isMobile && navLinks.map((link) => (
              <ScrollLink
                key={link.to}
                to={link.to}
                smooth
                duration={500}
                style={navLinkStyle}
              >
                {link.label}
              </ScrollLink>
            ))}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setDrawerOpen(true)}
                size="large"
              >
                <MenuIcon fontSize="inherit" />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer at the right */}
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
          {/* Auth Buttons in Drawer - SIMPLE TEXT STYLE */}
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
                boxShadow: 'none'
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
              <ListItemButton
                key={link.to}
                onClick={() => setDrawerOpen(false)}
              >
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

// Desktop nav link style
const navLinkStyle = {
  cursor: "pointer",
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1rem",
  padding: "6px 12px",
  borderRadius: "8px",
  transition: "background 0.2s",
  marginRight: "4px"
};
