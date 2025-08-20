import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const otp = query.get("otp");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5000";

  const handleResetPassword = async () => {
    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/dummy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      if (!res.ok) throw new Error("Failed to reset password");

      alert("Password Reset Successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Paper className="w-full max-w-sm p-6 rounded-2xl shadow-md">
        <Typography variant="h5" className="font-bold mb-4 text-center">
          Reset Password
        </Typography>

        <Typography variant="body2" className="mb-2 text-center text-gray-600">
          Resetting password for <strong>{email}</strong>
        </Typography>

        <TextField
          type="password"
          label="New Password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Confirm Password"
          fullWidth
          margin="normal"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.5 }}
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
