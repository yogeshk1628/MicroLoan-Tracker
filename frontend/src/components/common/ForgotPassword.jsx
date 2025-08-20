import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Avatar,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // countdown timer for resend OTP

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const API_BASE_URL = "http://localhost:5000";

  // countdown effect
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send OTP");

      setOtpSent(true);
      setTimer(300); // 5 minutes countdown
      toast.success("OTP sent successfully to your email!");
    } catch (err) {
      console.error(err);
      toast.error("Error sending OTP. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP!");
      return;
    }

    if (otp.length < 4) {
      toast.error("Please enter a valid OTP!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error("Invalid OTP");

      toast.success("OTP Verified! Redirecting to reset password...");
      setTimeout(() => {
        window.location.href = `/reset-password?email=${email}&otp=${otp}`;
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Invalid OTP. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend OTP");

      setTimer(300); // reset countdown
      toast.success("New OTP sent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error resending OTP. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // format countdown as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        height: "100vh", // Fixed height instead of minHeight
        width: "100vw", // Fixed width
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: {
          xs: 1,
          sm: 2,
          md: 0, // No padding on desktop
        },
        overflow: "hidden", // Prevent any scrolling
        position: "fixed", // Fix position to prevent scrolling
        top: 0,
        left: 0,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%", // Full height
          px: {
            xs: 1,
            sm: 2,
            md: 0, // No horizontal padding on desktop
          },
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={12}
            sx={{
              padding: {
                xs: 2,
                sm: 3,
                md: 4,
              },
              borderRadius: {
                xs: 2,
                sm: 3,
              },
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: {
                xs: "0 4px 20px rgba(0, 0, 0, 0.1)",
                sm: "0 8px 32px rgba(0, 0, 0, 0.1)",
              },
              width: "100%",
              maxWidth: {
                xs: "100%",
                sm: 450,
              },
              mx: "auto",
              maxHeight: {
                xs: "90vh", // Limit height on mobile
                sm: "85vh", // Limit height on tablet
                md: "auto", // Auto height on desktop
              },
              overflow: {
                xs: "auto", // Allow scrolling only on mobile if needed
                md: "visible", // No scrolling on desktop
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  mb: {
                    xs: 1,
                    sm: 1.5,
                    md: 2,
                  },
                  bgcolor: "primary.main",
                  width: {
                    xs: 48,
                    sm: 52,
                    md: 56,
                  },
                  height: {
                    xs: 48,
                    sm: 52,
                    md: 56,
                  },
                }}
              >
                <LockOutlinedIcon
                  sx={{
                    fontSize: {
                      xs: 24,
                      sm: 26,
                      md: 28,
                    },
                  }}
                />
              </Avatar>

              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h1"
                fontWeight="bold"
                color="primary"
                gutterBottom
                sx={{
                  fontSize: {
                    xs: "1.4rem",
                    sm: "1.8rem",
                    md: "2rem",
                  },
                  mb: 1,
                }}
              >
                Forgot Password?
              </Typography>

              <Typography
                variant={isMobile ? "body2" : "body1"}
                color="textSecondary"
                textAlign="center"
                sx={{
                  mb: {
                    xs: 1.5,
                    sm: 2,
                    md: 2,
                  },
                  fontSize: {
                    xs: "0.875rem",
                    sm: "0.95rem",
                    md: "1rem",
                  },
                  lineHeight: 1.5,
                  px: {
                    xs: 1,
                    sm: 0,
                  },
                }}
              >
                {!otpSent
                  ? "Enter your email address and we'll send you an OTP to reset your password"
                  : "Enter the OTP sent to your email address"}
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" noValidate>
              {/* Email Field */}
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "0.95rem",
                      md: "1rem",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: {
                      xs: "0.875rem",
                      sm: "0.95rem",
                      md: "1rem",
                    },
                  },
                  mb: {
                    xs: 0.5,
                    md: 1,
                  },
                }}
              />

              {/* OTP Field */}
              {otpSent && (
                <Fade in={otpSent} timeout={500}>
                  <Box>
                    <TextField
                      label="Enter OTP"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          fontSize: {
                            xs: "0.875rem",
                            sm: "0.95rem",
                            md: "1rem",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: {
                            xs: "0.875rem",
                            sm: "0.95rem",
                            md: "1rem",
                          },
                        },
                        mb: {
                          xs: 0.5,
                          md: 1,
                        },
                      }}
                    />

                    {/* Countdown + Resend Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: {
                          xs: 1,
                          sm: 1.5,
                          md: 2,
                        },
                        mb: {
                          xs: 0.5,
                          md: 1,
                        },
                        flexDirection: {
                          xs: timer > 0 ? "column" : "row",
                          sm: "row",
                        },
                        gap: {
                          xs: timer > 0 ? 1 : 0,
                          sm: 0,
                        },
                      }}
                    >
                      {timer > 0 ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            fontWeight: "medium",
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.875rem",
                            },
                            textAlign: {
                              xs: "center",
                              sm: "left",
                            },
                          }}
                        >
                          OTP expires in {formatTime(timer)}
                        </Typography>
                      ) : (
                        <Button
                          onClick={handleResendOtp}
                          variant="text"
                          color="secondary"
                          disabled={loading}
                          sx={{
                            textTransform: "none",
                            fontSize: {
                              xs: "0.875rem",
                              sm: "0.9rem",
                              md: "1rem",
                            },
                            p: {
                              xs: 0.8,
                              sm: 1,
                              md: 1.5,
                            },
                          }}
                        >
                          Resend OTP
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Fade>
              )}

              {/* Main Action Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading}
                sx={{
                  mt: {
                    xs: 1.5,
                    sm: 2,
                    md: 2.5,
                  },
                  mb: {
                    xs: 1.5,
                    sm: 2,
                  },
                  py: {
                    xs: 1.2,
                    sm: 1.3,
                    md: 1.5,
                  },
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: {
                    xs: "1rem",
                    sm: "1.05rem",
                    md: "1.1rem",
                  },
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  boxShadow: "0 3px 15px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(45deg, #a0a0a0 30%, #b0b0b0 90%)",
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress
                      size={isMobile ? 18 : 20}
                      color="inherit"
                    />
                    Please wait...
                  </Box>
                ) : otpSent ? (
                  "Verify OTP"
                ) : (
                  "Send OTP"
                )}
              </Button>

              {/* Back to Login Link */}
              <Box textAlign="center">
                <Button
                  variant="text"
                  color="primary"
                  sx={{
                    textTransform: "none",
                    fontSize: {
                      xs: "0.875rem",
                      sm: "0.9rem",
                      md: "1rem",
                    },
                    p: {
                      xs: 0.8,
                      sm: 1,
                      md: 1.5,
                    },
                  }}
                  onClick={() => (window.location.href = "/login")}
                >
                  ← Back to Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
