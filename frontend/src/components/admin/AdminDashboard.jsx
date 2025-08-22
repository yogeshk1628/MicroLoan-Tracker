import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  CircularProgress,
  Paper,
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
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  AccountBalance,
  Payment,
  People,
  Close,
  AttachMoney,
  ReceiptLong,
  MonetizationOn,
  Edit,
  TaskAlt,
  Update,
  CheckCircle,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Navbar from "./AdminNavbar";

const AdminDashboard = ({
  userProfile,
  setUserProfile,
  onLogout,
  showToast,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openPaymentHistory, setOpenPaymentHistory] = useState(false);
  const [openAssignLoan, setOpenAssignLoan] = useState(false);
  const [openUpdateLoan, setOpenUpdateLoan] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeleteLoanConfirm, setOpenDeleteLoanConfirm] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const API_BASE_URL = "http://localhost:5000";

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    try {
      const value = Number(amount);
      return `₹${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch {
      return "₹0.00";
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllLoans();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/allusers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        const nonAdminUsers = data.data.filter((user) => user.role !== "admin");
        setUsers(nonAdminUsers);
      } else if (Array.isArray(data)) {
        const nonAdminUsers = data.filter((user) => user.role !== "admin");
        setUsers(nonAdminUsers);
      } else {
        setUsers([]);
      }
    } catch {
      showToast?.("Failed to load users", "error");
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch loans");
      const data = await res.json();
      setLoans(data || []);
    } catch {
      showToast?.("Failed to load loans", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/delete/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      showToast?.("User deleted successfully", "success");
      setOpenDeleteConfirm(false);
      setSelectedUser(null);
      fetchAllUsers();
    } catch {
      showToast?.("Failed to delete user", "error");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/admin/toggle-user-status/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to toggle user status");
      showToast?.("User status updated successfully", "success");
      fetchAllUsers();
    } catch {
      showToast?.("Failed to update user status", "error");
    }
  };

  const handleUpdateLoanStatus = async (loanId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/loans/${loanId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update loan status");

      showToast?.("Loan status updated successfully", "success");
      setOpenUpdateLoan(false);
      fetchAllLoans();
    } catch {
      showToast?.("Failed to update loan status", "error");
    }
  };

  const handleDeleteLoan = async (loanId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/loans/${loanId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to delete loan");
      showToast?.("Loan deleted successfully", "success");
      setOpenDeleteLoanConfirm(false);
      setSelectedLoan(null);
      fetchAllLoans();
    } catch {
      showToast?.("Failed to delete loan", "error");
    }
  };

  const CustomProgressBar = ({ value, total, status }) => {
    if (status === "completed") {
      return (
        <Box sx={{ width: "100%", position: "relative" }}>
          <Box
            sx={{
              height: 12,
              borderRadius: 6,
              background: "linear-gradient(90deg, #4caf50, #66bb6a)",
              width: "100%",
              position: "relative",
              boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 16,
                color: "white",
                position: "absolute",
                zIndex: 1,
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "block",
              fontWeight: 700,
              color: "#4caf50",
              textAlign: "center",
              fontSize: "0.75rem",
            }}
          >
            Loan Completed ✓
          </Typography>
        </Box>
      );
    }

    const percentage = total > 0 ? (value / total) * 100 : 0;

    const getProgressColor = () => {
      if (percentage === 100) return "#4caf50";
      if (percentage >= 75) return "#2196f3";
      if (percentage >= 50) return "#ff9800";
      return "#f44336";
    };

    return (
      <Box sx={{ width: "100%", position: "relative" }}>
        <Box
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: "#e0e0e0",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}dd)`,
              borderRadius: 6,
              transition: "width 0.3s ease-in-out",
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: "block",
            fontWeight: 600,
            color: getProgressColor(),
          }}
        >
          {value}/{total} payments ({Math.round(percentage)}%)
        </Typography>
      </Box>
    );
  };

  const CustomToggleSwitch = ({ checked, onChange, disabled = false }) => {
    return (
      <Box
        onClick={!disabled ? onChange : undefined}
        sx={{
          width: 60,
          height: 32,
          borderRadius: 16,
          backgroundColor: checked ? "#4caf50" : "#ccc",
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          opacity: disabled ? 0.6 : 1,
          boxShadow: checked
            ? "0 2px 8px rgba(76, 175, 80, 0.4)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": !disabled
            ? {
                transform: "scale(1.05)",
                boxShadow: checked
                  ? "0 4px 12px rgba(76, 175, 80, 0.6)"
                  : "0 4px 12px rgba(0,0,0,0.2)",
              }
            : {},
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "white",
            position: "absolute",
            top: 2,
            left: checked ? 30 : 2,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked ? (
            <CheckCircle sx={{ fontSize: 16, color: "#4caf50" }} />
          ) : (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ccc",
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  const UpdateLoanDialog = () => {
    const [loanStatus, setLoanStatus] = useState(
      selectedLoan?.status || "pending"
    );

    const handleUpdateLoan = () => {
      handleUpdateLoanStatus(selectedLoan._id, loanStatus);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "#ff9800";
        case "approved":
          return "#4caf50";
        case "active":
          return "#2196f3";
        case "completed":
          return "#9c27b0";
        case "rejected":
          return "#f44336";
        default:
          return "#757575";
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
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
            py: 3,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "10px solid #764ba2",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
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
              border: "1px solid #eee",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Loan Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Borrower:</strong> {selectedLoan?.user?.firstName}{" "}
              {selectedLoan?.user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Amount:</strong> ₹
              {selectedLoan?.loanAmount?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Status:</strong>
              <Chip
                label={selectedLoan?.status}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: getStatusColor(selectedLoan?.status),
                  color: "white",
                }}
              />
            </Typography>
          </Paper>
          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#667eea",
              },
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: getStatusColor("pending"),
                    }}
                  />
                  <span>⏳ Pending</span>
                </Box>
              </MenuItem>
              <MenuItem value="approved">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: getStatusColor("approved"),
                    }}
                  />
                  <span>✅ Approved</span>
                </Box>
              </MenuItem>
              <MenuItem value="active">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: getStatusColor("active"),
                    }}
                  />
                  <span>🔄 Active</span>
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: getStatusColor("completed"),
                    }}
                  />
                  <span>🎉 Completed</span>
                </Box>
              </MenuItem>
              <MenuItem value="rejected">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: getStatusColor("rejected"),
                    }}
                  />
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
              borderColor: "#ddd",
              color: "#666",
              "&:hover": {
                borderColor: "#bbb",
                backgroundColor: "#f5f5f5",
              },
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const PaymentHistoryDialog = () => {
    const [loanDetails, setLoanDetails] = useState(null);
    const [loadingLoanDetails, setLoadingLoanDetails] = useState(false);
    const [repaySubmitting, setRepaySubmitting] = useState(false);
    const [localPaymentInputs, setLocalPaymentInputs] = useState({});
    const isMountedRef = useRef(false);
    const loanIdRef = useRef(null);

    const openForLoanId = selectedLoan?._id || null;

    const fetchOnce = async (loanId) => {
      if (!loanId) return;
      setLoadingLoanDetails(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/loans/${loanId}/remaining-balance`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch loan details");
        const data = await res.json();
        setLoanDetails(data);
      } catch {
        showToast?.("Failed to fetch loan details", "error");
        setLoanDetails(null);
      } finally {
        setLoadingLoanDetails(false);
      }
    };

    const handleConfirmRepayment = async (loanId, day, paidAmount) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/loans/${loanId}/process-payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              day: day,
              amount: paidAmount,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to process payment");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        throw error;
      }
    };

    const openDialog = () => {
      if (!openForLoanId) return;
      if (loanIdRef.current === openForLoanId && isMountedRef.current) return;
      loanIdRef.current = openForLoanId;
      isMountedRef.current = true;
      setLocalPaymentInputs({});
      fetchOnce(openForLoanId);
    };

    if (openPaymentHistory) openDialog();

    const handleCloseDialog = () => {
      isMountedRef.current = false;
      loanIdRef.current = null;
      setLocalPaymentInputs({});
      setLoanDetails(null);
      setOpenPaymentHistory(false);
    };

    const breakdown = useMemo(
      () => loanDetails?.breakdown || [],
      [loanDetails]
    );

    // **UPDATED PAYMENT SUBMIT FUNCTION**
    const handlePaymentSubmit = async (dayData) => {
      const raw = localPaymentInputs[dayData.day];
      const amount = raw === "" || raw === undefined ? NaN : parseFloat(raw);
      if (!Number.isFinite(amount) || amount <= 0) {
        showToast?.("Please enter a valid payment amount", "error");
        return;
      }
      if (!openForLoanId) return;

      try {
        setRepaySubmitting(true);
        const result = await handleConfirmRepayment(
          openForLoanId,
          dayData.day,
          amount
        );

        // **UPDATE LOCAL STATE IMMEDIATELY** - No need to refetch entire loan
        setLoanDetails((prevLoanDetails) => {
          if (!prevLoanDetails || !prevLoanDetails.breakdown)
            return prevLoanDetails;

          const updatedBreakdown = prevLoanDetails.breakdown.map((item) => {
            if (item.day === dayData.day) {
              return {
                ...item,
                paidAmount: (item.paidAmount || 0) + amount, // Add to existing paid amount
                isPaid: true, // Mark as paid
                // Update other fields if returned from API
                penaltyApplied:
                  result.updatedBalance?.breakdown?.find(
                    (b) => b.day === dayData.day
                  )?.penaltyApplied || item.penaltyApplied,
                carryForward:
                  result.updatedBalance?.breakdown?.find(
                    (b) => b.day === dayData.day
                  )?.carryForward || item.carryForward,
              };
            }
            return item;
          });

          return {
            ...prevLoanDetails,
            breakdown: updatedBreakdown,
            totalRemaining:
              result.updatedBalance?.totalRemaining ||
              prevLoanDetails.totalRemaining,
          };
        });

        // Clear input field
        setLocalPaymentInputs((prev) => ({ ...prev, [dayData.day]: "" }));

        // Refresh main loans list in background
        fetchAllLoans();

        showToast?.("Payment recorded successfully", "success");
      } catch (error) {
        showToast?.(`Failed to record repayment: ${error.message}`, "error");
      } finally {
        setRepaySubmitting(false);
      }
    };

    const handleInputChange = (day, value) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      setLocalPaymentInputs((prev) => ({ ...prev, [day]: cleaned }));
    };

    return (
      <Dialog
        open={openPaymentHistory}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        keepMounted
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
            boxShadow: "0 25px 50px rgba(0,0,0,.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
            color: "white",
            py: 3,
            px: 4,
            borderRadius: "16px 16px 0 0",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #764ba2",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ReceiptLong sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Payment Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {selectedLoan?.user?.firstName} {selectedLoan?.user?.lastName} •
                Loan ID: {selectedLoan?._id?.slice(-6)}
              </Typography>
              {loanDetails?.totalRemaining !== undefined && (
                <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>
                  Total Remaining: {formatAmount(loanDetails.totalRemaining)}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,.1)",
                transform: "scale(1.1)",
              },
              transition: "all .2s ease",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingLoanDetails ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading payment details...
              </Typography>
            </Box>
          ) : breakdown.length > 0 ? (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Due Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Paid Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Remaining Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Penalty Applied
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Carry Forward
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        py: 2,
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breakdown.map((dayData, index) => {
                    const remainingAmount =
                      (dayData.totalDueForDay || 0) - (dayData.paidAmount || 0);

                    return (
                      <TableRow
                        key={`${dayData.day}-${index}`}
                        sx={{
                          "&:hover": { backgroundColor: "#f8f9ff" },
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <TableCell sx={{ py: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: dayData.isPaid
                                  ? "#4caf50"
                                  : "#ff9800",
                              }}
                            />
                            <Typography variant="body1" fontWeight="600">
                              Day {dayData.day}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            color="primary"
                          >
                            {formatAmount(dayData.dueAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography
                            variant="body1"
                            color={
                              dayData.isPaid ? "success.main" : "text.secondary"
                            }
                            fontWeight={dayData.isPaid ? "600" : "400"}
                          >
                            {formatAmount(dayData.paidAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography
                            variant="body1"
                            color={
                              remainingAmount > 0
                                ? "error.main"
                                : remainingAmount < 0
                                ? "success.main"
                                : "text.secondary"
                            }
                            fontWeight="500"
                          >
                            {formatAmount(remainingAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography
                            variant="body1"
                            color="error.main"
                            fontWeight="500"
                          >
                            {formatAmount(dayData.penaltyApplied)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Typography
                            variant="body1"
                            color={
                              dayData.carryForward > 0
                                ? "error.main"
                                : dayData.carryForward < 0
                                ? "success.main"
                                : "text.secondary"
                            }
                            fontWeight="500"
                          >
                            {formatAmount(dayData.carryForward)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          <Chip
                            label={dayData.isPaid ? "Paid" : "Pending"}
                            color={dayData.isPaid ? "success" : "warning"}
                            size="small"
                            sx={{ fontWeight: 600, borderRadius: 2, px: 1 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 3 }}>
                          {!dayData.isPaid && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <TextField
                                size="small"
                                type="text"
                                placeholder="Amount"
                                value={localPaymentInputs[dayData.day] ?? ""}
                                onChange={(e) =>
                                  handleInputChange(dayData.day, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handlePaymentSubmit(dayData);
                                  }
                                }}
                                sx={{
                                  width: 120,
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    fontSize: ".875rem",
                                  },
                                }}
                                inputMode="decimal"
                              />
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                disabled={
                                  repaySubmitting ||
                                  localPaymentInputs[dayData.day] ===
                                    undefined ||
                                  localPaymentInputs[dayData.day] === "" ||
                                  !Number.isFinite(
                                    parseFloat(localPaymentInputs[dayData.day])
                                  ) ||
                                  parseFloat(localPaymentInputs[dayData.day]) <=
                                    0
                                }
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 2,
                                  px: 2,
                                  fontWeight: 600,
                                  boxShadow: "0 2px 8px rgba(25,118,210,.3)",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(25,118,210,.4)",
                                    transform: "translateY(-1px)",
                                  },
                                  "&:disabled": {
                                    backgroundColor: "#e0e0e0",
                                    color: "#999",
                                  },
                                  transition: "all .2s ease",
                                }}
                                onClick={() => handlePaymentSubmit(dayData)}
                              >
                                {repaySubmitting ? "Processing..." : "Pay"}
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No payment details available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            py: 3,
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: "#ddd",
              color: "#666",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#bbb",
                backgroundColor: "rgba(0,0,0,.04)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const AssignLoanDialog = () => {
    const [loanAmount, setLoanAmount] = useState(5000);
    const [duration, setDuration] = useState(60);

    const handleAssignLoan = async () => {
      if (!selectedUser || !selectedUser._id) {
        showToast?.(
          "Please select a valid user before assigning a loan",
          "error"
        );
        return;
      }
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/loans`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser._id,
            loanAmount,
            termDays: duration,
          }),
        });

        if (!res.ok) {
          const errorData = await res.text();
          console.error("Server response:", errorData);
          throw new Error("Failed to assign loan");
        }

        showToast?.("Loan assigned successfully", "success");
        setOpenAssignLoan(false);
        setSelectedUser(null);
        fetchAllLoans();
      } catch (error) {
        console.error("Error assigning loan:", error);
        showToast?.("Failed to assign loan", "error");
      }
    };

    return (
      <Dialog
        open={openAssignLoan}
        onClose={() => setOpenAssignLoan(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.25rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            py: 3,
          }}
        >
          <AttachMoney sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Assign New Loan
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {selectedUser?.firstName} {selectedUser?.lastName}
            {selectedUser?._id && (
              <Typography
                variant="caption"
                sx={{ display: "block", opacity: 0.7 }}
              >
                ID: {selectedUser._id}
              </Typography>
            )}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {!selectedUser && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              No user selected. Please close this dialog and select a user
              first.
            </Typography>
          )}
          <TextField
            fullWidth
            label="Loan Amount (₹)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            disabled={!selectedUser}
            sx={{
              mb: 3,
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            label="Duration (Days)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={!selectedUser}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3, px: 3 }}>
          <Button
            onClick={() => {
              setOpenAssignLoan(false);
              setSelectedUser(null);
            }}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignLoan}
            variant="contained"
            disabled={!selectedUser || !selectedUser._id}
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Assign Loan
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const DeleteConfirmDialog = () => (
    <Dialog
      open={openDeleteConfirm}
      onClose={() => setOpenDeleteConfirm(false)}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.25rem",
          textAlign: "center",
          color: "error.main",
        }}
      >
        Confirm Delete User
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", pt: 2, pb: 3 }}>
        <Typography>
          Are you sure you want to delete user "{selectedUser?.firstName}{" "}
          {selectedUser?.lastName}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3, px: 3 }}>
        <Button
          onClick={() => setOpenDeleteConfirm(false)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleDeleteUser(selectedUser._id)}
          color="error"
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const DeleteLoanConfirmDialog = () => (
    <Dialog
      open={openDeleteLoanConfirm}
      onClose={() => setOpenDeleteLoanConfirm(false)}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.25rem",
          textAlign: "center",
          color: "error.main",
        }}
      >
        Confirm Delete Loan
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", pt: 2, pb: 3 }}>
        <Typography>
          Are you sure you want to delete this loan for "
          {selectedLoan?.user?.firstName} {selectedLoan?.user?.lastName}"? This
          action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3, px: 3 }}>
        <Button
          onClick={() => setOpenDeleteLoanConfirm(false)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleDeleteLoan(selectedLoan._id)}
          color="error"
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + (loan.loanAmount || 0),
    0
  );
  const pendingPayments = loans.reduce(
    (sum, loan) =>
      sum + (loan.repayments?.filter((r) => !r.isPaid).length || 0),
    0
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar userProfile={userProfile} onLogout={onLogout} />
      </Box>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ px: 4, py: 4 }}>
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 3,
            mb: 4,
            "@media (max-width: 960px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <People sx={{ fontSize: 40, opacity: 0.9 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.85, fontSize: "0.85rem", fontWeight: 500 }}
                >
                  Total Users
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{ lineHeight: 1.2 }}
                >
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <AccountBalance sx={{ fontSize: 40, color: "#d84315" }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#bf360c",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  Active Loans
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  color="#d84315"
                  sx={{ lineHeight: 1.2 }}
                >
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <MonetizationOn sx={{ fontSize: 40, color: "#2e7d32" }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1b5e20",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  Total Loans
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  color="#2e7d32"
                  sx={{ lineHeight: 1.2 }}
                >
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Payment sx={{ fontSize: 40, opacity: 0.9 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.85, fontSize: "0.85rem", fontWeight: 500 }}
                >
                  Pending Payments
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{ lineHeight: 1.2 }}
                >
                  {pendingPayments}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Card
          elevation={0}
          sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" }}
        >
          <CardContent sx={{ p: 4 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab icon={<People />} label="User Management" />
              <Tab icon={<AccountBalance />} label="Loan Management" />
            </Tabs>

            {tabValue === 0 && (
              <>
                {users.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <People
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Users will appear here once they register on the platform
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            User
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Loans
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Account Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow
                            key={user._id}
                            sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                          >
                            <TableCell sx={{ py: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "primary.main",
                                    width: 45,
                                    height: 45,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {(
                                    user.firstName?.charAt(0) ||
                                    user.name?.charAt(0) ||
                                    user.email?.charAt(0)
                                  )?.toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {user.firstName} {user.lastName} {user.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={
                                  user.isActive !== false
                                    ? "Active"
                                    : "Disabled"
                                }
                                color={
                                  user.isActive !== false ? "success" : "error"
                                }
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={user.role ? user.role : "user"}
                                color={
                                  user.role === "admin" ? "info" : "default"
                                }
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" fontWeight="500">
                                {
                                  loans.filter(
                                    (loan) => loan.user?._id === user._id
                                  ).length
                                }{" "}
                                loans
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <CustomToggleSwitch
                                  checked={user.isActive !== false}
                                  onChange={() =>
                                    handleToggleUserStatus(
                                      user._id,
                                      user.isActive !== false
                                    )
                                  }
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {user.isActive !== false
                                    ? "Active"
                                    : "Disabled"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Tooltip title="Assign Loan">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    sx={{
                                      backgroundColor: "primary.main",
                                      color: "white",
                                      "&:hover": {
                                        backgroundColor: "primary.dark",
                                      },
                                      borderRadius: 2,
                                    }}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setOpenAssignLoan(true);
                                    }}
                                  >
                                    <AttachMoney />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete User">
                                  <Button
                                    color="error"
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setOpenDeleteConfirm(true);
                                    }}
                                    sx={{
                                      minWidth: 0,
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 2,
                                      textTransform: "none",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Delete
                                  </Button>
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
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <AccountBalance
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No loans found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loans will appear here once they are assigned to users
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Borrower
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Loan Amount
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Progress
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loans.map((loan) => {
                          const paidRepayments =
                            loan.repayments?.filter((r) => r.isPaid).length ||
                            0;
                          const totalRepayments = loan.repayments?.length || 0;
                          const progress =
                            totalRepayments > 0
                              ? (paidRepayments / totalRepayments) * 100
                              : 0;
                          const isHistoryDisabled = [
                            "pending",
                            "approved",
                            "rejected",
                            "completed",
                          ].includes(loan.status);

                          return (
                            <TableRow
                              key={loan._id}
                              sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                            >
                              <TableCell sx={{ py: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: "secondary.main",
                                      width: 45,
                                      height: 45,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {(
                                      loan.user?.firstName?.charAt(0) || "?"
                                    ).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                    >
                                      {loan.user?.firstName}{" "}
                                      {loan.user?.lastName}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {loan.user?.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  color="primary"
                                >
                                  ₹{loan.loanAmount?.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {loan.termDays} days • ₹{loan.dailyPayment}
                                  /day
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip
                                  label={loan.status}
                                  color={
                                    loan.status === "active"
                                      ? "success"
                                      : loan.status === "completed"
                                      ? "info"
                                      : loan.status === "approved"
                                      ? "success"
                                      : loan.status === "pending"
                                      ? "warning"
                                      : "error"
                                  }
                                  size="medium"
                                  sx={{
                                    fontWeight: 500,
                                    textTransform: "capitalize",
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <CustomProgressBar
                                  value={paidRepayments}
                                  total={totalRepayments}
                                  status={loan.status}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Tooltip
                                    title={
                                      isHistoryDisabled
                                        ? "Payment history not available for this status"
                                        : "Payment History"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        color="info"
                                        disabled={isHistoryDisabled}
                                        size="small"
                                        sx={{
                                          backgroundColor: isHistoryDisabled
                                            ? "grey.300"
                                            : "info.main",
                                          color: "white",
                                          "&:hover": {
                                            backgroundColor: isHistoryDisabled
                                              ? "grey.300"
                                              : "info.dark",
                                          },
                                          borderRadius: 2,
                                        }}
                                        onClick={() => {
                                          setSelectedLoan(loan);
                                          setOpenPaymentHistory(true);
                                        }}
                                      >
                                        <ReceiptLong />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  {loan.status === "active" &&
                                    progress === 100 && (
                                      <Tooltip title="Complete Loan">
                                        <IconButton
                                          color="success"
                                          size="small"
                                          sx={{
                                            backgroundColor: "success.main",
                                            color: "white",
                                            "&:hover": {
                                              backgroundColor: "success.dark",
                                            },
                                            borderRadius: 2,
                                          }}
                                          onClick={() =>
                                            handleUpdateLoanStatus(
                                              loan._id,
                                              "completed"
                                            )
                                          }
                                        >
                                          <TaskAlt />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  <Tooltip title="Update Loan">
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      sx={{
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: "primary.dark",
                                        },
                                        borderRadius: 2,
                                      }}
                                      onClick={() => {
                                        setSelectedLoan(loan);
                                        setOpenUpdateLoan(true);
                                      }}
                                    >
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Loan">
                                    <IconButton
                                      color="error"
                                      size="small"
                                      sx={{
                                        backgroundColor: "error.main",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: "error.dark",
                                        },
                                        borderRadius: 2,
                                      }}
                                      onClick={() => {
                                        setSelectedLoan(loan);
                                        setOpenDeleteLoanConfirm(true);
                                      }}
                                    >
                                      <DeleteIcon />
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
      <UpdateLoanDialog />
      <DeleteConfirmDialog />
      <DeleteLoanConfirmDialog />
    </Box>
  );
};

export default AdminDashboard;
