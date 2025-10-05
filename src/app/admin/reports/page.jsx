'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertCircle, User, MessageSquare, Flag, Check, X, Clock, MoreVertical } from 'lucide-react';
import { getReports, updateReportStatus } from '@/lib/actions/admin.actions';

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState({
    reports: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { reports, pagination } = reportsData;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports({ 
          page, 
          limit, 
          status: statusFilter,
          type: typeFilter,
          search 
        });
        setReportsData(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, search, statusFilter, typeFilter]);

  const handleStatusChange = async (reportId, status) => {
    try {
      await updateReportStatus(reportId, status);
      setReportsData(prev => ({
        ...prev,
        reports: prev.reports.map(report => 
          report.id === reportId ? { ...report, status } : report
        )
      }));
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'recipe':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      user: 'bg-blue-100 text-blue-800',
      recipe: 'bg-green-100 text-green-800',
      comment: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Management</h1>
        <p className="text-gray-500">Review and manage user reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Reports</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600">5 new today</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Report Types</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Flag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Most common: Inappropriate content</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <p className="text-2xl font-bold">4.2h</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">Faster than last week</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="recipe">Recipe</SelectItem>
              <SelectItem value="comment">Comment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getReportIcon(report.type)}
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{report.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{report.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <td>{getTypeBadge(report.type)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{report.reportedBy.name}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <div className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" /> Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(report.id, 'rejected')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
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
          Showing {reports.length} of {pagination.total} reports
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
