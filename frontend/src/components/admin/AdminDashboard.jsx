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
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  AccountBalance,
  TrendingUp,
  Payment,
  CalendarToday,
  People,
  Block,
  CheckBox,
  Close,
  Visibility,
  PersonAdd,
  AttachMoney,
  Receipt,
  Dashboard,
  MonetizationOn,
  Warning,
  Calculate,
  Edit,
  TaskAlt,
  CancelOutlined,
  ReceiptLong,
  Update,
} from "@mui/icons-material";
import Navbar from "./AdminNavbar";

const AdminDashboard = ({ userProfile, setUserProfile, onLogout, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openPaymentHistory, setOpenPaymentHistory] = useState(false);
  const [openAssignLoan, setOpenAssignLoan] = useState(false);
  const [openConfirmPayment, setOpenConfirmPayment] = useState(false);
  const [openPenaltyCalculator, setOpenPenaltyCalculator] = useState(false);
  const [openUpdateLoan, setOpenUpdateLoan] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchAllUsers();
    fetchAllLoans();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      console.log("Fetched users:", data); // Debug log
      setUsers(data || []);
    } catch (error) {
      console.error("Users fetch error:", error);
      showToast?.("Failed to load users", "error");
      // Fallback - show empty array instead of nothing
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLoans = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/allloans`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) throw new Error("Failed to fetch loans");
      const data = await res.json();
      setLoans(data || []);
    } catch (error) {
      console.error("Loans fetch error:", error);
      showToast?.("Failed to load loans", "error");
    }
  };

  const handleUserAction = async (userId, action, value) => {
    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      let method = "POST";
      let body = {};

      switch(action) {
        case "toggle":
          endpoint = `${API_BASE_URL}/api/admin/user/${userId}/toggle`;
          body = { isActive: value };
          break;
        case "kyc":
          endpoint = `${API_BASE_URL}/api/admin/user/${userId}/kyc`;
          body = { kycStatus: value };
          break;
        default:
          throw new Error("Invalid action");
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error(`Failed to ${action}`);
      
      showToast?.(`User ${action} successful`, "success");
      fetchAllUsers();
    } catch (error) {
      console.error(`${action} error:`, error);
      showToast?.(`Failed to ${action} user`, "error");
    }
  };

  const handleLoanStatusToggle = async (loanId, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/loans/${loanId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error("Failed to update loan status");
      
      showToast?.(`Loan ${newStatus} successfully`, "success");
      fetchAllLoans();
    } catch (error) {
      console.error("Update loan status error:", error);
      showToast?.("Failed to update loan status", "error");
    }
  };

  const handleConfirmRepayment = async (loanId, day, isPaid) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/loans/confirm-repayment`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loanId, day, isPaid }),
      });
      
      if (!res.ok) throw new Error("Failed to confirm repayment");
      
      showToast?.("Repayment confirmed successfully", "success");
      fetchAllLoans();
      setOpenConfirmPayment(false);
    } catch (error) {
      console.error("Confirm repayment error:", error);
      showToast?.("Failed to confirm repayment", "error");
    }
  };

  // Your existing calculatePenalties function - no changes made as requested
  const calculatePenalties = async (loanId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/${loanId}/penalty`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) throw new Error("Failed to calculate penalties");
      const data = await res.json();
      
      setSelectedLoan({ ...selectedLoan, penaltyData: data });
      setOpenPenaltyCalculator(true);
    } catch (error) {
      console.error("Calculate penalties error:", error);
      showToast?.("Failed to calculate penalties", "error");
    }
  };

  // NEW: Function to handle Calculate Penalties button click
  const handleCalculatePenaltiesClick = (loan) => {
    setSelectedLoan(loan);
    calculatePenalties(loan._id);
  };

  const handleCompleteLoan = async (loanId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/loans/${loanId}/complete`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) throw new Error("Failed to complete loan");
      
      showToast?.("Loan completed successfully", "success");
      fetchAllLoans();
    } catch (error) {
      console.error("Complete loan error:", error);
      showToast?.("Failed to complete loan", "error");
    }
  };

  const handleUpdateLoanStatus = async (loanId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/${loanId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Failed to update loan status");
      
      showToast?.("Loan status updated successfully", "success");
      setOpenUpdateLoan(false);
      fetchAllLoans();
    } catch (error) {
      console.error("Update loan status error:", error);
      showToast?.("Failed to update loan status", "error");
    }
  };

  const PaymentHistoryDialog = () => (
    <Dialog open={openPaymentHistory} onClose={() => setOpenPaymentHistory(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          Payment History - {selectedLoan?.user?.firstName} {selectedLoan?.user?.lastName}
        </Typography>
        <IconButton onClick={() => setOpenPaymentHistory(false)}>
          <Close />
        </IconButton>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedLoan?.repayments?.map((repayment, index) => (
                <TableRow key={index}>
                  <TableCell>Day {repayment.day}</TableCell>
                  <TableCell>₹{repayment.dueAmount}</TableCell>
                  <TableCell>₹{repayment.paidAmount}</TableCell>
                  <TableCell>
                    <Chip
                      label={repayment.isPaid ? "Paid" : "Pending"}
                      color={repayment.isPaid ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {!repayment.isPaid && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleConfirmRepayment(selectedLoan._id, repayment.day, true)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );

  const AssignLoanDialog = () => {
    const [loanAmount, setLoanAmount] = useState(5000);
    const [duration, setDuration] = useState(60);

    const handleAssignLoan = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/loans`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId: selectedUser._id,
            loanAmount, 
            termDays: duration 
          }),
        });
        
        if (!res.ok) throw new Error("Failed to assign loan");
        
        showToast?.("Loan assigned successfully", "success");
        setOpenAssignLoan(false);
        fetchAllLoans();
      } catch (error) {
        console.error("Assign loan error:", error);
        showToast?.("Failed to assign loan", "error");
      }
    };

    return (
      <Dialog open={openAssignLoan} onClose={() => setOpenAssignLoan(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Loan to {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Loan Amount (₹)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Duration (Days)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignLoan(false)}>Cancel</Button>
          <Button onClick={handleAssignLoan} variant="contained">
            Assign Loan
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // UPDATED: Enhanced Penalty Calculator Dialog with better display
  const PenaltyCalculatorDialog = () => (
    <Dialog open={openPenaltyCalculator} onClose={() => setOpenPenaltyCalculator(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          Penalty Calculation - {selectedLoan?.user?.firstName} {selectedLoan?.user?.lastName}
        </Typography>
        <IconButton onClick={() => setOpenPenaltyCalculator(false)}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="error.main" fontWeight="bold">
            ₹{selectedLoan?.penaltyData?.remainingBalance || 0}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total Remaining Balance (including penalties)
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Calculation Summary:</Typography>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2">
              <strong>Loan ID:</strong> {selectedLoan?.penaltyData?.loanId}
            </Typography>
            <Typography variant="body2">
              <strong>Total Days Calculated:</strong> {selectedLoan?.penaltyData?.totalDays}
            </Typography>
            <Typography variant="body2">
              <strong>Remaining Balance:</strong> ₹{selectedLoan?.penaltyData?.remainingBalance}
            </Typography>
          </Paper>
        </Box>

        {selectedLoan?.penaltyData?.missedPayments && selectedLoan.penaltyData.missedPayments.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>Missed Payments Breakdown:</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLoan.penaltyData.missedPayments.map((missed, index) => (
                    <TableRow key={index}>
                      <TableCell>Day {missed.day}</TableCell>
                      <TableCell>₹{missed.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  const UpdateLoanDialog = () => {
    const [loanStatus, setLoanStatus] = useState(selectedLoan?.status || "pending");

    const handleUpdateLoan = () => {
      handleUpdateLoanStatus(selectedLoan._id, loanStatus);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return '#ff9800';
        case 'approved': return '#4caf50';
        case 'active': return '#2196f3';
        case 'completed': return '#9c27b0';
        case 'rejected': return '#f44336';
        default: return '#757575';
      }
    };

    return (
      <Dialog 
        open={openUpdateLoan} 
        onClose={() => setOpenUpdateLoan(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'visible'
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
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #764ba2',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Update sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Update Loan Status
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Modify the current status of the selected loan
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3,
              border: '1px solid #eee',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Loan Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Borrower:</strong> {selectedLoan?.user?.firstName} {selectedLoan?.user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Amount:</strong> ₹{selectedLoan?.loanAmount?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Status:</strong> 
              <Chip 
                label={selectedLoan?.status} 
                size="small" 
                sx={{ ml: 1, bgcolor: getStatusColor(selectedLoan?.status), color: 'white' }}
              />
            </Typography>
          </Paper>

          <FormControl 
            fullWidth 
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#667eea',
              }
            }}
          >
            <InputLabel sx={{ fontWeight: 500 }}>Select New Status</InputLabel>
            <Select
              value={loanStatus}
              onChange={(e) => setLoanStatus(e.target.value)}
              label="Select New Status"
              sx={{ py: 1 }}
            >
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getStatusColor('pending') 
                  }} />
                  <span>⏳ Pending</span>
                </Box>
              </MenuItem>
              <MenuItem value="approved">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getStatusColor('approved') 
                  }} />
                  <span>✅ Approved</span>
                </Box>
              </MenuItem>
              <MenuItem value="active">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getStatusColor('active') 
                  }} />
                  <span>🔄 Active</span>
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getStatusColor('completed') 
                  }} />
                  <span>🎉 Completed</span>
                </Box>
              </MenuItem>
              <MenuItem value="rejected">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getStatusColor('rejected') 
                  }} />
                  <span>❌ Rejected</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenUpdateLoan(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#bbb',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateLoan} 
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  const activeLoans = loans.filter(loan => loan.status === "active").length;
  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
  const pendingPayments = loans.reduce((sum, loan) => sum + (loan.repayments?.filter(r => !r.isPaid).length || 0), 0);

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
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, Admin 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage users, loans, and payments from your admin dashboard
          </Typography>
        </Paper>

        {/* Admin Stats Cards */}
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
              <People sx={{ fontSize: 40, opacity: 0.9 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: "0.85rem", fontWeight: 500 }}>
                  Total Users
                </Typography>
                <Typography variant="h5" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                  {users.length}
                </Typography>
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
              <AccountBalance sx={{ fontSize: 40, color: "#d84315" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "#bf360c", fontSize: "0.85rem", fontWeight: 500 }}>
                  Active Loans
                </Typography>
                <Typography variant="h5" fontWeight="700" color="#d84315" sx={{ lineHeight: 1.2 }}>
                  {activeLoans}
                </Typography>
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
              <MonetizationOn sx={{ fontSize: 40, color: "#2e7d32" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "#1b5e20", fontSize: "0.85rem", fontWeight: 500 }}>
                  Total Loans
                </Typography>
                <Typography variant="h5" fontWeight="700" color="#2e7d32" sx={{ lineHeight: 1.2 }}>
                  ₹{totalLoanAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, #ff6b9d 0%, #ff8a56 100%)",
              color: "white",
              p: 3,
              height: "120px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 20px rgba(255, 107, 157, 0.15)",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(255, 107, 157, 0.25)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
              <Payment sx={{ fontSize: 40, opacity: 0.9 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: "0.85rem", fontWeight: 500 }}>
                  Pending Payments
                </Typography>
                <Typography variant="h5" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                  {pendingPayments}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Card elevation={0} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}>
          <CardContent sx={{ p: 4 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab icon={<People />} label="User Management" />
              <Tab icon={<AccountBalance />} label="Loan Management" />
            </Tabs>

            {tabValue === 0 && (
              <>
                {users.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Users will appear here once they register on the platform
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>KYC</TableCell>
                          <TableCell>Loans</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                  {(user.firstName?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0))?.toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {user.firstName} {user.lastName} {user.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.isActive !== false ? "Active" : "Disabled"}
                                color={user.isActive !== false ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.kycStatus || "Pending"}
                                color={user.kycStatus === "approved" ? "success" : "warning"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {loans.filter(loan => loan.user?._id === user._id).length} loans
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Tooltip title="Toggle Account">
                                  <IconButton
                                    color={user.isActive !== false ? "error" : "success"}
                                    onClick={() => handleUserAction(user._id, "toggle", user.isActive === false)}
                                  >
                                    {user.isActive !== false ? <Block /> : <CheckBox />}
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Approve KYC">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={user.kycStatus === "approved"}
                                    onClick={() => handleUserAction(user._id, "kyc", "approved")}
                                  >
                                    {user.kycStatus === "approved" ? "Approved" : "Approve KYC"}
                                  </Button>
                                </Tooltip>

                                <Tooltip title="Assign Loan">
                                  <IconButton
                                    color="primary"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setOpenAssignLoan(true);
                                    }}
                                  >
                                    <AttachMoney />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}

            {tabValue === 1 && (
              <>
                {loans.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No loans found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loans will appear here once they are assigned to users
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Borrower</TableCell>
                          <TableCell>Loan Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loans.map((loan) => {
                          const paidRepayments = loan.repayments?.filter(r => r.isPaid).length || 0;
                          const totalRepayments = loan.repayments?.length || 0;
                          const progress = totalRepayments > 0 ? (paidRepayments / totalRepayments) * 100 : 0;
                          
                          return (
                            <TableRow key={loan._id}>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                                    {(loan.user?.firstName?.charAt(0) || "?").toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      {loan.user?.firstName} {loan.user?.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {loan.user?.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="bold">
                                  ₹{loan.loanAmount?.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {loan.termDays} days • ₹{loan.dailyPayment}/day
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                 
                                  <Chip
                                    label={loan.status}
                                    color={
                                      loan.status === "active" ? "success" :
                                      loan.status === "completed" ? "info" :
                                      loan.status === "approved" ? "success" :
                                      loan.status === "pending" ? "warning" : "error"
                                    }
                                    size="large"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ width: "100%", mr: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={progress} 
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {paidRepayments}/{totalRepayments} payments ({Math.round(progress)}%)
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  <Tooltip title="Payment History">
                                    <IconButton
                                      color="info"
                                      onClick={() => {
                                        setSelectedLoan(loan);
                                        setOpenPaymentHistory(true);
                                      }}
                                    >
                                      <ReceiptLong />
                                    </IconButton>
                                  </Tooltip>

                                  {loan.status === 'active' && progress === 100 && (
                                    <Tooltip title="Complete Loan">
                                      <IconButton
                                        color="success"
                                        onClick={() => handleCompleteLoan(loan._id)}
                                      >
                                        <TaskAlt />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  <Tooltip title="Update Loan">
                                    <IconButton
                                      color="primary"
                                      onClick={() => {
                                        setSelectedLoan(loan);
                                        setOpenUpdateLoan(true);
                                      }}
                                    >
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>

                                  {/* NEW: Calculate Penalties Button */}
                                  <Tooltip title="Calculate Penalties">
                                    <IconButton
                                      color="warning"
                                      onClick={() => handleCalculatePenaltiesClick(loan)}
                                    >
                                      <Calculate />
                                    </IconButton>
                                  </Tooltip>

                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <PaymentHistoryDialog />
      <AssignLoanDialog />
      <PenaltyCalculatorDialog />
      <UpdateLoanDialog />
    </Box>
  );
};

export default AdminDashboard;
