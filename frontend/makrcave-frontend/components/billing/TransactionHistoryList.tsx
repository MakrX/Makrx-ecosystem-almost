import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  FileText,
  Download,
  RefreshCw,
  CreditCard,
  Wallet,
  ShoppingCart,
  Crown
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'subscription' | 'credits' | 'reorder' | 'service';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  invoiceId?: string;
}

interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const TransactionHistoryList: React.FC<TransactionHistoryListProps> = ({ 
  transactions 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'credits': return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'reorder': return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'service': return <CreditCard className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId);
    // In real app, this would trigger invoice download
  };

  const handleRetryPayment = (transactionId: string) => {
    console.log('Retrying payment:', transactionId);
    // In real app, this would retry the failed payment
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()} • ID: {transaction.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">${transaction.amount}</p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {transaction.status === 'failed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRetryPayment(transaction.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    
                    {transaction.invoiceId && transaction.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(transaction.invoiceId!)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistoryList;
