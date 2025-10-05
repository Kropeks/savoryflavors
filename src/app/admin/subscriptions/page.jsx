'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CreditCard, Check, X, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { getSubscriptions, updateSubscription } from '@/lib/actions/admin.actions';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptions({ page, limit, status: statusFilter, search });
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [page, search, statusFilter]);

  const handleStatusChange = async (subscriptionId, status) => {
    try {
      await updateSubscription(subscriptionId, { status });
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status } : sub
      ));
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-500">Manage user subscriptions and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(12540)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">+8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Renewals</p>
              <p className="text-2xl font-bold">42</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600">3 expiring today</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search subscriptions..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="all">All Subscriptions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading subscriptions...
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{sub.customer.name}</div>
                        <div className="text-sm text-gray-500">{sub.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <td className="font-medium">{sub.plan.name}</td>
                  <td>
                    <div className="font-medium">{formatCurrency(sub.plan.amount, sub.currency)}</div>
                    <div className="text-sm text-gray-500">per {sub.plan.interval}</div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : sub.status === 'canceled'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(sub.current_period_end)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {sub.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(sub.id, 'canceled')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(sub.id, 'active')}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" /> Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {subscriptions.length} of {subscriptions.length} subscriptions
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
