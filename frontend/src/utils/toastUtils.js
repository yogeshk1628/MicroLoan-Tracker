import { toast } from 'react-toastify';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import React from 'react';

// Base toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    fontSize: "14px",
    fontWeight: "500",
    minHeight: "60px",
  }
};

// Custom success toast
export const showSuccessToast = (message) => {
  toast.success(
    React.createElement(Box, 
      { sx: { display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 } },
      React.createElement(Typography, 
        { variant: "body2", sx: { fontWeight: 600, color: '#1B5E20', lineHeight: 1.4 } },
        message
      )
    ),
    {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
        border: '2px solid #4CAF50',
        color: '#1B5E20',
      }
    }
  );
};

// Custom error toast
export const showErrorToast = (message) => {
  toast.error(
    React.createElement(Box, 
      { sx: { display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 } },
      React.createElement(Typography, 
        { variant: "body2", sx: { fontWeight: 600, color: '#B71C1C', lineHeight: 1.4 } },
        message
      )
    ),
    {
      ...toastConfig,
      autoClose: 5000,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
        border: '2px solid #F44336',
        color: '#B71C1C',
      }
    }
  );
};

// Custom warning toast
export const showWarningToast = (message) => {
  toast.warning(
    React.createElement(Box, 
      { sx: { display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 } },
      React.createElement(Typography, 
        { variant: "body2", sx: { fontWeight: 600, color: '#E65100', lineHeight: 1.4 } },
        message
      )
    ),
    {
      ...toastConfig,
      autoClose: 4500,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        border: '2px solid #FF9800',
        color: '#E65100',
      }
    }
  );
};

// Custom info toast
export const showInfoToast = (message) => {
  toast.info(
    React.createElement(Box, 
      { sx: { display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 } },
      React.createElement(Typography, 
        { variant: "body2", sx: { fontWeight: 600, color: '#0D47A1', lineHeight: 1.4 } },
        message
      )
    ),
    {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
        border: '2px solid #2196F3',
        color: '#0D47A1',
      }
    }
  );
};
