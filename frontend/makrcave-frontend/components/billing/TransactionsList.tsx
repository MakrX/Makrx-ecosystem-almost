import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  Wallet,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'membership' | 'credit_purchase' | 'printing_3d' | 'laser_cutting' | 'workshop' | 'materials' | 'refund';
  status: 'success' | 'pending' | 'failed' | 'cancelled' | 'refunded';
  description: string;
  gateway: 'razorpay' | 'stripe' | 'credit' | 'bank_transfer';
  gateway_transaction_id?: string;
  created_at: string;
  completed_at?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
}

interface TransactionsListProps {
  transactions?: Transaction[];
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  onViewTransaction?: (transaction: Transaction) => void;
  onDownloadReceipt?: (transactionId: string) => void;
  onRetryPayment?: (transactionId: string) => void;
  onRefundTransaction?: (transactionId: string) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions = [],
  showSearch = true,
  showFilters = true,
  showPagination = true,
  pageSize = 10,
  onViewTransaction,
  onDownloadReceipt,
  onRetryPayment,
  onRefundTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data if no transactions provided
  const mockTransactions: Transaction[] = [
    {
      id: 'txn_001',
      amount: 99.99,
      currency: 'INR',
      type: 'membership',
      status: 'success',
      description: 'Pro Maker Membership - Monthly',
      gateway: 'razorpay',
      gateway_transaction_id: 'pay_abc123',
      created_at: '2024-01-20T10:30:00Z',
      completed_at: '2024-01-20T10:31:15Z',
      metadata: { plan_id: 'pro_monthly', user_id: 'user_123' }
    },
    {
      id: 'txn_002',
      amount: 150.00,
      currency: 'INR',
      type: 'credit_purchase',
      status: 'success',
      description: 'Credit Purchase - 150 Credits',
      gateway: 'razorpay',
      gateway_transaction_id: 'pay_def456',
      created_at: '2024-01-18T14:20:00Z',
      completed_at: '2024-01-18T14:21:05Z',
      metadata: { credits_purchased: 150 }
    },
    {
      id: 'txn_003',
      amount: 45.50,
      currency: 'INR',
      type: 'printing_3d',
      status: 'success',
      description: '3D Print Job #PRT001',
      gateway: 'credit',
      created_at: '2024-01-17T09:15:00Z',
      completed_at: '2024-01-17T09:15:00Z',
      metadata: { job_id: 'PRT001', credits_used: 45.5 }
    },
    {
      id: 'txn_004',
      amount: 25.25,
      currency: 'INR',
      type: 'laser_cutting',
      status: 'failed',
      description: 'Laser Cut Job #LC003',
      gateway: 'razorpay',
      created_at: '2024-01-16T16:45:00Z',
      failure_reason: 'Insufficient balance in payment method'
    },
    {
      id: 'txn_005',
      amount: 200.00,
      currency: 'INR',
      type: 'workshop',
      status: 'pending',
      description: 'Arduino Workshop Registration',
      gateway: 'razorpay',
      gateway_transaction_id: 'pay_ghi789',
      created_at: '2024-01-15T11:00:00Z',
      metadata: { workshop_id: 'ws_arduino_101' }
    },
    {
      id: 'txn_006',
      amount: -50.00,
      currency: 'INR',
      type: 'refund',
      status: 'success',
      description: 'Refund for Workshop #WS001',
      gateway: 'razorpay',
      created_at: '2024-01-14T13:30:00Z',
      completed_at: '2024-01-14T13:35:00Z',
      metadata: { original_transaction: 'txn_xyz' }
    }
  ];

  const data = transactions.length > 0 ? transactions : mockTransactions;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'credit_purchase':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      case 'printing_3d':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'laser_cutting':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'workshop':
        return <Calendar className="h-4 w-4 text-indigo-600" />;
      case 'materials':
        return <FileText className="h-4 w-4 text-teal-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const isNegative = transaction.amount < 0 || transaction.type === 'refund';
    const amount = Math.abs(transaction.amount);
    const symbol = transaction.currency === 'INR' ? '₹' : '$';
    const sign = isNegative ? '-' : '+';
    const colorClass = isNegative ? 'text-red-600' : 'text-green-600';
    
    return (
      <span className={`font-medium ${colorClass}`}>
        {sign}{symbol}{amount.toFixed(2)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const filteredTransactions = data.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.gateway_transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesGateway = gatewayFilter === 'all' || transaction.gateway === gatewayFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 3600 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDate = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesGateway && matchesDate;
  });

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = showPagination 
    ? filteredTransactions.slice(startIndex, startIndex + pageSize)
    : filteredTransactions;

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
    onViewTransaction?.(transaction);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          {(showSearch || showFilters) && (
            <div className="mb-6 space-y-4">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="credit_purchase">Credits</SelectItem>
                      <SelectItem value="printing_3d">3D Printing</SelectItem>
                      <SelectItem value="laser_cutting">Laser Cutting</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gateways</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Transactions List */}
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(transaction.type)}
                      <div>
                        <h3 className="font-medium">{transaction.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>ID: {transaction.id}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.gateway}</span>
                          {transaction.gateway_transaction_id && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">{transaction.gateway_transaction_id}</span>
                            </>
                          )}
                        </div>
                        {transaction.failure_reason && (
                          <p className="text-sm text-red-600 mt-1">{transaction.failure_reason}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg">{getAmountDisplay(transaction)}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {transaction.status === 'success' && (
                            <DropdownMenuItem onClick={() => onDownloadReceipt?.(transaction.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </DropdownMenuItem>
                          )}
                          {transaction.status === 'failed' && (
                            <DropdownMenuItem onClick={() => onRetryPayment?.(transaction.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          {transaction.status === 'success' && transaction.type !== 'refund' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onRefundTransaction?.(transaction.id)}
                                className="text-red-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Request Refund
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction && getTypeIcon(selectedTransaction.type)}
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className="text-lg font-medium">{getAmountDisplay(selectedTransaction)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="capitalize">{selectedTransaction.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gateway</p>
                  <p className="capitalize">{selectedTransaction.gateway}</p>
                </div>
                {selectedTransaction.gateway_transaction_id && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gateway ID</p>
                    <p className="font-mono text-sm">{selectedTransaction.gateway_transaction_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                {selectedTransaction.completed_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-sm">{formatDate(selectedTransaction.completed_at)}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                <p>{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.failure_reason && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Failure Reason</p>
                  <p className="text-sm text-red-600">{selectedTransaction.failure_reason}</p>
                </div>
              )}

              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Additional Details</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                {selectedTransaction.status === 'success' && (
                  <Button onClick={() => onDownloadReceipt?.(selectedTransaction.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionsList;
