import React, { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { database, supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [salesData, setSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats in parallel
      const [ordersRes, productsRes, customersRes, salesRes] = await Promise.all([
        supabase.from('orders').select('total_cents, created_at'),
        supabase.from('products').select('id'),
        supabase.rpc('get_user_count'),
        getSalesData()
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const customerCount = customersRes.data || 0;

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100;
      
      // Calculate changes (mock data for now)
      const revenueChange = 12.5; // +12.5%
      const ordersChange = 8.3; // +8.3%

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: customerCount,
        revenueChange,
        ordersChange
      });

      setSalesData(salesRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSalesData = async () => {
    // Get last 7 days of sales data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const { data } = await supabase
      .from('orders')
      .select('total_cents, created_at')
      .gte('created_at', last7Days[0])
      .order('created_at');

    const salesByDay = last7Days.map(date => {
      const dayOrders = (data || []).filter(order => 
        order.created_at.startsWith(date)
      );
      return dayOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100;
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Sales ($)',
          data: salesByDay,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to Golden Graze Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          color="bg-amber-500"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sales Over Last 7 Days
        </h2>
        {salesData && (
          <div className="h-64">
            <Line
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;