import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Container } from "@mui/material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import BackgroundImage from "../../assets/images/bg_image.jpg"; 
import Navbar from "./Navbar";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <>
    <Navbar />
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box
        sx={{
          padding: 6,
          borderRadius: 4,
          maxWidth: 800,
          textAlign: "center",
        }}
      >
        <DocumentScannerIcon sx={{ fontSize: 60, color: "black", mb: 2 }} />
        <Typography variant="h3" sx={{ color: "black", fontWeight: "bold", mb: 2 }}>
          Secure Digital Document Authorization
        </Typography>
        <Typography variant="h6" sx={{ color: "black", mb: 4 }}>
          Automate document approvals, add legally binding digital signatures, and ensure authenticity with ease.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: "50px", px: 5, py: 1.5, fontWeight: "bold" }}
          onClick={handleGetStarted}
        >
          Get Started
        </Button>
      </Box>
    </Box>
    </>
  );
};

export default HomePage;