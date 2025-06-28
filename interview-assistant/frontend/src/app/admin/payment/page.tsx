'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getUserData } from '@/utils/auth';
import { 
  CreditCard, 
  Search, 
  Filter,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface Subscription {
  id: number;
  status: 'active' | 'expired' | 'cancelled';
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  Plan?: {
    id: number;
    name: string;
    price: string | number;
    duration: number;
  };
}

export default function AdminPaymentPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_PAYMENTS);

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

    fetchSubscriptions();
  }, [router, currentPage, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter !== 'all' ? statusFilter : '',
        search: searchTerm
      });

      console.log('Fetching subscriptions with params:', params.toString());
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Failed to fetch subscriptions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      setSubscriptions(data.subscriptions || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSubscriptions();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | string) => {
    // Convert string to number if needed
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if the conversion was successful
    if (isNaN(numericAmount)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading payments...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage all subscriptions and payments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {subscriptions.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="mt-2 text-3xl font-semibold text-green-600">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired Subscriptions</p>
                  <p className="mt-2 text-3xl font-semibold text-red-600">
                    {subscriptions.filter(s => s.status === 'expired').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-50">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {formatCurrency(
                      subscriptions.reduce((sum, sub) => {
                        const price = typeof sub.Plan?.price === 'string' 
                          ? parseFloat(sub.Plan.price) 
                          : (sub.Plan?.price || 0);
                        return sum + (isNaN(price) ? 0 : price);
                      }, 0)
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by user name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchSubscriptions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error loading subscriptions</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-3">
                    <button 
                      onClick={fetchSubscriptions}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Subscriptions</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm || statusFilter !== 'all' 
                              ? 'Try adjusting your search or filter criteria.'
                              : 'There are no subscriptions in the system yet.'
                            }
                          </p>
                          {(searchTerm || statusFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setCurrentPage(1);
                              }}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {subscription.User?.firstName} {subscription.User?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {subscription.User?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.Plan?.name || 'Unknown Plan'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.Plan?.duration} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                            <div className="flex items-center">
                              {getStatusIcon(subscription.status)}
                              <span className="ml-1">{subscription.status}</span>
                            </div>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(subscription.Plan?.price || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-green-600 hover:text-green-900 mr-3">
                            View Details
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 