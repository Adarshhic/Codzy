import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router';

function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [robotExpression, setRobotExpression] = useState('idle');
  const [isRobotHovered, setIsRobotHovered] = useState(false);
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const robotFollowMouse = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-['Orbitron',sans-serif]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Mesh */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.15), transparent 50%)`,
          }}
        />
        
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-black/30 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z"/>
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            CODZY
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NavLink 
            to="/login"
            className="px-6 py-2 text-cyan-400 font-bold hover:text-cyan-300 transition-all duration-300 relative group"
          >
            <span className="relative z-10">LOGIN</span>
            <div className="absolute inset-0 bg-cyan-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
          <NavLink 
            to="/signup"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">GET STARTED</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-slideInLeft">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/50 rounded-full backdrop-blur-sm">
              <span className="text-cyan-400 font-bold text-sm tracking-wider">⚡ NEXT-GEN AI PLATFORM</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-tight">
              <span className="block text-white animate-fadeIn">Welcome to the</span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-glow">
                Codzy
              </span>
              <span className="block text-white animate-fadeIn" style={{animationDelay: '0.2s'}}>Platform</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed max-w-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
              Master coding interviews with our AI-powered platform. Practice problems, collaborate in study groups, and track your progress with intelligent insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn" style={{animationDelay: '0.6s'}}>
              <NavLink
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  START YOUR JOURNEY
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>

              <button className="group px-8 py-4 border-2 border-cyan-500 rounded-xl font-bold text-lg text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 relative magnetic-button">
                <span className="flex items-center justify-center gap-2">
                  WATCH DEMO
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 animate-fadeIn" style={{animationDelay: '0.8s'}}>
              <div className="group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  10K+
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Active Users</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  500+
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Problems</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  98%
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Success Rate</div>
              </div>
            </div>
          </div>

          {/* AI Robot Mascot */}
          <div className="relative flex items-center justify-center animate-slideInRight">
            <div 
              className="relative cursor-pointer"
              style={robotFollowMouse}
              onMouseEnter={() => setIsRobotHovered(true)}
              onMouseLeave={() => {
                setIsRobotHovered(false);
                setRobotExpression('idle');
              }}
              onClick={() => {
                setRobotExpression('happy');
                setTimeout(() => setRobotExpression('idle'), 1000);
              }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-3xl opacity-50 animate-pulse" />
              
              {/* Robot Container */}
              <div className="relative">
                <svg 
                  className="w-80 h-80 md:w-96 md:h-96 animate-float" 
                  viewBox="0 0 200 200" 
                  fill="none"
                >
                  {/* Robot Body */}
                  <defs>
                    <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Head */}
                  <rect 
                    x="60" 
                    y="40" 
                    width="80" 
                    height="70" 
                    rx="15" 
                    fill="url(#robotGradient)"
                    filter="url(#glow)"
                    className={isRobotHovered ? 'animate-wiggle' : ''}
                  />
                  
                  {/* Antenna */}
                  <line x1="100" y1="40" x2="100" y2="20" stroke="#06b6d4" strokeWidth="3" className="animate-pulse"/>
                  <circle cx="100" cy="20" r="5" fill="#06b6d4" className="animate-ping-slow"/>

                  {/* Eyes */}
                  <g className={robotExpression === 'happy' ? 'animate-blink' : ''}>
                    <circle 
                      cx="80" 
                      cy="65" 
                      r={robotExpression === 'happy' ? '8' : '6'} 
                      fill="#fff" 
                      className="animate-pulse"
                    />
                    <circle 
                      cx="120" 
                      cy="65" 
                      r={robotExpression === 'happy' ? '8' : '6'} 
                      fill="#fff" 
                      className="animate-pulse"
                    />
                    
                    {/* Pupils following cursor */}
                    <circle 
                      cx={80 + (mousePosition.x - window.innerWidth / 2) * 0.01} 
                      cy={65 + (mousePosition.y - window.innerHeight / 2) * 0.01} 
                      r="3" 
                      fill="#06b6d4"
                    />
                    <circle 
                      cx={120 + (mousePosition.x - window.innerWidth / 2) * 0.01} 
                      cy={65 + (mousePosition.y - window.innerHeight / 2) * 0.01} 
                      r="3" 
                      fill="#06b6d4"
                    />
                  </g>

                  {/* Mouth */}
                  {robotExpression === 'happy' ? (
                    <path 
                      d="M 75 85 Q 100 95 125 85" 
                      stroke="#fff" 
                      strokeWidth="3" 
                      fill="none"
                      strokeLinecap="round"
                    />
                  ) : (
                    <line 
                      x1="80" 
                      y1="88" 
                      x2="120" 
                      y2="88" 
                      stroke="#fff" 
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Body */}
                  <rect 
                    x="70" 
                    y="115" 
                    width="60" 
                    height="60" 
                    rx="10" 
                    fill="url(#robotGradient)"
                    filter="url(#glow)"
                  />

                  {/* Chest Panel */}
                  <rect 
                    x="85" 
                    y="130" 
                    width="30" 
                    height="30" 
                    rx="5" 
                    fill="rgba(255,255,255,0.1)"
                    stroke="#06b6d4"
                    strokeWidth="2"
                  />
                  
                  {/* Status Lights */}
                  <circle cx="92" cy="145" r="2" fill="#00ff00" className="animate-pulse"/>
                  <circle cx="100" cy="145" r="2" fill="#ffff00" className="animate-pulse" style={{animationDelay: '0.2s'}}/>
                  <circle cx="108" cy="145" r="2" fill="#ff00ff" className="animate-pulse" style={{animationDelay: '0.4s'}}/>

                  {/* Arms */}
                  <rect 
                    x="40" 
                    y="120" 
                    width="25" 
                    height="40" 
                    rx="8" 
                    fill="url(#robotGradient)"
                    className={isRobotHovered ? 'animate-wave' : ''}
                  />
                  <rect 
                    x="135" 
                    y="120" 
                    width="25" 
                    height="40" 
                    rx="8" 
                    fill="url(#robotGradient)"
                    className={isRobotHovered ? 'animate-wave-reverse' : ''}
                  />

                  {/* Hands */}
                  <circle cx="52" cy="165" r="8" fill="#06b6d4"/>
                  <circle cx="148" cy="165" r="8" fill="#06b6d4"/>
                </svg>

                {/* Floating Status Text */}
                {isRobotHovered && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/50 animate-fadeIn">
                    <span className="text-cyan-400 text-sm font-bold">👋 Hi! I'm Codzy AI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-cyan-400">
            <span className="text-xs font-bold tracking-wider">SCROLL</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of coding education with cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group perspective">
              <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl hover:border-cyan-500 transition-all duration-500 transform-gpu hover:rotateY-5 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                    Smart Problem Curation
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    AI-powered algorithm selects problems based on your skill level and learning pace for optimal growth.
                  </p>

                  <div className="mt-6 h-1 w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group perspective">
              <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl hover:border-purple-500 transition-all duration-500 transform-gpu hover:rotateY-5 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">
                    Live Study Groups
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Collaborate in real-time with peers. Share solutions, discuss strategies, and learn together in AI-moderated sessions.
                  </p>

                  <div className="mt-6 h-1 w-full bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group perspective">
              <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl hover:border-pink-500 transition-all duration-500 transform-gpu hover:rotateY-5 card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-pink-400 transition-colors">
                    Progress Analytics
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track your journey with detailed insights, performance metrics, and personalized recommendations to accelerate learning.
                  </p>

                  <div className="mt-6 h-1 w-full bg-gradient-to-r from-pink-500/0 via-pink-500 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-transparent to-gray-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Your Path to Success
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A simple, effective process designed to transform you into a coding interview expert
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 transform -translate-x-1/2 hidden md:block" />

            {/* Steps */}
            {[
              { number: '01', title: 'Sign Up & Assess', desc: 'Create your account and take a quick skill assessment', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
              { number: '02', title: 'Get Your Plan', desc: 'Receive a personalized learning roadmap powered by AI', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { number: '03', title: 'Practice Daily', desc: 'Solve problems, join study groups, track progress', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { number: '04', title: 'Ace Interviews', desc: 'Master concepts and land your dream job', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
            ].map((step, index) => (
              <div key={index} className={`relative flex items-center gap-8 mb-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Step Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 group hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border-2 border-cyan-400 rounded-full flex items-center justify-center text-xs font-black text-cyan-400">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500 transition-all hover:shadow-xl hover:shadow-cyan-500/20">
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Try It Now
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Experience the power of AI-assisted learning
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/50 rounded-3xl p-12 hover:border-cyan-500 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-cyan-400 text-sm font-mono">codzy-terminal</div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="text-green-400 typing-effect">$ codzy analyze --skill-level intermediate</div>
                <div className="text-gray-400 pl-4 typing-effect" style={{animationDelay: '1s'}}>
                  🤖 Analyzing your progress...
                </div>
                <div className="text-cyan-400 pl-4 typing-effect" style={{animationDelay: '2s'}}>
                  ✓ Strength: Dynamic Programming (87%)
                </div>
                <div className="text-yellow-400 pl-4 typing-effect" style={{animationDelay: '3s'}}>
                  ⚠ Improve: Graph Algorithms (62%)
                </div>
                <div className="text-purple-400 pl-4 typing-effect" style={{animationDelay: '4s'}}>
                  📚 Recommended: 5 medium-level graph problems
                </div>
                <div className="text-gray-400 typing-effect" style={{animationDelay: '5s'}}>
                  <span className="text-green-400">$</span> <span className="animate-blink">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 rounded-[3rem] p-1 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-black rounded-[2.9rem] p-16 text-center">
              {/* Animated rays */}
              <div className="absolute inset-0 overflow-hidden rounded-[2.9rem]">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-spin-slow"
                    style={{
                      transformOrigin: 'top',
                      transform: `rotate(${i * 45}deg)`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>

              <h2 className="relative text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  Ready to Transform
                </span>
                <br />
                <span className="text-white">Your Career?</span>
              </h2>

              <p className="relative text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of developers who have leveled up their skills and landed their dream jobs.
              </p>

              <div className="relative flex flex-col sm:flex-row gap-6 justify-center items-center">
                <NavLink
                  to="/signup"
                  className="group/btn px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    START FREE TODAY
                    <svg className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl" />
                  
                  {/* Pulsing glow */}
                  <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-2xl opacity-0 group-hover/btn:opacity-50 animate-pulse" />
                </NavLink>

                <div className="text-gray-500 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-cyan-500/20 py-12 px-6 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z"/>
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xl font-bold">CODZY</span>
            </div>

            <div className="text-gray-500 text-sm">
              © 2024 Codzy. Powered by AI. Built for the future.
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }

        @keyframes wave-reverse {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes typing-effect {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-wave-reverse {
          animation: wave-reverse 1s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 0.5s ease-in-out 2;
        }

        .typing-effect {
          animation: typing-effect 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .perspective {
          perspective: 1000px;
        }

        .card-3d {
          transition: transform 0.5s ease;
        }

        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }
      `}</style>
    </div>
  );
}

export default LandingPage;