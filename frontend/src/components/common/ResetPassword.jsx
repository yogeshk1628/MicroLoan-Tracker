import React, { useState } from "react";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  LockReset,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const otp = query.get("otp");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const API_BASE_URL = "http://localhost:5000";

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleResetPassword = async () => {
    if (!password) {
      toast.error("Please enter a new password!");
      return;
    }

    if (!confirm) {
      toast.error("Please confirm your password!");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/dummy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      if (!res.ok) throw new Error("Failed to reset password");

      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: {
          xs: 1,
          sm: 2,
          md: 0,
        },
        overflow: "hidden",
        position: "fixed",
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
          height: "100%",
          px: {
            xs: 1,
            sm: 2,
            md: 0,
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
                xs: "90vh",
                sm: "85vh",
                md: "auto",
              },
              overflow: {
                xs: "auto",
                md: "visible",
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
                  bgcolor: "secondary.main",
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
                <LockReset
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
                Reset Password
              </Typography>

              <Typography
                variant={isMobile ? "body2" : "body1"}
                color="textSecondary"
                textAlign="center"
                sx={{
                  mb: {
                    xs: 1,
                    sm: 1.5,
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
                Create a new password for{" "}
                <Typography
                  component="span"
                  fontWeight="bold"
                  color="primary"
                >
                  {email}
                </Typography>
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" noValidate>
              {/* New Password Field */}
              <TextField
                type={showPassword ? "text" : "password"}
                label="New Password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

              {/* Confirm Password Field */}
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

              {/* Password Requirements */}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  display: "block",
                  mt: 1,
                  mb: {
                    xs: 1.5,
                    md: 2,
                  },
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.8rem",
                  },
                  lineHeight: 1.4,
                }}
              >
                Password must contain: 8+ characters, uppercase, lowercase, number, and special character
              </Typography>

              {/* Reset Password Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleResetPassword}
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
                    Resetting Password...
                  </Box>
                ) : (
                  "Reset Password"
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
                  onClick={() => navigate("/login")}
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

export default ResetPassword;
