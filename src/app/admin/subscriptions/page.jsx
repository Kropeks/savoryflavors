'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CreditCard, Check, X, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { getSubscriptions, updateSubscription } from '@/lib/actions/admin.actions';

export default function SubscriptionsPage() {
  const [subscriptionData, setSubscriptionData] = useState({
    subscriptions: [],
    pagination: {
      total: 0,
      totalPages: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { subscriptions, pagination } = subscriptionData;
  const totalPages = Math.max(1, pagination?.totalPages || 1);

  const activeCount = pagination.total || 0;
  const monthlyRevenue = subscriptions.reduce((acc, sub) => acc + (Number(sub.plan.price) || 0), 0);
  const pendingRenewals = subscriptions.filter((sub) => sub.status === 'past_due').length;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptions({ page, limit, status: statusFilter, search });
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setSubscriptionData({
          subscriptions: [],
          pagination: {
            total: 0,
            totalPages: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [page, search, statusFilter]);

  const handleStatusChange = async (subscriptionId, status) => {
    try {
      await updateSubscription(subscriptionId, { status });
      setSubscriptionData((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((sub) =>
          sub.id === subscriptionId ? { ...sub, status } : sub
        ),
      }));
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '—';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return 'P0.00 pesos';
    }

    const formattedAmount = numericAmount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `P${formattedAmount} pesos`;
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
              <p className="text-sm font-medium text-gray-500">Active Premium Subscriptions</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">All premium subscribers currently filtered</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Based on plans shown on this page</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Renewals</p>
              <p className="text-2xl font-bold">{pendingRenewals}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600">Total with status past due</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search subscriptions..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
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
                    <div className="font-medium">{formatCurrency(sub.plan.price)}</div>
                    <div className="text-sm text-gray-500">per {sub.plan.billingCycle}</div>
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
                      <span>{formatDate(sub.nextBillingDate)}</span>
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
          Showing {subscriptions.length} of {pagination.total} subscriptions
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
            disabled={page >= totalPages || subscriptions.length < limit}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
