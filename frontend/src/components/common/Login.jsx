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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      const token = res.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        const decodedToken = jwtDecode(token);
        localStorage.setItem("user", JSON.stringify(decodedToken));
        toast.success("Logged in successfully");

        const role = decodedToken.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "user") {
          navigate("/");
        } else {
          toast.error("Unrecognized role");
        }
      } else {
        toast.error("No token received");
      }
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <Container maxWidth="sm" >
      {/* Company Name - Top Left Clickable */}
      <Box sx={{ position: "absolute", top: 20, left: 20, cursor: "pointer" }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          color="primary"
          onClick={() => navigate("/")}
        >
          CompanyName
        </Typography>
      </Box>

      <Paper elevation={6} sx={{ padding: 4, borderRadius: 3, mt: 8 }}>
        <Box textAlign="center" mb={4}>
          <Avatar
            src="https://readdy.ai/api/search-image?query=modern minimalist company logo design with abstract shapes in blue and gray colors on pure white background professional corporate identity&width=120&height=120&seq=1&orientation=squarish"
            sx={{ width: 64, height: 64, margin: "0 auto", mb: 2 }}
          />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome Back
          </Typography>
          <Typography color="textSecondary">Sign in to continue</Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box mb={3}>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              variant="outlined"
              {...register("email", { required: "Email is required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              variant="outlined"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Remember me"
            />
            <Button onClick={() => navigate("/forgot-password")} variant="text" size="small">
              Forgot Password?
            </Button>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ bgcolor: "primary.main", color: "white", py: 1.5, fontWeight: "bold" }}
          >
            Sign in
          </Button>
        </form>

        <Typography textAlign="center" mt={4} color="textSecondary">
          Don't have an account?{" "}
          <Button onClick={() => navigate("/signup")} size="small">
            Sign up
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
