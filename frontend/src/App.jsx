import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Settings from './pages/Settings';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/userAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';


const ProtectedRoute = ({ children }) => {
    const { authUser } = useAuthStore();
    console.log("in protected", authUser)
    return authUser ? children : <Navigate to="/login" />;
};

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const {theme} = useThemeStore()

    const enableSmoothScroll = () => {
        if ("scrollBehavior" in document.documentElement.style === false) {
          document.documentElement.style.scrollBehavior = "smooth";
        }
      };
      
      useEffect(() => {
        enableSmoothScroll();
      }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div data-theme={theme}>
            <Navbar />
            <Routes>
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/signup" element={ !authUser ? <SignUpPage /> : <Navigate to='/home' />} />
                <Route path="/login" element={ !authUser ? <LoginPage /> : <Navigate to='/home' />} />
                <Route path="*" element={<Navigate to={authUser ? "/home" : "/login"} />} />
            </Routes>

            <Toaster/>
        </div>
    );
};

export default App;
