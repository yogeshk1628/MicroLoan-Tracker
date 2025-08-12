import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  MenuItem,
  Container,
  Typography
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, role: "user" };
      const res = await axios.post("http://localhost:5000/api/auth/signup", payload);
      reset();
      toast.success(res.data.message || "Account created successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating account");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 10, mb: 5, p: 3, boxShadow: 2, borderRadius: 5, backgroundColor: "#fafafa" }}
    >
      {/* Company Name - Click to go Home */}
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

      <Typography variant="h5" align="center" gutterBottom marginBottom={5}>
        Create Account
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="First Name"
            fullWidth
            size="small"
            {...register("firstName", { required: "First name is required" })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            label="Last Name"
            fullWidth
            size="small"
            {...register("lastName", { required: "Last name is required" })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            size="small"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            size="small"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters required" },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Gender"
            fullWidth
            size="small"
            defaultValue=""
            {...register("gender", { required: "Please select your gender" })}
            error={!!errors.gender}
            helperText={errors.gender?.message}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Contact Number"
            type="tel"
            fullWidth
            size="small"
            {...register("contactNumber", { required: "Contact number is required" })}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message}
          />
        </Box>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Create Account
        </Button>
      </form>

      <Typography textAlign="center" mt={4} color="textSecondary">
        Already have an account?{" "}
        <Button onClick={() => navigate("/login")} size="small">
          Login
        </Button>
      </Typography>
    </Container>
  );
};

export default Signup;
