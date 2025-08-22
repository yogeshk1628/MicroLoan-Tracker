import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  useMediaQuery,
  Avatar,
  InputLabel,
  FormControl,
  Select,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Navbar from './UserNavbar';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 24,
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
  color: '#333',
  position: 'relative',
  overflow: 'visible',
  border: '1px solid rgba(102, 126, 234, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: '#000000ff',
    fontWeight: 600,
    fontSize: '0.9rem',
    '&.Mui-focused': {
      color: '#000000ff',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    color: '#333',
    fontWeight: 500,
    fontSize: '1rem',
    minHeight: '56px',
    '& fieldset': {
      border: '2px solid #e1e5f7',
      borderRadius: 16,
    },
    '&:hover fieldset': {
      borderColor: '#000000ff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000000ff',
      borderWidth: '2px',
    },
  },
  '& input': {
    color: '#333 !important',
    WebkitTextFillColor: '#333 !important',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: '#000000ff',
    fontWeight: 600,
    fontSize: '0.9rem',
    '&.Mui-focused': {
      color: '#000000ff',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    color: '#333',
    fontWeight: 500,
    fontSize: '1rem',
    minHeight: '56px',
    '& fieldset': {
      border: '2px solid #e1e5f7',
      borderRadius: 16,
    },
    '&:hover fieldset': {
      borderColor: '#000000ff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000000ff',
      borderWidth: '2px',
    },
  },
  '& .MuiSelect-icon': {
    color: '#000000ff',
    fontSize: '1.8rem',
  },
}));

const DisplayField = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  backgroundColor: '#f8f9ff',
  border: '2px solid #f0f2ff',
  minHeight: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#333',
  fontSize: '1rem',
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const PasswordDisplayField = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  backgroundColor: '#f8f9ff',
  border: '2px solid #f0f2ff',
  minHeight: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#333',
  fontSize: '1rem',
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  fontFamily: 'monospace',
  letterSpacing: '2px',
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  color: '#666',
  marginBottom: theme.spacing(1),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    minWidth: 600,
    maxWidth: 700,
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
      maxWidth: 'calc(100vw - 32px)',
      minWidth: 'calc(100vw - 32px)',
    },
  },
}));

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const FormColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

export default function UserProfile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [userObj, setUserObj] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    contactNumber: '',
    id: '',
  });

  const [editingUser, setEditingUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    contactNumber: '',
    id: '',
  });

  const [originalUser, setOriginalUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    contactNumber: '',
    id: '',
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const maskPassword = () => {
    return '••••••••';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    if (!/(?=.*[^a-zA-Z\d])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  useEffect(() => {
    if (!userObj) {
      navigate('/login');
      return;
    }
    const normalizeGender = (genderValue) => {
      if (!genderValue) return '';
      const genderStr = genderValue.toString().toLowerCase();
      if (genderStr === 'male' || genderStr === 'm') return 'Male';
      if (genderStr === 'female' || genderStr === 'f') return 'Female';
      if (genderStr === 'other') return 'Other';
      if (genderStr.includes('prefer not') || genderStr.includes('not specified')) return 'Prefer not to say';
      const validOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
      if (validOptions.includes(genderValue)) return genderValue;
      return genderValue;
    };
    const getLastName = (userObj) => {
      if (userObj.lastName || userObj.last_name) {
        return userObj.lastName || userObj.last_name;
      }
      if (userObj.name) {
        const nameParts = userObj.name.split(' ');
        if (nameParts.length > 1) {
          return nameParts.slice(1).join(' ');
        }
      }
      return '';
    };
    const userData = {
      firstName: String(userObj.firstName || userObj.first_name || userObj.name?.split(' ')[0] || ''),
      lastName: String(getLastName(userObj)),
      email: String(userObj.email || userObj.emailAddress || ''),
      gender: String(normalizeGender(userObj.gender || userObj.Gender || '')),
      contactNumber: String(userObj.contactNumber || userObj.mobile || userObj.phone || userObj.phoneNumber || userObj.contact || ''),
      id: String(userObj.id || userObj._id || userObj.userId || ''),
    };
    setUser(userData);
    setOriginalUser({ ...userData });
    setEditingUser({ ...userData, password: '' });
    setLoading(false);
  }, [userObj, navigate]);

  const handleEditDialogChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleEditClick = () => {
    setEditingUser({ ...user, password: '' });
    setIsEditDialogOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleDialogClose = () => {
    setEditingUser({ ...user, password: '' });
    setIsEditDialogOpen(false);
    setError(null);
    setSuccess(false);
    setShowEditPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleEditPasswordVisibility = () => {
    setShowEditPassword(!showEditPassword);
  };

  const handleSaveClick = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    if (!editingUser.firstName.trim() || !editingUser.lastName.trim()) {
      setError('First name and last name are required');
      setSaving(false);
      return;
    }
    if (!editingUser.email.trim()) {
      setError('Email is required');
      setSaving(false);
      return;
    }
    if (!validateEmail(editingUser.email)) {
      setError('Please enter a valid email address');
      setSaving(false);
      return;
    }
    if (editingUser.password && editingUser.password.trim()) {
      const passwordError = validatePassword(editingUser.password);
      if (passwordError) {
        setError(passwordError);
        setSaving(false);
        return;
      }
    }
    if (editingUser.contactNumber && !/^\d{10,15}$/.test(editingUser.contactNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid mobile number (10-15 digits)');
      setSaving(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        setSaving(false);
        return;
      }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const payload = {
        firstName: editingUser.firstName.trim(),
        lastName: editingUser.lastName.trim(),
        email: editingUser.email.trim(),
        gender: editingUser.gender,
        contactNumber: editingUser.contactNumber.trim(),
      };
      if (editingUser.password && editingUser.password.trim()) {
        payload.password = editingUser.password.trim();
      }
      const response = await axios.put(
        `http://localhost:5000/api/auth/updateuserprofile/${editingUser.id}`,
        payload,
        config
      );
      const updatedUserData = {
        ...userObj,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        gender: payload.gender,
        contactNumber: payload.contactNumber,
        ...(response.data.data || response.data.user || response.data)
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUserObj(updatedUserData);
      const newUserData = {
        ...editingUser,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        gender: payload.gender,
        contactNumber: payload.contactNumber,
      };
      setUser(newUserData);
      setOriginalUser({ ...newUserData });
      setEditingUser({ ...newUserData, password: '' });
      setIsEditDialogOpen(false);
      setShowEditPassword(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  if (loading) {
    return (
      <>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Navbar userProfile={userObj} onLogout={handleLogout} />
        </Box>
        <Container maxWidth="sm" sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={50} thickness={4} sx={{ color: '#667eea' }} />
        </Container>
      </>
    );
  }

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar userProfile={userObj} onLogout={handleLogout} />
      </Box>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
        py: { xs: 2, md: 4 }
      }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <StyledCard sx={{ maxWidth: '900px', margin: '0 auto' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 5,
                textAlign: 'center'
              }}>
                <Avatar
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '4px solid #ffffff',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 36, md: 48 }, color: '#fff' }} />
                </Avatar>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    letterSpacing: 0.5,
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  My Profile
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#666',
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.2rem' }
                  }}
                >
                  Your personal information
                </Typography>
              </Box>
              <Divider sx={{
                mb: 5,
                borderColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 1,
              }} />
              {success && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    fontSize: '1rem',
                    '& .MuiAlert-message': { fontWeight: 500 }
                  }}
                >
                  Profile updated successfully!
                </Alert>
              )}
              <Stack spacing={1}>
                <FormRow>
                  <FormColumn>
                    <FieldLabel>First Name</FieldLabel>
                    <DisplayField>
                      {user.firstName || 'Not provided'}
                    </DisplayField>
                  </FormColumn>
                  <FormColumn>
                    <FieldLabel>Last Name</FieldLabel>
                    <DisplayField>
                      {user.lastName || 'Not provided'}
                    </DisplayField>
                  </FormColumn>
                </FormRow>
                <FormRow>
                  <FormColumn>
                    <FieldLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: '1rem', color: '#667eea' }} />
                        Email Address
                      </Box>
                    </FieldLabel>
                    <DisplayField>
                      {user.email || 'Not provided'}
                    </DisplayField>
                  </FormColumn>
                  <FormColumn>
                    <FieldLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon sx={{ fontSize: '1rem', color: '#667eea' }} />
                        Password
                      </Box>
                    </FieldLabel>
                    <PasswordDisplayField>
                      <span style={{ flex: 1 }}>
                        {showPassword ? 'Password is securely stored' : maskPassword()}
                      </span>
                      <IconButton
                        onClick={togglePasswordVisibility}
                        size="small"
                        sx={{
                          color: '#667eea',
                          '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                        }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </PasswordDisplayField>
                  </FormColumn>
                </FormRow>
                <FormRow>
                  <FormColumn>
                    <FieldLabel>Gender</FieldLabel>
                    <DisplayField>
                      {user.gender || 'Not specified'}
                    </DisplayField>
                  </FormColumn>
                  <FormColumn>
                    <FieldLabel>Mobile Number</FieldLabel>
                    <DisplayField>
                      {user.contactNumber || 'Not provided'}
                    </DisplayField>
                  </FormColumn>
                </FormRow>
              </Stack>
              <Box sx={{
                display: 'flex',
                mt: 6,
                justifyContent: 'center',
              }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  size="large"
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    height: 56,
                    fontWeight: 700,
                    borderRadius: 28,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 48px rgba(102, 126, 234, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Container>
      </Box>
      <StyledDialog
        open={isEditDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.9rem',
            color: '#333',
            pb: 3,
            position: 'relative'
          }}
        >
          Edit Profile
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#666',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                fontSize: '1rem',
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
            >
              {error}
            </Alert>
          )}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 3,
              fontSize: '0.9rem',
              '& .MuiAlert-message': { fontWeight: 400 }
            }}
          >
            Leave password field empty if you don't want to change your password.
          </Alert>
          <Stack spacing={3}>
            <FormRow>
              <FormColumn>
                <StyledTextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editingUser.firstName}
                  onChange={handleEditDialogChange}
                  variant="outlined"
                  required
                />
              </FormColumn>
              <FormColumn>
                <StyledTextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editingUser.lastName}
                  onChange={handleEditDialogChange}
                  variant="outlined"
                  required
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={editingUser.email}
                  onChange={handleEditDialogChange}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#667eea', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn>
                <StyledTextField
                  fullWidth
                  label="New Password (Optional)"
                  name="password"
                  type={showEditPassword ? 'text' : 'password'}
                  value={editingUser.password}
                  onChange={handleEditDialogChange}
                  variant="outlined"
                  placeholder="Leave empty to keep current password"
                  helperText="Password must be at least 8 characters with uppercase, lowercase, number, and any special character"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#667eea', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleEditPasswordVisibility}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          {showEditPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn>
                <StyledFormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={editingUser.gender}
                    onChange={handleEditDialogChange}
                    variant="outlined"
                    label="Gender"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 3,
                          mt: 1,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          '& .MuiMenuItem-root': {
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            fontWeight: 500,
                            fontSize: '1rem',
                            padding: '12px 16px',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(102, 126, 234, 0.15)',
                              color: '#667eea',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: '#999', fontStyle: 'normal' }}>Select Gender</em>
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </StyledFormControl>
              </FormColumn>
              <FormColumn>
                <StyledTextField
                  fullWidth
                  label="Mobile Number"
                  name="contactNumber"
                  value={editingUser.contactNumber}
                  onChange={handleEditDialogChange}
                  variant="outlined"
                  placeholder="Enter mobile number"
                  type="tel"
                />
              </FormColumn>
            </FormRow>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleDialogClose}
            size="large"
            disabled={saving}
            sx={{
              minWidth: 120,
              height: 48,
              fontWeight: 600,
              borderRadius: 24,
              fontSize: '1rem',
              color: '#666',
              borderColor: '#ddd',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#999',
                background: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveClick}
            size="large"
            disabled={saving}
            sx={{
              minWidth: 150,
              height: 48,
              fontWeight: 700,
              borderRadius: 24,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: '#fff',
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 48px rgba(76, 175, 80, 0.5)',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </StyledDialog>
    </>
  );
}
