import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  description: string;
  downloadUrl: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    console.log('Downloading invoice:', invoice.id);
    // In real app, this would trigger the download
    window.open(invoice.downloadUrl, '_blank');
  };

  const handleView = () => {
    console.log('Viewing invoice:', invoice.id);
    // In real app, this would open invoice viewer
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900">Invoice #{invoice.id}</p>
              <p className="text-sm text-gray-600">{invoice.description}</p>
            </div>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span>{new Date(invoice.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-gray-500" />
              <span className="font-semibold">{invoice.amount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleView}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {invoice.status === 'paid' && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
