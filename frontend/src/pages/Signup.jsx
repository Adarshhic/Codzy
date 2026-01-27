import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  FirstName: z.string().min(3, "Minimum character should be 3"),
  EmailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 1000);
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left side - 3D Phone Mockup */}
        <div className="hidden md:flex justify-center items-center">
          <div 
            className={`relative transition-transform duration-1000 ease-in-out ${isRotating ? 'animate-rotate-y' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Phone frame */}
            <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-3 shadow-2xl">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-10"></div>
              
              {/* Phone screen */}
              <div className="w-full h-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-[2.5rem] overflow-hidden relative">
                {/* Screen content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-2">Join Codzy</h3>
                  <p className="text-white/80 text-sm text-center">Start your coding journey today</p>
                  
                  {/* Decorative circles */}
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* Phone button */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 bg-slate-900/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Codzy
              </h1>
              <p className="text-slate-600 text-sm font-medium">Create your account to get started</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* First Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all ${
                      errors.FirstName ? 'border-red-300 focus:border-red-500' : 'border-transparent'
                    }`}
                    {...register('FirstName')}
                  />
                </div>
                {errors.FirstName && (
                  <p className="mt-2 text-red-500 text-xs font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.FirstName.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all ${
                      errors.EmailId ? 'border-red-300 focus:border-red-500' : 'border-transparent'
                    }`}
                    {...register('EmailId')}
                  />
                </div>
                {errors.EmailId && (
                  <p className="mt-2 text-red-500 text-xs font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.EmailId.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-transparent'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-red-500 text-xs font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{' '}
                <NavLink 
                  to="/login" 
                  className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Login
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate-y {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-rotate-y {
          animation: rotate-y 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Signup;


// import { useEffect, useState } from "react";

// function Signup(){
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // Handle signup logic here
//         console.log("Signup submitted:", { name, email, password });
//     }
//      return (
//    <form onSubmit={handleSubmit} className="bg-grey shadow-lg rounded-xl p-8 w-full max-w-md mx-auto">
//    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
//    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required  className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
//    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required   className="w-full mb-6 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//   />
//    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
//    >Sign Up</button>
//    </form>
//   );
// }