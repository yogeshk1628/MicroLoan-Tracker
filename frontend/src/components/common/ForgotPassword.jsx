import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // countdown timer for resend OTP

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
      alert("OTP sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error("Invalid OTP");

      alert("OTP Verified. Redirecting to Reset Password...");
      window.location.href = `/reset-password?email=${email}&otp=${otp}`;
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
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
      alert("New OTP sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error resending OTP");
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
    <Box className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Paper className="w-full max-w-sm p-6 rounded-2xl shadow-md">
        <Typography variant="h5" className="font-bold mb-4 text-center">
          Forgot Password
        </Typography>

        {/* Email */}
        <TextField
          label="Email Address"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent}
        />

        {/* OTP Field */}
        {otpSent && (
          <>
            <TextField
              label="Enter OTP"
              fullWidth
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            {/* Countdown + Resend Button */}
            <Box className="flex justify-between items-center mt-2">
              {timer > 0 ? (
                <Typography variant="body2" color="textSecondary">
                  OTP expires in {formatTime(timer)}
                </Typography>
              ) : (
                <Button
                  onClick={handleResendOtp}
                  variant="outlined"
                  disabled={loading}
                >
                  Resend OTP
                </Button>
              )}
            </Box>
          </>
        )}

        {/* Main Action Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.5 }}
          onClick={otpSent ? handleVerifyOtp : handleSendOtp}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : otpSent
            ? "Verify OTP"
            : "Send OTP"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
