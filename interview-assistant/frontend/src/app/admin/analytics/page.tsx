'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  };
  interviewStats: {
    totalInterviews: number;
    completedInterviews: number;
    successRate: number;
    avgDuration: number;
  };
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    avgRevenuePerUser: number;
  };
  performanceMetrics: {
    completionRate: number;
    satisfactionScore: number;
    responseTime: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const router = useRouter();

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_ANALYTICS);

  // Currency formatting function
  const formatCurrency = (amount: number): string => {
    if (amount === 0) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchAnalytics();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { adminService } = await import('@/services/adminService');
      const dashboardData = await adminService.getDashboardStats();

      // Use the real data from the API
      const mockAnalytics: AnalyticsData = {
        userStats: {
          totalUsers: dashboardData.userStats.totalUsers || 0,
          activeUsers: dashboardData.userStats.activeUsers || 0,
          newUsersThisMonth: dashboardData.userStats.newUsersThisMonth || 0,
          userGrowthRate: dashboardData.userStats.userGrowthRate || 0
        },
        interviewStats: {
          totalInterviews: dashboardData.interviewStats.totalInterviews || 0,
          completedInterviews: dashboardData.interviewStats.completedInterviews || 0,
          successRate: dashboardData.interviewStats.successRate || 0,
          avgDuration: dashboardData.interviewStats.avgDuration || 0
        },
        revenueStats: {
          totalRevenue: dashboardData.revenueStats.totalRevenue || 0,
          monthlyRevenue: dashboardData.revenueStats.monthlyRevenue || 0,
          revenueGrowth: dashboardData.revenueStats.revenueGrowth || 0,
          avgRevenuePerUser: dashboardData.revenueStats.avgRevenuePerUser || 0
        },
        performanceMetrics: {
          completionRate: dashboardData.performanceMetrics.completionRate || 0,
          satisfactionScore: dashboardData.performanceMetrics.satisfactionScore || 0,
          responseTime: dashboardData.performanceMetrics.responseTime || 0
        }
      };

      setAnalytics(mockAnalytics);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">Comprehensive insights into your platform performance</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchAnalytics}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.userStats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  +{analytics?.userStats.userGrowthRate}%
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.interviewStats.totalInterviews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {analytics?.interviewStats.successRate}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+2.1%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {formatCurrency(analytics?.revenueStats.totalRevenue || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  +{analytics?.revenueStats.revenueGrowth}%
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.userStats.activeUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Users (This Month)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.userStats.newUsersThisMonth.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    +{analytics?.userStats.userGrowthRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.interviewStats.completedInterviews.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {analytics?.interviewStats.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics?.interviewStats.avgDuration}m
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(analytics?.revenueStats.monthlyRevenue || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span className="text-sm font-medium text-green-600">
                    +{analytics?.revenueStats.revenueGrowth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Revenue/User</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${analytics?.revenueStats.avgRevenuePerUser}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                      <p className="text-xs text-gray-500">Interviews completed successfully</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {analytics?.performanceMetrics.completionRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Satisfaction Score</p>
                      <p className="text-xs text-gray-500">Average user satisfaction</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    {analytics?.performanceMetrics.satisfactionScore}/5.0
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Response Time</p>
                      <p className="text-xs text-gray-500">Average system response</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-purple-600">
                    {analytics?.performanceMetrics.responseTime}s
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Interview completed</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Subscription renewed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New plan created</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 