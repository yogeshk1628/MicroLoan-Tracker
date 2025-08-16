import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Container,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  AccountBalance,
  TrendingUp,
  Payment,
  CalendarToday,
} from "@mui/icons-material";
import Navbar from "./UserNavbar";
import * as echarts from "echarts";

// Main Dashboard Component
const UserDashboard = ({ userProfile, setUserProfile, onLogout, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/user/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = await res.json();

        setLoan(data.loan || null);
        setRepayments(data.repayments || []);
      } catch (error) {
        console.error("Status fetch error:", error);
        showToast?.("Failed to load user status", "error");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?._id) {
      fetchUserStatus();
    }
  }, [userProfile, showToast]);

  // Loading Screen
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  // Main Dashboard UI - Updated to match your image
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar userProfile={userProfile} onLogout={onLogout} />
      </Box>
      <CssBaseline />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Header - Matches your image */}
        <Paper
          elevation={6}
          sx={{
            mb: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 5,
            p: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Here's your MicroLoan overview and repayment status
          </Typography>
        </Paper>

        {/* Cards Row - Exactly matching your image layout */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Card 1: Loan Amount */}
          <Paper
            elevation={6}
            sx={{
              flex: 1,
              borderRadius: 5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AccountBalance sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 0.5 }}>
                  Loan Amount
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹5,000
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Card 2: Daily Payment */}
          <Paper
            elevation={6}
            sx={{
              flex: 1,
              borderRadius: 5,
              background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Payment sx={{ fontSize: 48, color: "#d84315" }} />
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                  Daily Payment
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#d84315">
                  ₹100
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Card 3: Days Remaining */}
          <Paper
            elevation={6}
            sx={{
              flex: 1,
              borderRadius: 5,
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CalendarToday sx={{ fontSize: 48, color: "#2e7d32" }} />
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                  Days Remaining
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  45
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Card 4: Loan Status */}
          <Paper
            elevation={6}
            sx={{
              flex: 1,
              borderRadius: 5,
              bgcolor: "white",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Loan Status
                </Typography>
                <Chip
                  label="Active"
                  color="success"
                  icon={<CheckCircle />}
                  size="medium"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
              <TrendingUp sx={{ fontSize: 48, color: "success.main" }} />
            </Box>
          </Paper>
        </Box>

        {/* Today's Payment Due - Matches your image */}
        <Paper
          elevation={6}
          sx={{
            mb: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #ff6b9d 0%, #ff8a56 100%)",
            color: "white",
            p: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Payment sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Today's Payment Due
              </Typography>
              <Typography variant="h3" fontWeight="900">
                ₹100
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: "#ff6b9d",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              "&:hover": { bgcolor: "#f5f5f5" },
              textTransform: "uppercase",
            }}
          >
            Pay Now
          </Button>
        </Paper>

        {/* Repayment Progress */}
        <Card elevation={6} sx={{ mb: 4, borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Repayment Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                Day 15 of 60
              </Typography>
              <LinearProgress
                variant="determinate"
                value={25}
                sx={{
                  flexGrow: 1,
                  height: 12,
                  borderRadius: 6,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 6,
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                25%
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  ₹1,500 Paid
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="warning.main" fontWeight="bold">
                  ₹4,500 Remaining
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card elevation={6} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Payment History
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              id="performanceChart"
              sx={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Payment history chart will appear here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UserDashboard;
