import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';
import { 
  Code2, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Video, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Flame,
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';
import { THEMES, getInitialTheme, applyTheme } from '../utils/theme';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('midnight');

  useEffect(() => {
    const savedTheme = getInitialTheme();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleSelectTheme = (themeId, themeName) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setThemeDropdownOpen(false);
    toast.success(`Theme switched to ${themeName}`, {
      icon: '🎨',
      duration: 2000
    });
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutUser());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
    { name: 'Mock Interview', path: '/interview/dashboard', icon: Video },
  ];

  if (user?.role === 'Admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <NavLink to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              CODZY
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/[0.08] shadow-sm border border-white/[0.08]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.08] hover:border-white/[0.18] text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm"
              title="Change Color Theme"
            >
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: `linear-gradient(135deg, ${activeThemeObj.primary}, ${activeThemeObj.secondary})` }}
              />
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden lg:inline text-[11px] text-zinc-400">{activeThemeObj.name}</span>
            </button>

            {/* Theme Dropdown Menu */}
            {themeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setThemeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl z-50 p-2 text-sm text-zinc-300 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      Color Themes
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Customize your platform visual experience</p>
                  </div>

                  <div className="p-1 space-y-1 max-h-80 overflow-y-auto">
                    {THEMES.map((theme) => {
                      const isSelected = theme.id === currentTheme;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleSelectTheme(theme.id, theme.name)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                            isSelected 
                              ? 'bg-white/[0.08] text-white border border-white/[0.1]' 
                              : 'hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-lg shadow-md flex items-center justify-center shrink-0 border border-white/[0.1]"
                              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                            />
                            <div>
                              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                {theme.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 line-clamp-1">
                                {theme.description}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Daily Streak / Activity Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Active</span>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setThemeDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-zinc-900 border border-white/[0.08] hover:border-white/[0.18] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {user?.FirstName?.[0] || user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 hidden sm:inline max-w-[100px] truncate">
                    {user?.FirstName || user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl z-50 p-2 text-sm text-zinc-300 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-white/[0.08]">
                        <p className="font-semibold text-white truncate">
                          {user?.FirstName} {user?.LastName || ''}
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.EmailId}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {user?.role || 'User'}
                        </span>
                      </div>

                      <div className="pt-1.5">
                        <NavLink
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                          Dashboard
                        </NavLink>

                        <NavLink
                          to="/problems"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-zinc-400" />
                          Solve Problems
                        </NavLink>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                Get Started
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}

