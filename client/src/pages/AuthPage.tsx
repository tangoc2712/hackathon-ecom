import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import Footer from '../components/common/MenuFooter';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white pb-24">
      <div className="flex w-full max-w-4xl bg-white  overflow-hidden">
        {/* Left Side - Illustration */}

        <div className="hidden md:flex flex-col md:w-1/2 items-center justify-center">
          <img src="/shopspot-logo.svg" alt="Illustration" className="object-cover" />
        </div>
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">

          {isSignUp ? <Signup /> : <Login />}
          <div className="mt-6 text-center">
            <button
              className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition duration-300"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div >
  );
};

export default AuthPage;
