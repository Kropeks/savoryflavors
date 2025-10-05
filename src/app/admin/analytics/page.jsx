'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Button from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Utensils, Clock, BarChart2, LineChart, PieChart, Download, Filter } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timeRange }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Fallback to mock data if stats are not loaded
  const displayStats = stats || {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    totalRecipes: 0,
    newRecipes: 0,
    avgSessionDuration: '0m',
    bounceRate: '0%',
  };

  // Generate chart data based on time range
  const generateChartData = (baseData) => {
    const now = new Date();
    let labels = [];
    let data = [];
    
    if (timeRange === '7days') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(Math.floor(Math.random() * 200) + 50); // Random data for demo
      }
    } else if (timeRange === '30days') {
      // Last 30 days (grouped by week)
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        labels.push(`Week ${4 - i}`);
        data.push(Math.floor(Math.random() * 500) + 100); // Random data for demo
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        data.push(Math.floor(Math.random() * 1000) + 200); // Random data for demo
      }
    }
    
    return { labels, data };
  };

  const chartData = {
    users: generateChartData(),
    recipes: generateChartData(),
    trafficSources: [
      { name: 'Direct', value: 35, color: 'bg-blue-500' },
      { name: 'Social', value: 25, color: 'bg-green-500' },
      { name: 'Referral', value: 20, color: 'bg-yellow-500' },
      { name: 'Organic', value: 15, color: 'bg-purple-500' },
      { name: 'Email', value: 5, color: 'bg-red-500' },
    ],
    topRecipes: [
      { name: 'Pasta Carbonara', views: 12453, likes: 1245 },
      { name: 'Chocolate Cake', views: 10542, likes: 987 },
      { name: 'Chicken Curry', views: 9821, likes: 876 },
      { name: 'Caesar Salad', views: 8765, likes: 765 },
      { name: 'Beef Burger', views: 7654, likes: 654 },
    ],
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'increase' ? '↑' : '↓'} {change} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  const ChartPlaceholder = ({ title, icon: Icon, className = '' }) => (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-gray-500">Chart will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Track and analyze your platform's performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Users" 
              value={displayStats.totalUsers.toLocaleString()} 
              icon={Users} 
              change="12%" 
              changeType="increase" 
            />
            <StatCard 
              title="New Users (30d)" 
              value={displayStats.newUsers.toLocaleString()} 
              icon={Users} 
              change="5%" 
              changeType="increase" 
            />
            <StatCard 
              title="Active Users (30d)" 
              value={displayStats.activeUsers.toLocaleString()} 
              icon={Users} 
              change="8%" 
              changeType="increase" 
            />
            <StatCard 
              title="Total Recipes" 
              value={displayStats.totalRecipes.toLocaleString()} 
              icon={Utensils} 
              change="15%" 
              changeType="increase" 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartPlaceholder 
              title="User Growth" 
              icon={LineChart}
              className="h-full"
            />
            <ChartPlaceholder 
              title="Top Traffic Sources" 
              icon={PieChart}
              className="h-full"
            />
          </div>

          <div className="grid gap-6">
            <ChartPlaceholder 
              title="Recipe Engagement" 
              icon={BarChart2}
              className="h-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Total Users" 
              value={displayStats.totalUsers.toLocaleString()} 
              icon={Users} 
              change="12%" 
              changeType="increase" 
            />
            <StatCard 
              title="New Users" 
              value={displayStats.newUsers.toLocaleString()} 
              icon={Users} 
              change="5%" 
              changeType="increase" 
            />
            <StatCard 
              title="Active Users" 
              value={displayStats.activeUsers.toLocaleString()} 
              icon={Users} 
              change="8%" 
              changeType="increase" 
            />
          </div>
          <ChartPlaceholder 
            title="User Growth Over Time" 
            icon={LineChart}
          />
          <ChartPlaceholder 
            title="User Demographics" 
            icon={PieChart}
          />
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Total Recipes" 
              value={displayStats.totalRecipes.toLocaleString()} 
              icon={Utensils} 
              change="15%" 
              changeType="increase" 
            />
            <StatCard 
              title="New Recipes (30d)" 
              value={displayStats.newRecipes.toLocaleString()} 
              icon={Utensils} 
              change="10%" 
              changeType="increase" 
            />
            <StatCard 
              title="Avg. Engagement" 
              value={displayStats.avgSessionDuration} 
              icon={Clock} 
              change="2%" 
              changeType="increase" 
            />
          </div>
          <ChartPlaceholder 
            title="Recipe Growth Over Time" 
            icon={LineChart}
          />
          <ChartPlaceholder 
            title="Top Performing Recipes" 
            icon={BarChart2}
          />
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Visits" 
              value="45,678" 
              icon={Users} 
              change="12%" 
              changeType="increase" 
            />
            <StatCard 
              title="Unique Visitors" 
              value="32,456" 
              icon={Users} 
              change="8%" 
              changeType="increase" 
            />
            <StatCard 
              title="Page Views" 
              value="124,890" 
              icon={BarChart2} 
              change="15%" 
              changeType="increase" 
            />
            <StatCard 
              title="Bounce Rate" 
              value={displayStats.bounceRate} 
              icon={BarChart2} 
              change="3%" 
              changeType="decrease" 
            />
          </div>
          <ChartPlaceholder 
            title="Traffic Sources" 
            icon={PieChart}
          />
          <ChartPlaceholder 
            title="Page Views Over Time" 
            icon={LineChart}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
