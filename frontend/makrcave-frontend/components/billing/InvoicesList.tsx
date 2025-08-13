import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Search,
  Download,
  Eye,
  Send,
  Calendar,
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Mail,
  MoreHorizontal,
  Filter,
  RefreshCw,
  CreditCard,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
  total_amount: number;
  tax_amount?: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  customer_name: string;
  customer_email: string;
  line_items: InvoiceLineItem[];
  payment_method?: string;
  transaction_id?: string;
  file_url?: string;
  metadata?: Record<string, any>;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoicesListProps {
  invoices?: Invoice[];
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  onViewInvoice?: (invoice: Invoice) => void;
  onDownloadInvoice?: (invoiceId: string) => void;
  onSendInvoice?: (invoiceId: string) => void;
  onMarkAsPaid?: (invoiceId: string) => void;
  onCancelInvoice?: (invoiceId: string) => void;
}

const InvoicesList: React.FC<InvoicesListProps> = ({
  invoices = [],
  showSearch = true,
  showFilters = true,
  showPagination = true,
  pageSize = 10,
  onViewInvoice,
  onDownloadInvoice,
  onSendInvoice,
  onMarkAsPaid,
  onCancelInvoice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data if no invoices provided
  const mockInvoices: Invoice[] = [
    {
      id: 'inv_001',
      invoice_number: 'INV-2024-01-00124',
      title: 'Pro Maker Membership',
      description: 'Monthly subscription for Pro Maker plan',
      amount: 99.99,
      total_amount: 117.99,
      tax_amount: 18.00,
      currency: 'INR',
      status: 'paid',
      issue_date: '2024-01-20T00:00:00Z',
      due_date: '2024-02-19T00:00:00Z',
      paid_date: '2024-01-20T10:31:15Z',
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      payment_method: 'credit_card',
      transaction_id: 'txn_001',
      file_url: '/invoices/INV-2024-01-00124.pdf',
      line_items: [
        {
          id: 'li_001',
          description: 'Pro Maker Membership - Monthly',
          quantity: 1,
          unit_price: 99.99,
          total_price: 99.99
        }
      ],
      metadata: { plan_id: 'pro_monthly' }
    },
    {
      id: 'inv_002',
      invoice_number: 'INV-2024-01-00125',
      title: 'Credit Purchase',
      description: 'Purchase of 150 credits for services',
      amount: 150.00,
      total_amount: 177.00,
      tax_amount: 27.00,
      currency: 'INR',
      status: 'paid',
      issue_date: '2024-01-18T00:00:00Z',
      paid_date: '2024-01-18T14:21:05Z',
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      payment_method: 'upi',
      transaction_id: 'txn_002',
      file_url: '/invoices/INV-2024-01-00125.pdf',
      line_items: [
        {
          id: 'li_002',
          description: 'Credits Purchase - 150 Credits',
          quantity: 150,
          unit_price: 1.00,
          total_price: 150.00
        }
      ]
    },
    {
      id: 'inv_003',
      invoice_number: 'INV-2024-01-00126',
      title: 'Arduino Workshop Registration',
      description: 'Registration fee for Arduino basics workshop',
      amount: 200.00,
      total_amount: 236.00,
      tax_amount: 36.00,
      currency: 'INR',
      status: 'overdue',
      issue_date: '2024-01-15T00:00:00Z',
      due_date: '2024-01-30T00:00:00Z',
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      line_items: [
        {
          id: 'li_003',
          description: 'Arduino Workshop - Beginner Level',
          quantity: 1,
          unit_price: 200.00,
          total_price: 200.00
        }
      ],
      metadata: { workshop_id: 'ws_arduino_101' }
    },
    {
      id: 'inv_004',
      invoice_number: 'INV-2024-01-00127',
      title: '3D Printing Service',
      amount: 125.50,
      total_amount: 148.09,
      tax_amount: 22.59,
      currency: 'INR',
      status: 'sent',
      issue_date: '2024-01-22T00:00:00Z',
      due_date: '2024-02-05T00:00:00Z',
      customer_name: 'Jane Smith',
      customer_email: 'jane.smith@example.com',
      line_items: [
        {
          id: 'li_004',
          description: '3D Print Job #PRT002 - Custom Prototype',
          quantity: 1,
          unit_price: 125.50,
          total_price: 125.50
        }
      ]
    },
    {
      id: 'inv_005',
      invoice_number: 'INV-2024-01-00128',
      title: 'Laser Cutting Service',
      amount: 75.25,
      total_amount: 88.80,
      tax_amount: 13.55,
      currency: 'INR',
      status: 'draft',
      issue_date: '2024-01-23T00:00:00Z',
      customer_name: 'Mike Johnson',
      customer_email: 'mike.johnson@example.com',
      line_items: [
        {
          id: 'li_005',
          description: 'Laser Cut Acrylic Parts - Custom Design',
          quantity: 5,
          unit_price: 15.05,
          total_price: 75.25
        }
      ]
    }
  ];

  const data = invoices.length > 0 ? invoices : mockInvoices;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      sent: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || 'bg-yellow-100 text-yellow-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const filteredInvoices = data.filter(invoice => {
    const matchesSearch = invoice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const invoiceDate = new Date(invoice.issue_date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24));
      
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
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInvoices = showPagination 
    ? filteredInvoices.slice(startIndex, startIndex + pageSize)
    : filteredInvoices;

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
    onViewInvoice?.(invoice);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
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
                    placeholder="Search invoices..."
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
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

          {/* Invoices List */}
          {paginatedInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedInvoices.map((invoice) => {
                const daysOverdue = invoice.status === 'overdue' && invoice.due_date 
                  ? getDaysOverdue(invoice.due_date) 
                  : 0;
                
                return (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Receipt className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{invoice.invoice_number}</h3>
                            {getStatusBadge(invoice.status)}
                            {daysOverdue > 0 && (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                {daysOverdue} days overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{invoice.title}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>To: {invoice.customer_name}</span>
                            <span>•</span>
                            <span>Issued: {formatDate(invoice.issue_date)}</span>
                            {invoice.due_date && (
                              <>
                                <span>•</span>
                                <span>Due: {formatDate(invoice.due_date)}</span>
                              </>
                            )}
                            {invoice.paid_date && (
                              <>
                                <span>•</span>
                                <span>Paid: {formatDate(invoice.paid_date)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-lg">{formatCurrency(invoice.total_amount, invoice.currency)}</p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            <span className="text-xs text-gray-500 capitalize">{invoice.status}</span>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {invoice.file_url && (
                              <DropdownMenuItem onClick={() => onDownloadInvoice?.(invoice.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                            )}
                            {(invoice.status === 'draft' || invoice.status === 'overdue') && (
                              <DropdownMenuItem onClick={() => onSendInvoice?.(invoice.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Invoice
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'sent' && (
                              <DropdownMenuItem onClick={() => onMarkAsPaid?.(invoice.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                onClick={() => onCancelInvoice?.(invoice.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Invoice
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredInvoices.length)} of {filteredInvoices.length} invoices
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

      {/* Invoice Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Details - {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Invoice Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-medium">{selectedInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Date:</span>
                      <span>{formatDate(selectedInvoice.issue_date)}</span>
                    </div>
                    {selectedInvoice.due_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span>{formatDate(selectedInvoice.due_date)}</span>
                      </div>
                    )}
                    {selectedInvoice.paid_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid Date:</span>
                        <span>{formatDate(selectedInvoice.paid_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedInvoice.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedInvoice.customer_email}</span>
                    </div>
                    {selectedInvoice.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="capitalize">{selectedInvoice.payment_method.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Unit Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.line_items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price, selectedInvoice.currency)}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.total_price, selectedInvoice.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span>
                  </div>
                  {selectedInvoice.tax_amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatCurrency(selectedInvoice.tax_amount, selectedInvoice.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedInvoice.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                {selectedInvoice.file_url && (
                  <Button onClick={() => onDownloadInvoice?.(selectedInvoice.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
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

export default InvoicesList;
