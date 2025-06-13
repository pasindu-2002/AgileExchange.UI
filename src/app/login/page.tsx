'use client';

import { useState } from 'react';
import { ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';

// Define user roles
export type UserRole = 'team_member' | 'scrum_master' | 'product_owner';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'team_member' as UserRole,
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, checked, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Here you would typically handle authentication
    // For example, send a request to your authentication API
    var email = "abc@123.com";
    var password = "12345678";
    if (formData.email !== email || formData.password !== password) {
      setIsLoading(false);
      alert("Invalid email or password");
      return;
    }

    // For now, simulate a login process with a timeout
    setTimeout(() => {
      setIsLoading(false);
      
      // Store user role in localStorage for persistence
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userEmail', formData.email);
      
      router.push('/dashboard'); // Redirect to dashboard after login
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue to Agile Exchange</p>
        </div>
        
        <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="team_member">Team Member</option>
                  <option value="scrum_master">Scrum Master</option>
                  <option value="product_owner">Product Owner</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 bg-[#1e293b] border-gray-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e293b] text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <a
                href="/signup"
                className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-[#0f172a] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
