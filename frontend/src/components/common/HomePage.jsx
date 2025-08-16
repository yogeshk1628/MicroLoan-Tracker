import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Container, Grid, Card, CardContent, Chip } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BackgroundImage from "../../assets/images/bg_image.jpg"; 
import Navbar from "./Navbar";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "10vh",
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 4,
        }}
      >
        {/* Stretched Box */}
        <Box
          sx={{
            padding: 6,
            borderRadius: 4,
            maxWidth: "90%",
            width: "100%",
            textAlign: "center",
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
       

          {/* Main Heading with Navbar Blue Text*/}
          <Typography 
            variant="h2" 
            sx={{ 
              color: "#667eea",  /* Navbar blue color */
              fontWeight: "800", 
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Micro Loan Management Made Easy
          </Typography>

          <Typography 
            variant="h4" 
            sx={{ 
              color: "#667eea",  /* Navbar blue color */
              fontWeight: "600", 
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Made Simple & Secure
          </Typography>

         

          {/* Feature Highlights */}
          <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SpeedIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Instant Approval
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  100% Secure
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Build Credit
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Easy Repayment
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Loan Details Card */}
          <Card 
            sx={{ 
              mb: 4, 
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              border: '2px solid #667eea',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ color: '#313f80', fontWeight: 700, mb: 1 }}>
                Loan Terms
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#3f51b5' }}>
                    ₹5,000
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#303f9f' }}>
                    Loan Amount
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#3f51b5' }}>
                    ₹100
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#303f9f' }}>
                    Daily Payment
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#3f51b5' }}>
                    60 Days
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#303f9f' }}>
                    Repayment Period
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ 
              borderRadius: "50px", 
              px: 6, 
              py: 2, 
              fontWeight: "bold",
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Apply for Loan Now
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
