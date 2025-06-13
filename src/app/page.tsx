'use client';

import { TrendingUp, ArrowRight, BarChart3 } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const handleStartClick = () => {
    router.push('/login');
  };
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Agile Exchange</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Dashboard</a>
            <button 
              onClick={handleStartClick}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Start Trading
            </button>
          </nav>
          <button className="md:hidden bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors">
            Menu
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Invest in What Matters
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your sprint retrospectives into data-driven investment decisions. Trade sprint performance like stocks and discover what truly matters to your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              onClick={handleStartClick}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              Start Investing <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="w-full sm:w-auto border border-gray-600 hover:border-gray-500 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors">
              View Sprint Stocks
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div className="bg-[#1e293b] border border-gray-800 p-4 sm:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-300">Team Tokens</h3>
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">2,400</p>
            <p className="text-green-400 text-xs sm:text-sm">+12 Members</p>
          </div>

          <div className="bg-[#1e293b] border border-gray-800 p-4 sm:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-300">Active Sprints</h3>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">18</p>
            <p className="text-green-400 text-xs sm:text-sm">+3 This Week</p>
          </div>

          <div className="bg-[#1e293b] border border-gray-800 p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-300">Sprint Stocks</h3>
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full"></div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">8</p>
            <p className="text-blue-400 text-xs sm:text-sm">Categories Available</p>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 px-4">Why Choose Sprint Stock Market?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold mb-2">Data-Driven Insights</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Turn retrospectives into quantifiable investment decisions</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded"></div>
              </div>
              <h4 className="text-base sm:text-lg font-semibold mb-2">Anonymous Feedback</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Honest team insights without judgment or bias</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full"></div>
              </div>
              <h4 className="text-base sm:text-lg font-semibold mb-2">Visual Analytics</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Clear charts and trends that reveal team priorities</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-full"></div>
              </div>
              <h4 className="text-base sm:text-lg font-semibold mb-2">Actionable Results</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Convert team consensus into concrete next-sprint actions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}