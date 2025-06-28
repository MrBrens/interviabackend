'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getUserData } from '@/utils/auth';
import { 
  BarChart2, 
  Users, 
  CreditCard, 
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Loader2
} from 'lucide-react';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalInterviews: number;
  totalDiscussions: number;
  totalPlans: number;
  successRate: number;
  totalRevenue: number;
  avgInterviewDuration: number;
  recentInterviews: any[];
  userGrowth: number;
  interviewGrowth: number;
  revenueGrowth: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN);

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
    // Check if user is logged in and has admin role
    const user = getUserData();
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      console.log('Fetching dashboard stats with token:', token.substring(0, 20) + '...');

      // Fetch dashboard stats from the new analytics API
      const dashboardStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Dashboard stats response status:', dashboardStatsResponse.status);

      if (!dashboardStatsResponse.ok) {
        const errorText = await dashboardStatsResponse.text();
        console.error('Dashboard stats error response:', errorText);
        throw new Error(`Échec de la récupération des statistiques du tableau de bord: ${dashboardStatsResponse.status}`);
      }

      const dashboardData = await dashboardStatsResponse.json();
      console.log('Dashboard data received:', dashboardData);

      // Use the real data from the API
      const dashboardStats: DashboardStats = {
        totalUsers: dashboardData.userStats.totalUsers || 0,
        activeUsers: dashboardData.userStats.activeUsers || 0,
        totalInterviews: dashboardData.interviewStats.totalInterviews || 0,
        totalDiscussions: dashboardData.discussionStats.totalDiscussions || 0,
        totalPlans: dashboardData.planStats.totalPlans || 0,
        successRate: dashboardData.interviewStats.successRate || 0,
        totalRevenue: dashboardData.revenueStats.totalRevenue || 0,
        avgInterviewDuration: dashboardData.interviewStats.avgDuration || 0,
        recentInterviews: [], // Empty array since we're not fetching recent interviews
        userGrowth: dashboardData.userStats.userGrowthRate || 0,
        interviewGrowth: dashboardData.interviewStats.interviewGrowth || 0,
        revenueGrowth: dashboardData.revenueStats.revenueGrowth || 0
      };

      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Échec du chargement des données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-72">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchDashboardStats}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainStats = [
    {
      title: 'Total Utilisateurs',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: Users,
      change: `+${stats?.userGrowth || 0}%`,
      changeType: 'increase',
      color: 'blue'
    },
    {
      title: 'Total Discussions',
      value: stats?.totalDiscussions?.toLocaleString() || '0',
      icon: MessageSquare,
      change: `+${stats?.interviewGrowth || 0}%`,
      changeType: 'increase',
      color: 'purple'
    },
    {
      title: 'Total Plans',
      value: stats?.totalPlans?.toLocaleString() || '0',
      icon: CreditCard,
      change: '+0%',
      changeType: 'increase',
      color: 'green'
    }
  ];

  const performanceMetrics = [
    {
      title: 'Utilisateurs Actifs',
      value: stats?.activeUsers?.toString() || '0',
      trend: `+${stats?.userGrowth || 0}%`,
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Taux de Réussite',
      value: `${stats?.successRate || 0}%`,
      trend: `+${stats?.interviewGrowth || 0}%`,
      icon: CheckCircle2,
      color: 'green'
    },
    {
      title: 'Revenus Totaux',
      value: formatCurrency(stats?.totalRevenue || 0),
      trend: `+${stats?.revenueGrowth || 0}%`,
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
            <p className="mt-2 text-sm text-gray-600">Aperçu complet de votre plateforme d'entretiens</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mainStats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">par rapport au mois dernier</span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {performanceMetrics.map((metric) => (
              <div key={metric.title} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${getColorClasses(metric.color)}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-green-600">{metric.trend}</span>
                  <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/admin/users')}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Gérer les Utilisateurs</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => router.push('/admin/plans')}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Voir les Plans</span>
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => router.push('/admin/analytics')}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Analyses</span>
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 