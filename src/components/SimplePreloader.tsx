'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, BarChart3, Activity } from 'lucide-react';

export default function SimplePreloader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [mounted, setMounted] = useState(false);

  const loadingStages = [
    { message: "Initializing market data...", icon: BarChart3 },
    { message: "Connecting to exchange...", icon: Zap },
    { message: "Loading sprint analytics...", icon: Activity },
    { message: "Preparing dashboard...", icon: Target },
    { message: "Welcome to Agile Exchange!", icon: TrendingUp },
  ];

  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Generate floating particles only on client
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 4; // Complete in 2.5 seconds
        
        // Update stage based on progress
        const stage = Math.floor((newProgress / 100) * loadingStages.length);
        setCurrentStage(Math.min(stage, loadingStages.length - 1));

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const CurrentIcon = loadingStages[currentStage]?.icon || TrendingUp;

  // Show static version until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 mx-auto animate-pulse">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
            Agile Exchange
          </h2>
          <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div className="w-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] z-50 flex items-center justify-center overflow-hidden">
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%)] bg-[length:60px_60px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_25%,rgba(139,92,246,0.1)_50%,transparent_75%)] bg-[length:60px_60px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `floatUpDown 4s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative text-center z-10">
        
        {/* Animated Logo Container */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer Rotating Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          
          {/* Middle Pulsing Ring */}
          <div className="absolute inset-2 border-2 border-transparent border-l-blue-400 border-b-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          
          {/* Inner Glowing Container */}
          <div className="absolute inset-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
            <div className="relative">
              <CurrentIcon className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 animate-ping"></div>
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Dynamic Title with Glitch Effect */}
        <div className="relative mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Agile Exchange
          </h2>
          <div className="absolute inset-0 text-4xl font-bold text-blue-400 opacity-20 animate-ping" style={{animationDuration: '2s'}}>
            Agile Exchange
          </div>
        </div>
        
                 {/* Audio Visualizer Bars */}
         <div className="flex items-end justify-center gap-1 mb-8 h-16">
           {Array.from({ length: 8 }, (_, i) => (
             <div
               key={i}
               className="w-3 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-full"
               style={{
                 height: `${30 + (i % 3) * 15}px`, // Use deterministic heights instead of Math.sin(Date.now())
                 animation: `audioBar 0.8s ease-in-out infinite`,
                 animationDelay: `${i * 0.1}s`,
               }}
             />
           ))}
         </div>
        
        {/* Progress Bar with Glowing Effect */}
        <div className="relative w-96 h-3 bg-gray-800/50 rounded-full overflow-hidden mb-6 backdrop-blur-sm border border-gray-700/50">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full blur-sm transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          
          {/* Progress Percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white/80">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        {/* Dynamic Loading Message */}
        <div className="relative h-8">
          <p className="text-lg font-medium text-gray-300 animate-pulse">
            {loadingStages[currentStage]?.message || "Loading..."}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse" />
        </div>
        
                 {/* Floating Action Indicators */}
         <div className="flex justify-center gap-4 mt-8">
           {[0, 1, 2].map((i) => (
             <div
               key={i}
               className={`w-3 h-3 rounded-full transition-all duration-300 ${
                 currentStage >= i ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-110' : 'bg-gray-600'
               }`}
               style={{
                 animation: currentStage >= i ? `bounce 1s ease-in-out infinite ${i * 0.2}s` : 'none',
               }}
             />
           ))}
         </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx global>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.8; }
          75% { transform: translateY(-20px) translateX(-10px); opacity: 1; }
        }
        
        @keyframes audioBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(-10px) scale(1.1); }
          43% { transform: translateY(-5px) scale(1.05); }
        }
      `}</style>
    </div>
  );
} 