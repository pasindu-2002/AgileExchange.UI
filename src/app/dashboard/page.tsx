'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, BarChart3, ArrowUp, ArrowDown, PieChart as PieChartIcon, BarChart, AlertCircle, Plus, X, Users, Trash2, Building2, LogOut } from 'lucide-react';
import { UserRole } from '../login/page';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { api, type Company as ApiCompany, type Investment as ApiInvestment, type User as ApiUser } from '../../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SprintCompany {
  id: number;
  name: string;
  price: number;
  change: number;
  marketCap: string;
}

// Helper function to convert API company to frontend format
const convertApiCompany = (apiCompany: ApiCompany): SprintCompany => ({
  id: apiCompany.id,
  name: apiCompany.name,
  price: apiCompany.price,
  change: apiCompany.change,
  marketCap: apiCompany.marketCap
});

interface PortfolioItem {
  id: number;
  name: string;
  invested: number;
  change: number;
  shares: number;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  totalInvestments: number;
}

// Helper function to convert API user to frontend format
const convertApiUser = (apiUser: ApiUser): TeamMember => ({
  id: apiUser.id,
  name: `${apiUser.firstName} ${apiUser.lastName}`,
  email: apiUser.email,
  role: apiUser.role,
  joinedDate: apiUser.created_at?.split('T')[0] || '', // Extract date part
  totalInvestments: 0 // Will be calculated separately
});

export default function Dashboard() {
  const MAX_POINTS = 100;
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('team_member');
  const [userName, setUserName] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState({
    companies: true,
    portfolio: true,
    users: true,
    investing: false,
    addingCompany: false,
    addingMember: false
  });
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<SprintCompany, 'id'>>({
    name: '',
    price: 0,
    change: 0,
    marketCap: '0'
  });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id' | 'totalInvestments'> & { password: string }>({
    name: '',
    email: '',
    role: 'team_member',
    joinedDate: new Date().toISOString().split('T')[0],
    password: ''
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sprintCompanies, setSprintCompanies] = useState<SprintCompany[]>([]);
  const [isEndSprintModalOpen, setIsEndSprintModalOpen] = useState(false);
  const [isEndingSprint, setIsEndingSprint] = useState(false);
  const [teamAnalytics, setTeamAnalytics] = useState<any>(null);
  const [teamOverview, setTeamOverview] = useState<any>(null);

  // Get user role from localStorage and load data on component mount
  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole') as UserRole;
    const name = localStorage.getItem('userName') || '';
    if (role) {
      setUserRole(role);
    }
    if (name) {
      setUserName(name);
    }
    
    // Load initial data
    loadData();
  }, []);

  // Load data from backend
  const loadData = async () => {
    try {
      // Load companies
      setLoading(prev => ({ ...prev, companies: true }));
      const companies = await api.companies.getAll();
      setSprintCompanies(companies.map(convertApiCompany));

      // Load portfolio
      setLoading(prev => ({ ...prev, portfolio: true }));
      const investments = await api.investments.getPortfolio();
      const portfolioItems: PortfolioItem[] = investments.map(investment => ({
        id: investment.company_id,
        name: investment.company_name || 'Unknown Company',
        invested: investment.amount,
        change: 0, // Will be updated when we get company data
        shares: investment.shares
      }));
      setPortfolio(portfolioItems);

      // Load team members (only for scrum masters)
      const role = localStorage.getItem('userRole') as UserRole;
      if (role === 'scrum_master') {
        setLoading(prev => ({ ...prev, users: true }));
        const users = await api.users.getAll();
        setTeamMembers(users.map(convertApiUser));
      }

      // Load team analytics and overview (only for product owners)
      if (role === 'product_owner') {
        try {
          const analytics = await api.investments.getTeamAnalytics();
          setTeamAnalytics(analytics);
          
          const overview = await api.investments.getTeamOverview();
          setTeamOverview(overview);
        } catch (error) {
          console.error('Error loading team data:', error);
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        companies: false, 
        portfolio: false, 
        users: false 
      }));
    }
  };
  
  const handleAddCompany = async () => {
    if (!newCompany.name || newCompany.price <= 0) {
      setErrorMessage('Please provide a name and a valid price');
      return;
    }

    setLoading(prev => ({ ...prev, addingCompany: true }));
    setErrorMessage(null);
    
    try {
      const companyData = {
        name: newCompany.name,
        price: newCompany.price,
        change: newCompany.change,
        marketCap: newCompany.marketCap
      };
      
      const createdCompany = await api.companies.create(companyData);

      // Add to local state
      setSprintCompanies(prev => [...prev, convertApiCompany(createdCompany)]);

    // Reset form
    setNewCompany({
      name: '',
      price: 0,
      change: 0,
      marketCap: '0'
    });
    setIsAddingCompany(false);
      setSuccessMessage('Sprint company added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error adding company:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add company');
    } finally {
      setLoading(prev => ({ ...prev, addingCompany: false }));
    }
  };

  const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'change' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      setErrorMessage('Please provide name, email, and password');
      return;
    }

    if (newMember.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    // Check if email already exists
    if (teamMembers.some(member => member.email === newMember.email)) {
      setErrorMessage('A team member with this email already exists');
      return;
    }

    setLoading(prev => ({ ...prev, addingMember: true }));
    setErrorMessage(null);

    try {
      // Create user via API  
      const nameParts = newMember.name.trim().split(' ');
      const firstName = nameParts[0] || newMember.name;
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      const createdUser = await api.users.create({
        email: newMember.email,
        password: newMember.password,
        first_name: firstName,
        last_name: lastName,
        role: newMember.role
      });

      // Add to local state
      setTeamMembers(prev => [...prev, convertApiUser(createdUser)]);

      // Reset form
      setNewMember({
        name: '',
        email: '',
        role: 'team_member',
        joinedDate: new Date().toISOString().split('T')[0],
        password: ''
      });
      setIsAddingMember(false);
      setSuccessMessage('Team member added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error adding team member:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add team member');
    } finally {
      setLoading(prev => ({ ...prev, addingMember: false }));
    }
  };

  const handleNewMemberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await api.users.delete(memberId);
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      setSuccessMessage('Team member removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error removing team member:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove team member');
    }
  };

  const handleRemoveCompany = async (companyId: number) => {
    try {
      await api.companies.delete(companyId);
      setSprintCompanies(sprintCompanies.filter(company => company.id !== companyId));
      setSuccessMessage('Sprint company removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error removing company:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove company');
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    router.push('/login');
  };

  const handleEndSprint = async () => {
    setIsEndingSprint(true);
    setErrorMessage(null);
    
    try {
      await api.sprint.end();
      
      setSuccessMessage('Sprint ended successfully! All user points reset and investments cleared.');
      setIsEndSprintModalOpen(false);
      
      // Reload data to reflect changes
      await loadData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error ending sprint:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to end sprint');
    } finally {
      setIsEndingSprint(false);
    }
  };

  const handleInvest = async () => {
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
    
    setLoading(prev => ({ ...prev, investing: true }));
    setErrorMessage(null);
    
    try {
      // Create investment via API
      const investment = await api.investments.create({
        company_id: selectedCompany,
        amount: investAmount
      });
      
      const shares = investAmount / company.price;
    
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
      
      setSuccessMessage(`Successfully invested ${investAmount} points in ${company.name}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    
    // Reset form
    setSelectedCompany(null);
    setInvestmentAmount('');
    } catch (error) {
      console.error('Error creating investment:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create investment');
    } finally {
      setLoading(prev => ({ ...prev, investing: false }));
    }
  };

  const totalInvested = portfolio.reduce((sum: number, item: PortfolioItem) => sum + item.invested, 0);
  const remainingPoints = MAX_POINTS - totalInvested;

  // Generate user initials from name
  const getUserInitials = (name: string): string => {
    if (!name) return 'U'; // Default to 'U' for User if no name
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
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
    
    // Make sure we have enough colors with deterministic fallbacks
    while (backgroundColors.length < labels.length) {
      const hue = (backgroundColors.length * 45) % 360; // Deterministic hue based on index
      backgroundColors.push(`hsl(${hue}, 70%, 50%)`);
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

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

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
              <span className="font-bold text-sm">{getUserInitials(userName)}</span>
            </div>
            {userRole === 'scrum_master' && (
              <button
                onClick={() => setIsEndSprintModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                title="End Sprint"
              >
                <BarChart className="w-4 h-4" />
                <span>End Sprint</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
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
                      <span>Total Team Investment</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold mr-2">
                        {teamAnalytics?.overview?.total_points_invested ? 
                          parseFloat(teamAnalytics.overview.total_points_invested).toFixed(0) : '0'
                        }
                      </span>
                      <span className="text-xs text-green-400">Story Points</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] border border-green-800/30 rounded-xl p-4">
                    <div className="flex items-center text-gray-400 text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>Top Interest</span>
                    </div>
                    <div className="flex items-baseline">
                      {teamOverview?.teamOverview && teamOverview.teamOverview.length > 0 ? (
                        <>
                          <span className="text-lg font-bold mr-2 truncate">
                            {teamOverview.teamOverview
                              .sort((a: any, b: any) => parseFloat(b.total_points_invested) - parseFloat(a.total_points_invested))[0]?.company_name || "None"}
                          </span>
                          <span className="text-xs text-green-400">
                            {teamOverview.teamOverview
                              .sort((a: any, b: any) => parseFloat(b.total_points_invested) - parseFloat(a.total_points_invested))[0]?.interest_level || "Low"}
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
            <div className={`bg-[#1e293b] border rounded-xl p-6 ${userRole === 'product_owner' ? 'border-green-800/40' : 'border-gray-800'}`}>
              <h2 className="text-xl font-semibold mb-4">
                {userRole === 'product_owner' ? 'Team Investment Distribution' : 'Portfolio Performance'}
              </h2>
              <div className="h-64 flex items-center justify-center bg-[#0f172a]/50 rounded-lg border border-gray-800">
                {userRole === 'product_owner' ? (
                  teamOverview && teamOverview.teamOverview && teamOverview.teamOverview.length > 0 ? (
                    <div className="w-full h-full p-2">
                      <Pie data={{
                        labels: teamOverview.teamOverview.map((item: any) => item.company_name),
                        datasets: [{
                          data: teamOverview.teamOverview.map((item: any) => parseFloat(item.total_points_invested)),
                          backgroundColor: [
                            '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'
                          ],
                          borderWidth: 1,
                        }]
                      }} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p>No team investments have been made yet</p>
                      <p className="text-xs mt-2">Chart will show how the team allocates their points</p>
                    </div>
                  )
                ) : userRole !== 'team_member' ? (
                  portfolio.length > 0 ? (
                    <div className="w-full h-full p-2">
                      <Pie data={generatePortfolioPieData()} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p>No investments have been made yet</p>
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
            {userRole === 'product_owner' && (
              <div className="bg-[#1e293b] border border-green-800/40 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Team Investment Analysis</h2>
                
                {/* Analytics Overview */}
                {teamAnalytics && teamAnalytics.overview && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0f172a]/50 p-4 rounded-lg border border-green-900/30">
                      <div className="text-2xl font-bold text-green-400">{teamAnalytics.overview.total_investors}</div>
                      <div className="text-xs text-gray-400">Active Investors</div>
                    </div>
                    <div className="bg-[#0f172a]/50 p-4 rounded-lg border border-green-900/30">
                      <div className="text-2xl font-bold text-blue-400">{parseFloat(teamAnalytics.overview.total_points_invested || 0).toFixed(0)}</div>
                      <div className="text-xs text-gray-400">Total Points Invested</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {teamOverview && teamOverview.teamOverview && teamOverview.teamOverview.length > 0 ? (
                      teamOverview.teamOverview.map((item: any) => {
                        const totalPoints = parseFloat(item.total_points_invested);
                        const investorCount = parseInt(item.investor_count);
                        const avgPoints = investorCount > 0 ? (totalPoints / investorCount).toFixed(1) : '0';
                        
                        return (
                          <div key={item.company_id} className="bg-[#0f172a]/60 px-3 py-2 rounded-lg border border-green-900/50 hover:border-green-700/50 transition-colors">
                            <div className="text-sm font-medium">{item.company_name}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">{totalPoints} SP total</span>
                              <span className="text-xs font-medium text-green-300">{item.interest_level}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-blue-300">{investorCount} investors</span>
                              <span className="text-xs text-yellow-300">{avgPoints} avg SP</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  item.interest_level === 'High' ? 'bg-green-500' :
                                  item.interest_level === 'Medium' ? 'bg-yellow-500' : 'bg-gray-500'
                                }`} 
                                style={{ width: `${Math.min((totalPoints / 500) * 100, 100)}%` }}
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
                    <p>Track how team members allocate their story points across sprint companies.</p>
                    <p className="mt-1">Interest levels: High (3+ investors), Medium (1-2 investors), Low (0 investors).</p>
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
                        <th className="pb-3 text-right">Story Points</th>
                        <th className="pb-3 text-right">Velocity Impact</th>
                        <th className="pb-3 text-right">Team Capacity</th>
                        <th className="pb-3 text-right">Interest Level</th>
                        <th className="pb-3 text-right">Investors</th>
                        <th className="pb-3 text-right">Total Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamOverview && teamOverview.teamOverview ? teamOverview.teamOverview.map((company: any) => {
                        const interestColor = company.interest_level === 'High' ? 'text-green-400' : 
                                             company.interest_level === 'Medium' ? 'text-yellow-400' : 'text-gray-400';
                        
                        return (
                          <tr key={company.company_id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3">
                              <div className="font-medium">{company.company_name}</div>
                            </td>
                            <td className="py-3 text-right">{parseFloat(company.price).toFixed(0)} SP</td>
                            <td className={`py-3 text-right ${parseFloat(company.change_percentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <span className="flex items-center justify-end">
                                {parseFloat(company.change_percentage) >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(parseFloat(company.change_percentage)).toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 text-right">{company.market_cap}</td>
                            <td className={`py-3 text-right ${interestColor}`}>
                              {company.interest_level}
                            </td>
                            <td className="py-3 text-right">
                              <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full text-xs">
                                {company.investor_count}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="font-semibold text-green-400">
                                {parseFloat(company.total_points_invested).toFixed(0)} SP
                              </span>
                            </td>
                          </tr>
                        );
                      }) : sprintCompanies.map(company => (
                        <tr key={company.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-3">
                            <div className="font-medium">{company.name}</div>
                          </td>
                          <td className="py-3 text-right">{company.price.toFixed(0)} SP</td>
                          <td className={`py-3 text-right ${company.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <span className="flex items-center justify-end">
                              {company.change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                              {Math.abs(company.change).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 text-right">{company.marketCap}</td>
                          <td className="py-3 text-right text-gray-400">Low</td>
                          <td className="py-3 text-right">
                            <span className="bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full text-xs">0</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="font-semibold text-gray-400">0 SP</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <p>Overview shows real-time team investment data. Story Points indicate effort required, Interest Level shows team priority preferences.</p>
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

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg flex items-start">
                    <div className="w-5 h-5 bg-green-400 rounded-full mr-2 flex-shrink-0 mt-0.5"></div>
                    <p className="text-green-400 text-sm">{successMessage}</p>
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
                    disabled={!selectedCompany || !investmentAmount || remainingPoints <= 0 || loading.investing}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-gray-400 rounded-lg transition-colors font-medium"
                  >
                    {loading.investing 
                      ? "Investing..." 
                      : remainingPoints <= 0 
                        ? "No points remaining" 
                        : "Invest Now"
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Top Performers</h2>
                <div className="text-xs text-gray-400">Velocity Impact</div>
              </div>
              
              {sprintCompanies.length > 0 ? (
                <div className="space-y-3">
                {sprintCompanies
                  .sort((a, b) => b.change - a.change)
                    .slice(0, 5)
                    .map((company, index) => (
                      <div key={company.id} className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-orange-600 text-orange-100' :
                            'bg-gray-600 text-gray-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-white">{company.name}</div>
                            <div className="text-xs text-gray-400">{company.price} SP • {company.marketCap}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center ${
                            company.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {company.change >= 0 ? (
                        <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            <span className="font-semibold">{Math.abs(company.change)}%</span>
                          </div>
                          <div className="text-xs text-gray-500">velocity</div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No sprint companies yet</p>
                  <p className="text-xs mt-1">Add companies to see performance rankings</p>
                </div>
              )}
              
              {/* Performance Stats */}
              {sprintCompanies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {sprintCompanies.filter(c => c.change > 0).length}
                      </div>
                      <div className="text-xs text-gray-400">Positive Impact</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {Math.max(...sprintCompanies.map(c => c.price)).toFixed(0)} SP
                      </div>
                      <div className="text-xs text-gray-400">Highest Effort</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {Math.max(...sprintCompanies.map(c => Math.abs(c.change))).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Max Impact</div>
                    </div>
                  </div>
                </div>
              )}
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
                          <label className="block text-xs text-gray-400 mb-1">Story Points</label>
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
                            placeholder="e.g. 8"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Velocity Impact %</label>
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
                        <label className="block text-xs text-gray-400 mb-1">Team Capacity</label>
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
                          placeholder="e.g. 2.1 Sprints"
                        />
                      </div>
                      
                      <button
                        onClick={handleAddCompany}
                        disabled={loading.addingCompany}
                        className={`w-full py-2 px-4 rounded-lg transition-colors font-medium text-sm disabled:opacity-70 ${
                          userRole === 'product_owner'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {loading.addingCompany ? 'Adding...' : 'Add Sprint Company'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Sprint Companies List */}
                <div className="space-y-3">
                  {sprintCompanies.map((company) => (
                    <div 
                      key={company.id} 
                      className="flex items-center justify-between p-3 bg-[#0f172a]/30 rounded-lg border border-gray-700/50 hover:bg-[#0f172a]/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          userRole === 'product_owner' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}>
                          {company.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{company.name}</h4>
                          <p className="text-sm text-gray-400">Capacity: {company.marketCap}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            {company.price} SP
                          </div>
                          <div className={`text-xs font-medium flex items-center ${
                            company.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {company.change >= 0 ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(company.change)}% velocity
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveCompany(company.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                          title="Remove company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {sprintCompanies.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-[#0f172a]/30 rounded-lg">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>No sprint companies created yet</p>
                      <p className="text-xs mt-1">Add your first company to get started</p>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-700/50 mt-4">
                  {userRole === 'product_owner' ? (
                    <p>As a Product Owner, you can create new sprint companies for team members to invest in, helping prioritize features and focus areas.</p>
                  ) : (
                    <p>As a Scrum Master, you can add new sprint companies that team members can invest in, facilitating the prioritization process.</p>
                  )}
                </div>
              </div>
            )}

            {/* Team Members Management Section - For Scrum Masters */}
            {userRole === 'scrum_master' && (
              <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Manage Team Members
                  </h2>
                  {isAddingMember ? (
                    <button 
                      onClick={() => setIsAddingMember(false)}
                      className="p-1 hover:bg-gray-700 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAddingMember(true)}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Member
                    </button>
            )}
          </div>

                {isAddingMember && (
                  <div className="bg-[#0f172a]/50 p-4 rounded-lg mb-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Add New Team Member</h3>
                    <div className="space-y-3">
                                             <div className="grid grid-cols-2 gap-3">
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                           <input
                             type="text"
                             name="name"
                             value={newMember.name}
                             onChange={handleNewMemberChange}
                             className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="e.g. John Doe"
                             required
                           />
        </div>
                         
                         <div>
                           <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                           <input
                             type="email"
                             name="email"
                             value={newMember.email}
                             onChange={handleNewMemberChange}
                             className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="e.g. john@company.com"
                             required
                           />
      </div>
                       </div>

                       <div>
                         <label className="block text-xs text-gray-400 mb-1">Password</label>
                         <input
                           type="password"
                           name="password"
                           value={newMember.password}
                           onChange={handleNewMemberChange}
                           className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter password (min. 6 characters)"
                           minLength={6}
                           required
                         />
                       </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Role</label>
                          <select
                            name="role"
                            value={newMember.role}
                            onChange={handleNewMemberChange}
                            className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="team_member">Team Member</option>
                            <option value="product_owner">Product Owner</option>
                            <option value="scrum_master">Scrum Master</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Join Date</label>
                          <input
                            type="date"
                            name="joinedDate"
                            value={newMember.joinedDate}
                            onChange={handleNewMemberChange}
                            className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                                             <button
                         onClick={handleAddMember}
                         disabled={loading.addingMember}
                         className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-lg transition-colors font-medium text-sm"
                       >
                         {loading.addingMember ? 'Adding...' : 'Add Team Member'}
                       </button>
                    </div>
                  </div>
                )}

                {/* Team Members List */}
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 bg-[#0f172a]/30 rounded-lg border border-gray-700/50 hover:bg-[#0f172a]/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{member.name}</h4>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                            member.role === 'product_owner' 
                              ? 'bg-green-900/30 text-green-400' 
                              : member.role === 'scrum_master'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-gray-800/50 text-gray-300'
                          }`}>
                            {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {member.totalInvestments} points invested
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-700/50 mt-4">
                  <p>As a Scrum Master, you can manage team members who participate in sprint investments. Team members can invest their points to indicate priority preferences.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End Sprint Confirmation Modal */}
      {isEndSprintModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm End Sprint</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-3">
                Are you sure you want to end the current sprint? This action will:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 pl-4">
                <li>• Reset all user points to 100</li>
                <li>• Clear all user investments</li>
                <li>• Cannot be undone</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEndSprintModalOpen(false)}
                disabled={isEndingSprint}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSprint}
                disabled={isEndingSprint}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isEndingSprint ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Ending Sprint...
                  </>
                ) : (
                  'End Sprint'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
