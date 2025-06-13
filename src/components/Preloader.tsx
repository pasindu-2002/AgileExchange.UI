'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, LineChart, BarChart3, Activity, DollarSign, TrendingDown, Percent, RefreshCw, Settings, Bell } from 'lucide-react';

const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [stockData, setStockData] = useState({
    value: 100,
    change: 0,
    volume: 0,
    high: 0,
    low: 0,
    lastUpdate: new Date()
  });
  const [activeTab, setActiveTab] = useState('market');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate more complex stock chart data with slower updates
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const points = 100; // More points for smoother line
    const volatility = 1.5;
    let lastValue = 50;
    const data = Array.from({ length: points }, () => {
      lastValue = Math.max(30, Math.min(70, lastValue + (Math.random() - 0.5) * volatility));
      return lastValue;
    });

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
    bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < height; i += 20) {
      const perspective = 1 - (i / height) * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width * perspective, i);
      ctx.stroke();
    }

    // Draw price line with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.moveTo(0, height - data[0]);

    data.forEach((value, index) => {
      const x = (index / (points - 1)) * width;
      const y = height - value;
      ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Add subtle glow
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Add gradient fill
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    fillGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = fillGradient;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

  }, [isRefreshing]);

  // Slower progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 800);
          return 100;
        }
        return prev + 0.5; // Slower progress
      });

      // Update stock data with more realistic timing
      setStockData(prev => {
        const now = new Date();
        if (now.getTime() - prev.lastUpdate.getTime() < 2000) return prev; // Update every 2 seconds

        const change = (Math.random() - 0.48) * 0.8; // Smaller, more realistic changes
        const newValue = Math.max(95, Math.min(105, prev.value + change));
        const newVolume = Math.max(0, prev.volume + (Math.random() - 0.5) * 50);
        
        // Add random notifications
        if (Math.random() > 0.7) {
          const newNotification = `Market update: ${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(2)}%`;
          setNotifications(prev => [newNotification, ...prev].slice(0, 3));
        }

        return {
          value: newValue,
          change: change,
          volume: newVolume,
          high: Math.max(prev.high, newValue),
          low: Math.min(prev.low || newValue, newValue),
          lastUpdate: now
        };
      });
    }, 100); // Slower updates

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 flex items-center justify-center overflow-hidden">
      {/* Background elements with more space and slower movement */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)] animate-pulse-glow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.02)_50%,transparent_75%)] bg-[length:40px_40px] animate-grid-fade"></div>
        
        {/* Background market indicators - more spread out and slower */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-1 text-xs bg-[#1e293b]/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
              transform: `scale(${0.8 + Math.random() * 0.4})`
            }}
          >
            <span className="font-mono text-blue-400/60">AGX</span>
            {i % 2 === 0 ? <ArrowUp className="w-3 h-3 text-green-400/60" /> : <ArrowDown className="w-3 h-3 text-red-400/60" />}
            <span className="font-mono text-gray-400/60">{(Math.random() * 5).toFixed(2)}%</span>
          </div>
        ))}
      </div>

      {/* Main container with more spacing */}
      <div className="relative w-[600px] h-[400px]">
        <div className="absolute inset-0 bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl shadow-blue-500/10 p-8">
          {/* Header with interactive elements */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Agile Exchange
                </h2>
                <p className="text-sm text-gray-400">Market Data Initialization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className={`p-2 rounded-lg bg-[#0f172a]/50 hover:bg-[#0f172a] transition-colors ${isRefreshing ? 'animate-spin-slow' : ''}`}
              >
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-[#0f172a]/50 hover:bg-[#0f172a] transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-400" />
              </button>
              <div className="relative">
                <button className="p-2 rounded-lg bg-[#0f172a]/50 hover:bg-[#0f172a] transition-colors">
                  <Bell className="w-4 h-4 text-blue-400" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {notifications.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e293b] rounded-lg shadow-lg border border-blue-500/20 p-2">
                    {notifications.map((note, i) => (
                      <div key={i} className="text-xs text-gray-300 p-2 hover:bg-[#0f172a] rounded transition-colors">
                        {note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content with more spacing */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left column - Chart */}
            <div className="col-span-2 space-y-6">
              <div className="h-48 bg-[#0f172a]/50 rounded-xl p-4 relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={180}
                  className="w-full h-full"
                />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs bg-[#0f172a]/80 px-2 py-1 rounded">
                    <Activity className="w-3 h-3" />
                    <span className="font-mono">AGX</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                    stockData.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {stockData.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span className="font-mono">{stockData.value.toFixed(2)}</span>
                    <span className="font-mono">({stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Market stats with hover effects */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Volume', value: `${(stockData.volume / 1000).toFixed(1)}K`, icon: BarChart3, color: 'blue' },
                  { label: 'High', value: stockData.high.toFixed(2), icon: TrendingUp, color: 'green' },
                  { label: 'Low', value: stockData.low.toFixed(2), icon: TrendingDown, color: 'red' }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="group bg-[#0f172a]/50 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:bg-[#0f172a] hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center group-hover:bg-${stat.color}-500/20 transition-colors`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
                      <div className="text-sm font-medium text-white">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Progress and settings */}
            <div className="space-y-6">
              {/* Progress section */}
              <div className="bg-[#0f172a]/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">Initialization Progress</span>
                  <span className="text-sm font-medium text-blue-400">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-market-tick"></div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Loading market data and preparing your workspace...
                </div>
              </div>

              {/* Settings panel */}
              {showSettings && (
                <div className="bg-[#0f172a]/50 rounded-xl p-4 animate-fade-in">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Display Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Show Grid</span>
                      <button className="w-8 h-4 bg-blue-500/20 rounded-full relative">
                        <div className="w-3 h-3 bg-blue-400 rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Dark Mode</span>
                      <button className="w-8 h-4 bg-blue-500/20 rounded-full relative">
                        <div className="w-3 h-3 bg-blue-400 rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader; 