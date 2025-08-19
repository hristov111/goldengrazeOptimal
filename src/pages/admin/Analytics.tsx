import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalRevenue: number;
  averageOrderValue: number;
  salesData: any;
  productData: any;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    averageOrderValue: 0,
    salesData: null,
    productData: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Get orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('total_cents, created_at, order_items(product_id, quantity)')
        .order('created_at', { ascending: false });

      const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100;
      const averageOrderValue = orders?.length ? totalRevenue / orders.length : 0;

      // Sales over time
      const salesData = await getSalesOverTime(orders || [], timeRange);
      
      // Product performance
      const productData = await getProductPerformance(orders || []);

      setAnalytics({
        totalRevenue,
        averageOrderValue,
        salesData,
        productData
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSalesOverTime = async (orders: any[], range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDay = dates.map(date => {
      const dayOrders = orders.filter(order => 
        order.created_at.startsWith(date)
      );
      return dayOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100;
    });

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: 'Revenue ($)',
          data: salesByDay,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getProductPerformance = async (orders: any[]) => {
    // Get product sales data
    const { data: products } = await supabase
      .from('products')
      .select('id, name');

    const productSales: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
      });
    });

    const topProducts = (products || [])
      .map(product => ({
        name: product.name,
        sales: productSales[product.id] || 0
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      labels: topProducts.map(p => p.name),
      datasets: [
        {
          label: 'Units Sold',
          data: topProducts.map(p => p.sales),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Business insights and performance metrics</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">3.2%</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <ShoppingCart size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales Over Time
          </h2>
          {analytics.salesData && (
            <div className="h-64">
              <Line
                data={analytics.salesData}
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

        {/* Product Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Products
          </h2>
          {analytics.productData && (
            <div className="h-64">
              <Bar
                data={analytics.productData}
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
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;