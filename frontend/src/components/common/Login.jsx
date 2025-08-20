import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Visibility, VisibilityOff, Block } from "@mui/icons-material";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Enhanced email validation
  const validateEmail = (email) => {
    if (!email) {
      return "Email address is required";
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return true;
  };

  // Enhanced password validation
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return true;
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      const token = res.data?.token;

      if (token) {
        const decodedToken = jwtDecode(token);

       if (!decodedToken.isActive) {
        setAccountDisabled(true);
        toast.error("Your account has been disabled by the administrator");
        return;
      }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(decodedToken));
        toast.success("Logged in successfully! Welcome back!");

        const role = decodedToken.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "user") {
          navigate("/dashboard");
        } else {
          toast.error("Unrecognized user role");
        }
      } else {
        toast.error("Authentication failed - no token received");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error responses
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message?.toLowerCase();
        
        if (errorMessage?.includes("email") || errorMessage?.includes("user not found") || errorMessage?.includes("not found")) {
          toast.error("Email address not found. Please check your email or create a new account.");
        } else if (errorMessage?.includes("password") || errorMessage?.includes("invalid credentials") || errorMessage?.includes("incorrect")) {
          toast.error("Incorrect password. Please check your password and try again.");
        } else if (errorMessage?.includes("disabled") || errorMessage?.includes("inactive")) {
          setAccountDisabled(true);
          toast.error("Your account has been disabled by the administrator");
        } else {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage?.includes("email")) {
          toast.error("Please enter a valid email address");
        } else if (errorMessage?.includes("password")) {
          toast.error("Please enter a valid password");
        } else {
          toast.error("Please check your login details and try again");
        }
      } else if (error.response?.status === 403) {
        setAccountDisabled(true);
        toast.error("Your account has been disabled by the administrator");
      } else if (error.response?.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error occurred. Please try again later.");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        // Generic fallback for any other errors
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  // Handle form validation errors with specific toast messages
  const onError = (errors) => {
    if (errors.email) {
      toast.error(errors.email.message);
    } else if (errors.password) {
      toast.error(errors.password.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        padding: 0,
        margin: 0,
      }}
    >
      {/* Company Name - Top Left Clickable */}
      <Box sx={{ position: "absolute", top: 20, left: 20, cursor: "pointer", zIndex: 1000 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          color="white"
          onClick={() => navigate("/")}
          sx={{ 
            userSelect: "none",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            }
          }}
        >
          CompanyName
        </Typography>
      </Box>

      <Container 
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          px: isMobile ? 3 : 2,
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            padding: isMobile ? 2 : 6, 
            borderRadius: 3,
            width: "100%",
            maxWidth: isMobile ? "380px" : "450px",
            maxHeight: isMobile ? { xs: "75vh", sm: "auto" } : { xs: "75vh", sm: "auto" },
            overflow: { xs: "auto", sm: "visible" },
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            margin: "0 auto",
          }}
        >
          {/* Account Disabled Alert */}
          {accountDisabled && (
            <Box mb={3}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: "1.5rem"
                  }
                }}
                icon={<Block />}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>Account Disabled</AlertTitle>
                Your account has been disabled by the administrator. Please contact support to reactivate your account.
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // You can add contact support functionality here
                      toast.info("Please contact support at support@company.com");
                    }}
                    sx={{
                      borderColor: "#f44336",
                      color: "#f44336",
                      "&:hover": {
                        borderColor: "#d32f2f",
                        backgroundColor: "rgba(244, 67, 54, 0.04)"
                      }
                    }}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setAccountDisabled(false)}
                    sx={{ 
                      ml: 1,
                      color: "#666",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)"
                      }
                    }}
                  >
                    Try Again
                  </Button>
                </Box>
              </Alert>
            </Box>
          )}

          <Box textAlign="center" mb={4}>
            <Avatar
              src="https://readdy.ai/api/search-image?query=modern minimalist company logo design with abstract shapes in blue and gray colors on pure white background professional corporate identity&width=120&height=120&seq=1&orientation=squarish"
              sx={{ 
                width: 64, 
                height: 64, 
                margin: "0 auto", 
                mb: 2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
              }}
            />
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                color: "#667eea",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              color="textSecondary" 
              sx={{ 
                color: "#666",
                fontSize: "1.1rem",
              }}
            >
              Sign in to access your micro loan account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            <Box mb={3}>
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                variant="outlined"
                disabled={accountDisabled}
                {...register("email", {
                  validate: validateEmail
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                      borderWidth: 2,
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#667eea",
                  }
                }}
              />
            </Box>

            <Box mb={3}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                variant="outlined"
                disabled={accountDisabled}
                {...register("password", {
                  validate: validatePassword
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                      borderWidth: 2,
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#667eea",
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)} 
                        edge="end"
                        disabled={accountDisabled}
                        sx={{ color: "#667eea" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <FormControlLabel
                control={
                  <Checkbox 
                    disabled={accountDisabled}
                    sx={{
                      color: "#667eea",
                      "&.Mui-checked": {
                        color: "#667eea",
                      }
                    }}
                  />
                }
                label="Remember me"
              />
              <Button 
                onClick={() => navigate("/forgot-password")} 
                variant="text" 
                size="small"
                disabled={accountDisabled}
                sx={{ 
                  color: "#667eea",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.05)",
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={accountDisabled}
              sx={{ 
                background: accountDisabled 
                  ? "rgba(0, 0, 0, 0.12)" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: accountDisabled ? "rgba(0, 0, 0, 0.26)" : "white", 
                py: 1.5, 
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: accountDisabled 
                  ? "none" 
                  : "0 4px 15px rgba(102, 126, 234, 0.4)",
                "&:hover": accountDisabled ? {} : {
                  background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {accountDisabled ? "Account Disabled" : "Sign In to Your Account"}
            </Button>
          </form>

          <Typography 
            textAlign="center" 
            mt={4} 
            sx={{ 
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            Don&apos;t have an account?{" "}
            <Button 
              onClick={() => navigate("/signup")} 
              size="small"
              disabled={accountDisabled}
              sx={{ 
                color: "#667eea",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                }
              }}
            >
              Create Account
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
