import { useState } from 'react'
import HomePage from './components/common/HomePage'
import Signup from "./components/common/Signup";
import Login from "./components/common/Login";
import UserDashboard from './components/user/UserDashboard';
import { Route, Routes } from 'react-router-dom'
import AdminDashboard from './components/admin/AdminDashboard';
import CustomToastContainer from './components/common/ToastContainer';
import Profile from './components/admin/AdminProfile';
import UserProfile from './components/user/userProfile';
import ForgotPassword from './components/common/ForgotPassword';
import ResetPassword from './components/common/ResetPassword';
//import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Routes>  
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/profile/" element={<Profile/>} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/forgot-password" element ={<ForgotPassword />} />
          <Route path="/reset-password/" element={<ResetPassword />} />
        </Routes>


        <CustomToastContainer />
    </>
  )
}

export default App
