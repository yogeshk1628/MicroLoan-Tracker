import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Avatar,
  MenuItem,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { showSuccessToast, showErrorToast, showWarningToast } from "../../utils/toastUtils";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Watch all form fields for validation
  const watchedFields = watch();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const payload = { ...data, role: "user" };
      const res = await axios.post("http://localhost:5000/api/auth/signup", payload);
      
      reset();
      showSuccessToast("🎉 Account created successfully! Welcome aboard!");
      
      // Delay navigation to show the toast
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create account. Please try again.";
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced validation with custom messages
  const handleFormErrors = (errors) => {
    if (errors.firstName) {
      showWarningToast("Please enter your first name");
    } else if (errors.lastName) {
      showWarningToast("Please enter your last name");
    } else if (errors.email) {
      if (errors.email.type === 'required') {
        showWarningToast("Email address is required");
      } else if (errors.email.type === 'pattern') {
        showWarningToast("Please enter a valid email address");
      }
    } else if (errors.password) {
      if (errors.password.type === 'required') {
        showWarningToast("Password is required");
      } else if (errors.password.type === 'minLength') {
        showWarningToast("Password must be at least 8 characters long");
      }
    } else if (errors.gender) {
      showWarningToast("Please select your gender");
    } else if (errors.contactNumber) {
      showWarningToast("Contact number is required");
    }
  };

  const onError = (errors) => {
    handleFormErrors(errors);
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
          variant={isMobile ? "subtitle1" : "h6"}
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
        maxWidth={isMobile ? false : "sm"}
        sx={{
          px: isMobile ? 2 : 0,
          width: isMobile ? "90vw" : "auto",
          boxSizing: "content-box",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            maxWidth: "100%",
            maxHeight: isMobile ? { xs: "70vh", sm: "auto" } : { xs: "88vh", sm: "auto" },
            overflow: { xs: "auto", sm: "visible" },
            margin: "0 auto",
          }}
        >
          <Box textAlign="center" mb={2}>
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
              Create Account
            </Typography>
            <Typography 
              color="textSecondary" 
              sx={{ 
                color: "#666",
                fontSize: "1.1rem",
              }}
            >
              Join our micro loan platform today
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            {/* First Name and Last Name Row */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                fullWidth
                variant="outlined"
                {...register("firstName", { required: "First name is required" })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
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
              <TextField
                label="Last Name"
                fullWidth
                variant="outlined"
                {...register("lastName", { required: "Last name is required" })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
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

            {/* Email */}
            <Box mb={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
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

            {/* Password */}
            <Box mb={2}>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters required" },
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
                        sx={{ color: "#667eea" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Gender */}
            <Box mb={2}>
              <TextField
                select
                label="Gender"
                fullWidth
                variant="outlined"
                defaultValue=""
                {...register("gender", { required: "Please select your gender" })}
                error={!!errors.gender}
                helperText={errors.gender?.message}
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
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Box>

            {/* Contact Number */}
            <Box mb={2}>
              <TextField
                label="Contact Number"
                type="tel"
                fullWidth
                variant="outlined"
                {...register("contactNumber", { 
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit contact number"
                  }
                })}
                error={!!errors.contactNumber}
                helperText={errors.contactNumber?.message}
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ 
                background: isLoading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", 
                py: 1.5, 
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                position: "relative",
                "&:hover": {
                  background: isLoading ? "#ccc" : "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  transform: isLoading ? "none" : "translateY(-1px)",
                },
                transition: "all 0.3s ease",
                "&:disabled": {
                  color: "white",
                }
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Creating Account...
                </Box>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Typography 
            textAlign="center" 
            mt={2} 
            sx={{ 
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            Already have an account?{" "}
            <Button 
              onClick={() => navigate("/login")} 
              size="small" 
              sx={{ 
                color: "#667eea",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                }
              }}
            >
              Login
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
