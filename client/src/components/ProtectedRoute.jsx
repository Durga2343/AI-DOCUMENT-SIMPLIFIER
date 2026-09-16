import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg bg-[#100E14] flex flex-col items-center justify-center">
        {/* Animated spinner */}
        <div className="w-12 h-12 border-4 border-[#2A2433] border-t-[#8B5CF6] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#A9A1AE] font-medium animate-pulse text-sm">Verifying authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
