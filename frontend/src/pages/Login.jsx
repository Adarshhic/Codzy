import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { 
  Code2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  Zap
} from 'lucide-react';

const loginSchema = z.object({
  EmailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar Minimal */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            CODZY
          </span>
        </NavLink>
        
        <NavLink 
          to="/signup" 
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-4 py-2 rounded-xl"
        >
          Create account
        </NavLink>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Feature highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-max">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Coding Workspace</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                Master algorithms with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">AI assistance</span>
              </h1>
              <p className="text-base text-zinc-400 leading-relaxed">
                Level up your technical interview skills with intelligent AI feedback, real-time study rooms, and synchronized pair programming.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span>500+ curated LeetCode-style DSA challenges</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Instant multi-language code compilation & test runners</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900/40 border border-white/[0.05] p-3 rounded-xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <span>Live video mock interviews & collaborative peer sessions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="relative rounded-3xl bg-zinc-900/70 border border-white/[0.1] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/50">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                <p className="text-sm text-zinc-400 mt-1.5">
                  Enter your credentials to access your workspace
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
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all ${
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all ${
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-500/25 transition-all duration-200 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
                <p className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <NavLink 
                    to="/signup" 
                    className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Sign up for free
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

export default Login;