'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Utensils, Clock, BarChart2, Loader2 } from 'lucide-react';
import { getAdminStats } from '@/lib/actions/admin.actions';

// Fallback stats in case data fetching fails
const defaultStats = [
  { title: 'Total Users', value: '1,234', icon: Users, trend: '+12%', trendType: 'up' },
  { title: 'Total Recipes', value: '5,678', icon: Utensils, trend: '+5%', trendType: 'up' },
  { title: 'Pending Reviews', value: '42', icon: Clock, trend: '-3%', trendType: 'down' },
  { title: 'Monthly Active', value: '8,901', icon: BarChart2, trend: '+8%', trendType: 'up' },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(defaultStats);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminStats();
        setStats(data);
        
        // Update dashboard stats with real data
        setDashboardStats([
          { 
            title: 'Total Users', 
            value: data.totalUsers.toLocaleString(), 
            icon: Users, 
            trend: data.newUsers > 0 ? `+${data.newUsers} new` : 'No change',
            trendType: data.newUsers > 0 ? 'up' : 'neutral'
          },
          { 
            title: 'Total Recipes', 
            value: data.totalRecipes.toLocaleString(), 
            icon: Utensils, 
            trend: data.newRecipes > 0 ? `+${data.newRecipes} new` : 'No change',
            trendType: data.newRecipes > 0 ? 'up' : 'neutral'
          },
          { 
            title: 'Pending Reviews', 
            value: data.pendingReviews, 
            icon: Clock, 
            trend: data.pendingReviews > 0 ? 'Needs attention' : 'All clear',
            trendType: data.pendingReviews > 0 ? 'down' : 'neutral'
          },
          { 
            title: 'Monthly Active', 
            value: data.monthlyActiveUsers.toLocaleString(), 
            icon: BarChart2, 
            trend: data.monthlyActiveUsers > 0 ? 'Active' : 'No activity',
            trendType: data.monthlyActiveUsers > 0 ? 'up' : 'neutral'
          },
        ]);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                index % 4 === 0 ? 'bg-primary/10 text-primary' :
                index % 4 === 1 ? 'bg-secondary/10 text-secondary-foreground' :
                index % 4 === 2 ? 'bg-accent/10 text-accent-foreground' :
                'bg-muted/20 text-muted-foreground'
              }`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trendType === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                {stat.trendType === 'up' ? (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
              <p className="text-muted-foreground text-sm">User growth chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Recipe Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
              <p className="text-muted-foreground text-sm">Recipe analytics chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
