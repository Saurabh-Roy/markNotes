import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import ProtectedRoutes from './components/ProtectedRoutes';
import Login from './pages/LoginPage';
import RegisterPage from './pages/RegistrationPage';
import VerifiedEmail from './pages/VerifiedEmailPage';
import { ToastContainer } from "react-toastify";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifiedNewEmail from './pages/VerifyNewEmailPage';


function App() {
  return (
    <>
    <ToastContainer
      position='top-center'
      autoClose={3000}
    />
    <Router>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<RegisterPage/>} />
        <Route path='/email-verified' element={<VerifiedEmail/>} />
        <Route path='/verify-new' element={<VerifiedNewEmail/>} />
        <Route path='/forgot-password' element={<ForgotPasswordPage/>} />
        <Route path='/reset-password' element={<ResetPasswordPage/>} />
        <Route path='/home' element={<ProtectedRoutes page='home' />} />
        <Route path="/edit-note/:id" element={<ProtectedRoutes page='edit-note' />} />
        <Route path='/profile' element={<ProtectedRoutes page='profile' />} />
      </Routes>
    </Router>
    </>
  );
}

export default App
