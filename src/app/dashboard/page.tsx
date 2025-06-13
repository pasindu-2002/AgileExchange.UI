'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, ArrowUp, ArrowDown, PieChart as PieChartIcon, BarChart, AlertCircle, Plus, X } from 'lucide-react';
import { UserRole } from '../login/page';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SprintCompany {
  id: number;
  name: string;
  price: number;
  change: number;
  marketCap: string;
}

interface PortfolioItem {
  id: number;
  name: string;
  invested: number;
  change: number;
  shares: number;
}

export default function Dashboard() {
  const MAX_POINTS = 100;
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('team_member');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<SprintCompany, 'id'>>({
    name: '',
    price: 0,
    change: 0,
    marketCap: '0'
  });

  // Get user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserRole;
    if (role) {
      setUserRole(role);
    }
  }, []);

  const [sprintCompanies, setSprintCompanies] = useState<SprintCompany[]>(
    [
      { id: 1, name: 'Team Collaboration', price: 25.40, change: +2.5, marketCap: '1.2M' },
      { id: 2, name: 'Code Quality', price: 31.75, change: -1.2, marketCap: '2.8M' },
      { id: 3, name: 'Documentation', price: 15.20, change: +4.7, marketCap: '950K' },
      { id: 4, name: 'Test Coverage', price: 42.10, change: +0.8, marketCap: '3.4M' },
      { id: 5, name: 'Customer Satisfaction', price: 67.25, change: +6.2, marketCap: '5.1M' },
      { id: 6, name: 'On-time Delivery', price: 28.90, change: -2.1, marketCap: '1.7M' },
      { id: 7, name: 'Technical Debt', price: 12.30, change: -3.5, marketCap: '780K' },
      { id: 8, name: 'Innovation', price: 49.75, change: +5.3, marketCap: '4.2M' },
    ]
  );
  
  const handleAddCompany = () => {
    if (!newCompany.name || newCompany.price <= 0) {
      setErrorMessage('Please provide a name and a valid price');
      return;
    }

    // Find the largest ID and increment by 1
    const maxId = Math.max(...sprintCompanies.map(company => company.id));
    const newId = maxId + 1;

    setSprintCompanies([
      ...sprintCompanies,
      {
        ...newCompany,
        id: newId
      }
    ]);

    // Reset form
    setNewCompany({
      name: '',
      price: 0,
      change: 0,
      marketCap: '0'
    });
    setIsAddingCompany(false);
    setErrorMessage(null);
  };

  const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'change' ? parseFloat(value) || 0 : value
    }));
  };

  const handleInvest = () => {
    if (!selectedCompany || !investmentAmount || isNaN(parseFloat(investmentAmount))) return;
    
    const investAmount = parseFloat(investmentAmount);
    const totalCurrentPoints = portfolio.reduce((sum: number, item: PortfolioItem) => sum + item.invested, 0);
    const remainingPoints = MAX_POINTS - totalCurrentPoints;
    
    // Check if investment exceeds available points
    if (investAmount > remainingPoints) {
      setErrorMessage(`You only have ${remainingPoints} points available to invest`);
      return;
    }
    
    const company = sprintCompanies.find(company => company.id === selectedCompany);
    if (!company) return; // Ensure company exists
    
    const shares = investAmount / company.price;
    setErrorMessage(null);
    
    // Check if already invested in this company
    const existingIndex = portfolio.findIndex(item => item.id === selectedCompany);
    
    if (existingIndex >= 0) {
      // Update existing investment
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...updatedPortfolio[existingIndex],
        invested: updatedPortfolio[existingIndex].invested + investAmount,
        shares: updatedPortfolio[existingIndex].shares + shares
      };
      setPortfolio(updatedPortfolio);
    } else {
      // Add new investment
      setPortfolio([
        ...portfolio,
        {
          id: selectedCompany,
          name: company.name,
          invested: investAmount,
          change: company.change,
          shares: shares
        }
      ]);
    }
    
    // Reset form
    setSelectedCompany(null);
    setInvestmentAmount('');
  };

  const totalInvested = portfolio.reduce((sum: number, item: PortfolioItem) => sum + item.invested, 0);
  const remainingPoints = MAX_POINTS - totalInvested;
  
  // Generate pie chart data for portfolio investments
  const generatePortfolioPieData = () => {
    if (portfolio.length === 0) {
      // If no investments, show all as "uninvested"
      return {
        labels: ['Uninvested Points'],
        datasets: [
          {
            data: [MAX_POINTS],
            backgroundColor: ['#64748b'],
            borderColor: ['#1e293b'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Process portfolio data
    const labels = portfolio.map(item => item.name);
    const investedValues = portfolio.map(item => item.invested);
    
    // Add uninvested points if there are any
    if (remainingPoints > 0) {
      labels.push('Uninvested Points');
      investedValues.push(remainingPoints);
    }
    
    // Generate colors - a different color for each segment
    const backgroundColors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#6366f1', // indigo
      '#ec4899', // pink
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#f97316', // orange
      '#64748b', // slate for uninvested
    ];
    
    // Make sure we have enough colors
    while (backgroundColors.length < labels.length) {
      backgroundColors.push(`hsl(${Math.random() * 360}, 70%, 50%)`);
    }
    
    return {
      labels,
      datasets: [
        {
          data: investedValues,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color), // Slightly darker border
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0', // Light text color for dark theme
          font: {
            size: 11,
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / MAX_POINTS) * 100).toFixed(1);
            return `${context.label}: ${value} points (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
    return (
    <div className={`min-h-screen bg-[#0f172a] text-white ${userRole === 'product_owner' ? 'product-owner-theme' : ''}`}>
      {/* Header */}
      <div className={`border-b border-gray-800 px-6 py-4 ${userRole === 'product_owner' ? 'border-green-900/30' : ''}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              userRole === 'product_owner' 
                ? 'bg-gradient-to-r from-green-500 to-blue-600' 
                : userRole === 'scrum_master'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Agile Exchange</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {userRole !== 'product_owner' && (
              <div className="bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-1 flex items-center">
                <span className="text-blue-400 mr-2">Points Used:</span>
                <span className="font-semibold">{totalInvested} / {MAX_POINTS}</span>
              </div>
            )}
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-1 flex items-center">
              <span className={`px-2 py-0.5 rounded text-xs ${
                userRole === 'scrum_master' ? 'bg-purple-900/50 text-purple-300' : 
                userRole === 'product_owner' ? 'bg-green-900/50 text-green-300' :
                'bg-blue-900/50 text-blue-300'
              }`}>
                {userRole === 'scrum_master' ? 'Scrum Master' : 
                 userRole === 'product_owner' ? 'Product Owner' :
                 'Team Member'}
              </span>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              userRole === 'product_owner' ? 'bg-green-600' :
              userRole === 'scrum_master' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              <span className="font-bold">PE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Portfolio */}
          <div className="lg:col-span-2 space-y-6">            {/* Product Owner heading */}
            {userRole === 'product_owner' && (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Product Owner Dashboard
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Manage sprint companies and analyze team investments
                  </p>
                </div>
                
                {/* Product Owner Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1e293b] border border-green-800/30 rounded-xl p-4">
                    <div className="flex items-center text-gray-400 text-xs mb-2">
                      <BarChart3 className="w-3.5 h-3.5 mr-1" />
                      <span>Sprint Companies</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold mr-2">{sprintCompanies.length}</span>
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] border border-green-800/30 rounded-xl p-4">
                    <div className="flex items-center text-gray-400 text-xs mb-2">
                      <PieChartIcon className="w-3.5 h-3.5 mr-1" />
                      <span>Total Investments</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold mr-2">{totalInvested}</span>
                      <span className="text-xs text-green-400">Points</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] border border-green-800/30 rounded-xl p-4">
                    <div className="flex items-center text-gray-400 text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>Top Interest</span>
                    </div>
                    <div className="flex items-baseline">
                      {portfolio.length > 0 ? (
                        <>
                          <span className="text-lg font-bold mr-2 truncate">
                            {portfolio.sort((a, b) => b.invested - a.invested)[0]?.name || "None"}
                          </span>
                          <span className="text-xs text-green-400">
                            {portfolio.length > 0 ? `${((portfolio.sort((a, b) => b.invested - a.invested)[0]?.invested / MAX_POINTS) * 100).toFixed(0)}%` : "0%"}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold mr-2">No data yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          
            {/* My Sprint Portfolio - Hidden for Product Owners */}
            {userRole !== 'product_owner' && (
              <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Sprint Portfolio</h2>
                  <div className="flex items-center text-sm text-gray-400">
                    <PieChartIcon className="w-4 h-4 mr-1" />
                    <span>Points Used: {totalInvested} / {MAX_POINTS}</span>
                  </div>
                </div>
                
                {portfolio.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-sm text-gray-400 border-b border-gray-800">
                          <th className="pb-2 text-left">Company</th>
                          <th className="pb-2 text-right">Shares</th>
                          <th className="pb-2 text-right">Invested</th>
                          <th className="pb-2 text-right">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map(item => (
                          <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3">{item.name}</td>
                            <td className="py-3 text-right">{item.shares.toFixed(2)}</td>
                            <td className="py-3 text-right">{item.invested.toFixed(2)}</td>
                            <td className={`py-3 text-right ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <span className="flex items-center justify-end">
                                {item.change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(item.change)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BarChart className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>You haven't invested in any sprint companies yet.</p>
                    <p className="text-sm">Make your first investment below!</p>
                  </div>
                )}
              </div>
            )}

            {/* Points allocation indicator - Hidden for Product Owners */}
            {userRole !== 'product_owner' && (
              <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Points Allocation</h2>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Used: {totalInvested} points</span>
                  <span>Remaining: {remainingPoints} points</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      totalInvested > 80 ? 'bg-red-500' : 
                      totalInvested > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(totalInvested / MAX_POINTS) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}            {/* Performance chart */}
            <div className={`bg-[#1e293b] border rounded-xl p-6 ${userRole !== 'product_owner' ? 'border-green-800/40' : 'border-gray-800'}`}>
              <h2 className="text-xl font-semibold mb-4">
                {userRole === 'product_owner' ? 'Team Investment Distribution' : 'Portfolio Performance'}
              </h2>
              <div className="h-64 flex items-center justify-center bg-[#0f172a]/50 rounded-lg border border-gray-800">
                {userRole !== 'team_member' ? (
                  portfolio.length > 0 ? (
                    <div className="w-full h-full p-2">
                      <Pie data={generatePortfolioPieData()} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p>No team investments have been made yet</p>
                      <p className="text-xs mt-2">As a Product Owner, you can see how the team allocates their points</p>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>Performance charts will appear as you build your portfolio</p>
                  </div>
                )}
              </div>
              {userRole === 'product_owner' && (
                <div className="text-xs text-gray-400 mt-4">
                  <p>This chart shows how team members have allocated their points across different sprint companies.</p>
                </div>
              )}
            </div>            {/* Product Owner Investment Analysis */}
            {userRole !== 'team_member' && (
              <div className="bg-[#1e293b] border border-green-800/40 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Team Investment Analysis</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {portfolio.length > 0 ? (
                      portfolio.map(item => {
                        const percentage = ((item.invested / MAX_POINTS) * 100).toFixed(1);
                        return (
                          <div key={item.id} className="bg-[#0f172a]/60 px-3 py-2 rounded-lg border border-green-900/50 hover:border-green-700/50 transition-colors">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">{item.invested} points</span>
                              <span className="text-xs font-medium text-green-300">{percentage}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                              <div 
                                className="h-1.5 rounded-full bg-green-500" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center w-full py-6 text-gray-400 bg-[#0f172a]/30 rounded-lg">
                        <BarChart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p>No team investments to analyze yet</p>
                        <p className="text-xs mt-1">Data will appear here once team members start investing</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 pt-3 border-t border-gray-800">
                    <p>As a Product Owner, you can track how team members allocate their investment points across sprint companies.</p>
                    <p className="mt-1">This data can help identify areas the team considers most important for success.</p>
                  </div>
                </div>
              </div>
            )}
              {/* Sprint Companies List - Specifically for Product Owners */}
            {userRole === 'product_owner' && (
              <div className="bg-[#1e293b] border border-green-800/40 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Sprint Companies Overview</h2>
                  <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded-full">
                    {sprintCompanies.length} Companies
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm text-gray-300 border-b border-gray-800">
                        <th className="pb-3 text-left">Company Name</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">Change</th>
                        <th className="pb-3 text-right">Market Cap</th>
                        <th className="pb-3 text-right">Interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprintCompanies.map(company => {
                        // Calculate interest level based on how many team members invested in this company
                        const investmentCount = portfolio.filter(item => item.id === company.id).length;
                        const interestLevel = investmentCount > 2 ? 'High' : investmentCount > 0 ? 'Medium' : 'Low';
                        const interestColor = interestLevel === 'High' ? 'text-green-400' : 
                                             interestLevel === 'Medium' ? 'text-yellow-400' : 'text-gray-400';
                        
                        return (
                          <tr key={company.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3">
                              <div className="font-medium">{company.name}</div>
                            </td>
                            <td className="py-3 text-right">{company.price.toFixed(2)}</td>
                            <td className={`py-3 text-right ${company.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <span className="flex items-center justify-end">
                                {company.change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(company.change)}%
                              </span>
                            </td>
                            <td className="py-3 text-right">{company.marketCap}</td>
                            <td className={`py-3 text-right ${interestColor}`}>
                              {interestLevel}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <p>The Interest column indicates team investment patterns based on the number of members who invested in each company.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Invest in Sprint Companies - Hidden for Product Owners */}
            {userRole !== 'product_owner' && (
              <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Invest in Sprint Companies</h2>
                
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Select Company
                    </label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedCompany || ''}
                      onChange={(e) => setSelectedCompany(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Choose a sprint company</option>
                      {sprintCompanies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name} - {company.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Investment Points
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`Enter points (max: ${remainingPoints})`}
                      min="1"
                      max={remainingPoints.toString()}
                    />
                    <p className="mt-1 text-xs text-gray-400">You have {remainingPoints} points remaining</p>
                  </div>

                  <button
                    onClick={handleInvest}
                    disabled={!selectedCompany || !investmentAmount || remainingPoints <= 0}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-gray-400 rounded-lg transition-colors font-medium"
                  >
                    {remainingPoints <= 0 ? "No points remaining" : "Invest Now"}
                  </button>
                </div>
              </div>
            )}

            {/* Market Overview */}
            <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
              <ul className="space-y-3">
                {sprintCompanies
                  .filter(company => company.change > 0)
                  .sort((a, b) => b.change - a.change)
                  .slice(0, 3)
                  .map(company => (
                    <li key={company.id} className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded">
                      <span>{company.name}</span>
                      <span className="text-green-400 flex items-center">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        {company.change}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
              {/* Sprint Company Management Section - For Scrum Masters and Product Owners */}
            {(userRole === 'scrum_master' || userRole === 'product_owner') && (
              <div className={`bg-[#1e293b] border rounded-xl p-6 ${
                userRole === 'product_owner' ? 'border-green-800/40' : 'border-gray-800'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {userRole === 'product_owner' ? 'Create New Sprint Company' : 'Manage Sprint Companies'}
                  </h2>
                  {isAddingCompany ? (
                    <button 
                      onClick={() => setIsAddingCompany(false)}
                      className="p-1 hover:bg-gray-700 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAddingCompany(true)}
                      className={`flex items-center text-sm ${
                        userRole === 'product_owner' 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-blue-400 hover:text-blue-300'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Company
                    </button>
                  )}
                </div>

                {isAddingCompany && (
                  <div className={`bg-[#0f172a]/50 p-4 rounded-lg mb-4 ${
                    userRole === 'product_owner' ? 'border border-green-900/30' : 'border border-gray-700'
                  }`}>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Add New Sprint Company</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Company Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newCompany.name}
                          onChange={handleNewCompanyChange}
                          className={`w-full px-3 py-2 rounded-lg bg-[#1e293b] text-white text-sm focus:ring-2 focus:border-transparent ${
                            userRole === 'product_owner' 
                              ? 'border border-green-800 focus:ring-green-500' 
                              : 'border border-gray-700 focus:ring-blue-500'
                          }`}
                          placeholder="e.g. CI/CD Pipeline"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Price</label>
                          <input
                            type="number"
                            name="price"
                            value={newCompany.price || ''}
                            onChange={handleNewCompanyChange}
                            step="0.01"
                            min="0.01"
                            className={`w-full px-3 py-2 rounded-lg bg-[#1e293b] text-white text-sm focus:ring-2 focus:border-transparent ${
                              userRole === 'product_owner' 
                                ? 'border border-green-800 focus:ring-green-500' 
                                : 'border border-gray-700 focus:ring-blue-500'
                            }`}
                            placeholder="e.g. 25.50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Change %</label>
                          <input
                            type="number"
                            name="change"
                            value={newCompany.change || ''}
                            onChange={handleNewCompanyChange}
                            step="0.1"
                            className={`w-full px-3 py-2 rounded-lg bg-[#1e293b] text-white text-sm focus:ring-2 focus:border-transparent ${
                              userRole === 'product_owner' 
                                ? 'border border-green-800 focus:ring-green-500' 
                                : 'border border-gray-700 focus:ring-blue-500'
                            }`}
                            placeholder="e.g. 3.5"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Market Cap</label>
                        <input
                          type="text"
                          name="marketCap"
                          value={newCompany.marketCap}
                          onChange={handleNewCompanyChange}
                          className={`w-full px-3 py-2 rounded-lg bg-[#1e293b] text-white text-sm focus:ring-2 focus:border-transparent ${
                            userRole === 'product_owner' 
                              ? 'border border-green-800 focus:ring-green-500' 
                              : 'border border-gray-700 focus:ring-blue-500'
                          }`}
                          placeholder="e.g. 2.1M"
                        />
                      </div>
                      
                      <button
                        onClick={handleAddCompany}
                        className={`w-full py-2 px-4 rounded-lg transition-colors font-medium text-sm ${
                          userRole === 'product_owner'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Add Sprint Company
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 pt-2">
                  {userRole === 'product_owner' ? (
                    <p>As a Product Owner, you can create new sprint companies for team members to invest in, helping prioritize features and focus areas.</p>
                  ) : (
                    <p>As a Scrum Master, you can add new sprint companies that team members can invest in, facilitating the prioritization process.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
