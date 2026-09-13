import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { 
  Code2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  Award
} from 'lucide-react';

const signupSchema = z.object({
  FirstName: z.string().min(2, "Name must be at least 2 characters"),
  EmailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
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
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar Minimal */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            CODZY
          </span>
        </NavLink>
        
        <NavLink 
          to="/login" 
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-4 py-2 rounded-xl"
        >
          Sign in
        </NavLink>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Feature highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold w-max">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join 50,000+ Software Engineers</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                Start your journey to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">tech mastery</span>
              </h1>
              <p className="text-base text-zinc-400 leading-relaxed">
                Free forever tier includes full problem suite, Monaco editor execution, AI debugging hints, and collaborative study groups.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                </div>
                <span>Free instant access to all core features</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-pink-400" />
                </div>
                <span>Interactive test suites & real-time execution</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Curated interview tracks designed by FAANG engineers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Signup Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="relative rounded-3xl bg-zinc-900/70 border border-white/[0.1] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/50">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
                <p className="text-sm text-zinc-400 mt-1.5">
                  Get started in seconds. No credit card required.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Alex Mercer"
                      className={`w-full pl-10 pr-4 py-3 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
                        errors.FirstName ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/[0.08]'
                      }`}
                      {...register('FirstName')}
                    />
                  </div>
                  {errors.FirstName && (
                    <p className="text-xs text-red-400 mt-1">{errors.FirstName.message}</p>
                  )}
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
                        errors.EmailId ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/[0.08]'
                      }`}
                      {...register('EmailId')}
                    />
                  </div>
                  {errors.EmailId && (
                    <p className="text-xs text-red-400 mt-1">{errors.EmailId.message}</p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      className={`w-full pl-10 pr-10 py-3 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
                        errors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/[0.08]'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-purple-500/25 transition-all duration-200 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <NavLink 
                    to="/login" 
                    className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Sign in here
                  </NavLink>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;