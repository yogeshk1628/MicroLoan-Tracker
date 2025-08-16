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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  AccountBalance,
  TrendingUp,
  Payment,
  CalendarToday,
  History,
  Close,
  Warning,
  MonetizationOn,
  Percent,
  HourglassEmpty,
  AccessTime,
} from "@mui/icons-material";
import Navbar from "./UserNavbar";

const UserDashboard = ({ userProfile, onLogout, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [loanStats, setLoanStats] = useState({
    totalAmount: 0,
    dailyPayment: 100,
    daysRemaining: 0,
    paidAmount: 0,
    remainingBalance: 0,
    currentDay: 0,
    totalDays: 60,
    status: 'pending'
  });
  const [openPaymentHistory, setOpenPaymentHistory] = useState(false);
  const [openCreateLoan, setOpenCreateLoan] = useState(false);
  const [applyingLoan, setApplyingLoan] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchUserLoanData();
  }, [userProfile]);

  const fetchUserLoanData = async () => {
    console.log("🚀 Starting fetchUserLoanData...");
    setLoading(true);
    setFetchError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("📡 Making API call to /api/user/loans...");
      const res = await fetch("http://localhost:5000/api/user/loans", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const userLoans = await res.json();
      console.log("📄 User loans:", userLoans);
      
      const userLoan = userLoans.length > 0 ? userLoans[0] : null;
      
      if (userLoan) {
        setLoan(userLoan);
        setRepayments(userLoan.repayments || []);
        calculateLoanStats(userLoan);
      } else {
        setLoan(null);
        setRepayments([]);
        resetLoanStats();
      }
      
    } catch (error) {
      console.error("💥 Fetch error:", error);
      setFetchError(error.message);
      showToast?.(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateLoanStats = (loanData) => {
    console.log("📈 Calculating stats for loan:", loanData);
    
    const paidRepayments = loanData.repayments?.filter(r => r.isPaid) || [];
    const unpaidRepayments = loanData.repayments?.filter(r => !r.isPaid) || [];
    const totalRepayments = loanData.repayments?.length || 60;
    
    const paidAmount = paidRepayments.reduce((sum, r) => sum + r.paidAmount, 0);
    const remainingBalance = unpaidRepayments.reduce((sum, r) => sum + r.dueAmount, 0);
    
    const currentDay = paidRepayments.length + 1;
    const daysRemaining = Math.max(0, totalRepayments - paidRepayments.length);
    
    const newStats = {
      totalAmount: loanData.loanAmount || 5000,
      dailyPayment: loanData.dailyPayment || 100,
      daysRemaining,
      paidAmount,
      remainingBalance,
      currentDay,
      totalDays: totalRepayments,
      status: loanData.status || 'active'
    };
    
    console.log("📊 Setting new loan stats:", newStats);
    setLoanStats(newStats);
  };

  const resetLoanStats = () => {
    setLoanStats({
      totalAmount: 0,
      dailyPayment: 100,
      daysRemaining: 0,
      paidAmount: 0,
      remainingBalance: 0,
      currentDay: 0,
      totalDays: 60,
      status: 'No Loan'
    });
  };

  const handleCreateLoan = async () => {
    try {
      setApplyingLoan(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/loans", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      showToast?.("Loan application submitted successfully!", "success");
      setOpenCreateLoan(false);
      
      setTimeout(() => {
        fetchUserLoanData();
      }, 2000);

    } catch (error) {
      console.error("Create loan error:", error);
      showToast?.(error.message || "Failed to create loan application", "error");
    } finally {
      setApplyingLoan(false);
    }
  };

  const handlePayment = async () => {
    if (!loan) {
      showToast?.("No active loan found", "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const nextUnpaidDay = repayments.find(r => !r.isPaid);
      
      if (!nextUnpaidDay) {
        showToast?.("All payments completed!", "info");
        return;
      }

      const res = await fetch("http://localhost:5000/api/loans/confirm-repayment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanId: loan.id,
          day: nextUnpaidDay.day,
          isPaid: true
        }),
      });
      
      if (!res.ok) throw new Error("Payment processing failed");
      
      showToast?.("Payment processed successfully!", "success");
      fetchUserLoanData();
    } catch (error) {
      console.error("Payment error:", error);
      showToast?.("Payment processing failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const CreateLoanDialog = () => (
    <Dialog 
      open={openCreateLoan} 
      onClose={() => setOpenCreateLoan(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          position: 'relative',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <AccountBalance sx={{ fontSize: 32, opacity: 0.9 }} />
        Apply for MicroLoan

        <IconButton
          onClick={() => setOpenCreateLoan(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        
      <Typography 
          variant="body1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            mb: 3,
            py:3,
            fontSize: '1.05rem',
          }}
        >
          Apply for a fixed MicroLoan with the following terms:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'nowrap', mb: 3, }}>
          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)', minHeight: '120px', }}>
            <MonetizationOn sx={{ fontSize: 32, opacity: 0.9 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>Loan Amount</Typography>
            <Typography variant="h5" fontWeight="bold">₹5,000</Typography>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, boxShadow: '0 4px 12px rgba(252, 182, 159, 0.15)', minHeight: '120px', }}>
            <Payment sx={{ fontSize: 32, color: '#d84315' }} />
            <Typography variant="body2" sx={{ color: '#bf360c', fontWeight: 600 }}>Daily Payment</Typography>
            <Typography variant="h5" fontWeight="bold" color="#d84315">₹100</Typography>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, boxShadow: '0 4px 12px rgba(168, 237, 234, 0.15)', minHeight: '120px', }}>
            <CalendarToday sx={{ fontSize: 32, color: '#2e7d32' }} />
            <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>Term</Typography>
            <Typography variant="h5" fontWeight="bold" color="#2e7d32">60 days</Typography>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, boxShadow: '0 4px 12px rgba(252, 162, 197, 0.15)', minHeight: '120px', }}>
            <Percent sx={{ fontSize: 32, color: '#c2185b' }} />
            <Typography variant="body2" sx={{ color: '#ad1457', fontWeight: 600 }}>Interest Rate</Typography>
            <Typography variant="h5" fontWeight="bold" color="#c2185b">20%</Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, gap: 2, background: 'linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%)', }}>
        <Button onClick={() => setOpenCreateLoan(false)} variant="outlined" size="large" sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, textTransform: 'none', borderColor: 'rgba(102, 126, 234, 0.3)', color: '#667eea', '&:hover': { borderColor: '#667eea', bgcolor: 'rgba(102, 126, 234, 0.05)', }, }}>Cancel</Button>
        <Button onClick={handleCreateLoan} variant="contained" size="large" disabled={applyingLoan} startIcon={applyingLoan ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, textTransform: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)', }, '&:disabled': { background: 'rgba(102, 126, 234, 0.6)', }, }}>
          {applyingLoan ? 'Applying...' : 'Apply for Loan'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const PaymentHistoryDialog = () => (
    <Dialog open={openPaymentHistory} onClose={() => setOpenPaymentHistory(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">Payment History</Typography>
        <IconButton onClick={() => setOpenPaymentHistory(false)}><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Due Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repayments.map((repayment, index) => (
                <TableRow key={index}>
                  <TableCell>Day {repayment.day}</TableCell>
                  <TableCell>₹{repayment.dueAmount}</TableCell>
                  <TableCell>₹{repayment.paidAmount}</TableCell>
                  <TableCell>
                    <Chip label={repayment.isPaid ? "Paid" : "Pending"} color={repayment.isPaid ? "success" : "warning"} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading loan data...</Typography>
      </Box>
    );
  }

  const progressPercentage = loanStats.totalDays > 0 ? 
    Math.round(((loanStats.totalDays - loanStats.daysRemaining) / loanStats.totalDays) * 100) : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar userProfile={userProfile} onLogout={onLogout} />
      </Box>
      <CssBaseline />

      <Container maxWidth="xl" sx={{ px: 4, py: 4 }}>
        {/* Welcome Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            textAlign: "center", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white", 
            borderRadius: 3, 
            p: 4, 
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>Welcome back 👋</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {!loan && "Apply for your first MicroLoan to get started"}
            {loan?.status === 'pending' && "Your loan application is being processed"}
            {loan?.status === 'active' && "Here's your MicroLoan overview and repayment status"}
            {loan?.status === 'completed' && "Congratulations! Your loan has been completed"}
          </Typography>
        </Paper>

        {/* No Loan State */}
        {!userProfile && !loan && (
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 4, 
              textAlign: "center", 
              borderRadius: 3, 
              p: 4, 
              background: 'white',
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <AccountBalance sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>No Active Loan Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Apply for a MicroLoan to get started with your financial journey.</Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => setOpenCreateLoan(true)} 
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', 
                '&:hover': { 
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)', 
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)', 
                }, 
              }}
            >
              Apply for Loan
            </Button>
          </Paper>
        )}

        {/* Pending Loan State */}
        {loan && loan.status === 'pending' && (
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 4, 
              textAlign: "center", 
              borderRadius: 3, 
              p: 4, 
              background: 'white',
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <HourglassEmpty sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom color="warning.dark">Loan Application in Progress</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Your loan application is being reviewed. You'll be notified once it's approved.</Typography>
            <Chip label="Application Pending" color="warning" size="large" icon={<AccessTime />} sx={{ fontSize: '1rem', py: 1, px: 2, fontWeight: 600 }} />
          </Paper>
        )}

        {/* Active Loan State - Full Dashboard */}
        {loan && loan.status === 'active' && (
          <>
            {/* 4 Cards Container - Using CSS Grid for equal stretching */}
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: 3, 
                mb: 4,
                '@media (max-width: 960px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr',
                }
              }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                  color: "white", 
                  p: 3, 
                  height: "120px", 
                  display: "flex", 
                  alignItems: "center", 
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                  transition: "transform 0.2s, box-shadow 0.2s", 
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.25)",
                  }, 
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <AccountBalance sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85, fontSize: "0.85rem", fontWeight: 500 }}>Loan Amount</Typography>
                    <Typography variant="h5" fontWeight="700" sx={{ lineHeight: 1.2 }}>₹{loanStats.totalAmount.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", 
                  p: 3, 
                  height: "120px", 
                  display: "flex", 
                  alignItems: "center", 
                  boxShadow: "0 4px 20px rgba(252, 182, 159, 0.15)",
                  transition: "transform 0.2s, box-shadow 0.2s", 
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 8px 25px rgba(252, 182, 159, 0.25)",
                  }, 
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <Payment sx={{ fontSize: 40, color: "#d84315" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#bf360c", fontSize: "0.85rem", fontWeight: 500 }}>Daily Payment</Typography>
                    <Typography variant="h5" fontWeight="700" color="#d84315" sx={{ lineHeight: 1.2 }}>₹{loanStats.dailyPayment}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", 
                  p: 3, 
                  height: "120px", 
                  display: "flex", 
                  alignItems: "center", 
                  boxShadow: "0 4px 20px rgba(168, 237, 234, 0.15)",
                  transition: "transform 0.2s, box-shadow 0.2s", 
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 8px 25px rgba(168, 237, 234, 0.25)",
                  }, 
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <CalendarToday sx={{ fontSize: 40, color: "#2e7d32" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1b5e20", fontSize: "0.85rem", fontWeight: 500 }}>Days Remaining</Typography>
                    <Typography variant="h5" fontWeight="700" color="#2e7d32" sx={{ lineHeight: 1.2 }}>{loanStats.daysRemaining}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  bgcolor: "white", 
                  p: 3, 
                  height: "120px", 
                  display: "flex", 
                  alignItems: "center", 
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s", 
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
                  }, 
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.85rem", fontWeight: 500 }}>Loan Status</Typography>
                    <Chip label="Active" color="success" icon={<CheckCircle />} size="medium" sx={{ fontWeight: "bold", fontSize: "0.85rem" }} />
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: "success.main" }} />
                </Box>
              </Paper>
            </Box>

            {/* Today's Payment Due */}
            {loanStats.daysRemaining > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  mb: 4, 
                  borderRadius: 3, 
                  background: "linear-gradient(135deg, #ff6b9d 0%, #ff8a56 100%)", 
                  color: "white", 
                  p: 2, 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  flexDirection: { xs: "column", sm: "row" }, 
                  gap: { xs: 2, sm: 0 }, 
                  boxShadow: "0 4px 20px rgba(255, 107, 157, 0.15)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Payment sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Today's Payment Due</Typography>
                    <Typography variant="h5" fontWeight="800">₹{loanStats.dailyPayment}</Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handlePayment} 
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
                  PAY NOW
                </Button>
              </Paper>
            )}

            {/* Repayment Progress */}
            <Card elevation={0} sx={{ mb: 4, borderRadius: 3, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>Repayment Progress</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Typography variant="body1" fontWeight="medium">Day {loanStats.currentDay} of {loanStats.totalDays}</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercentage} 
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
                  <Typography variant="body1" fontWeight="bold" color="primary.main">{progressPercentage}%</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="success.main" fontWeight="bold">₹{loanStats.paidAmount.toLocaleString()} Paid</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">₹{loanStats.remainingBalance.toLocaleString()} Remaining</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">Payment History</Typography>
                  <Button variant="outlined" startIcon={<History />} onClick={() => setOpenPaymentHistory(true)}>View All</Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 200, bgcolor: "grey.50", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    {repayments.length > 0 
                      ? `${repayments.filter(r => r.isPaid).length} payments completed out of ${repayments.length}`
                      : "No payments recorded yet"
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        {/* Completed Loan State */}
        {loan && loan.status === 'completed' && (
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 4, 
              textAlign: "center", 
              borderRadius: 3, 
              p: 4, 
              background: 'white',
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom color="success.dark">Loan Completed Successfully!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Congratulations! You have successfully completed your loan repayment.</Typography>
            <Chip label="Loan Completed" color="success" size="large" icon={<CheckCircle />} sx={{ fontSize: '1rem', py: 1, px: 2, fontWeight: 600, mb: 3 }} />
            
            <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Loan Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{loanStats.paidAmount.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Days Taken</Typography>
                  <Typography variant="h6" fontWeight="bold">{loanStats.totalDays}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Original Amount</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{loan.loanAmount?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Interest Paid</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{Math.max(0, loanStats.paidAmount - loan.loanAmount).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Container>

      <CreateLoanDialog />
      <PaymentHistoryDialog />
    </Box>
  );
};

export default UserDashboard;
