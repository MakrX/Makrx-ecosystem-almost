import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ReorderItem {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplier: 'makrx' | 'external';
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  orderDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

const ReorderHistoryTable: React.FC = () => {
  // Mock reorder data
  const reorderHistory: ReorderItem[] = [
    {
      id: 'ro-001',
      orderId: 'RO-20240115001',
      productName: 'PLA Filament - Red (1kg)',
      quantity: 10,
      unitPrice: 25,
      totalCost: 250,
      supplier: 'makrx',
      status: 'delivered',
      priority: 'normal',
      orderDate: '2024-01-15',
      estimatedDelivery: '2024-01-20',
      actualDelivery: '2024-01-19'
    },
    {
      id: 'ro-002',
      orderId: 'RO-20240118002',
      productName: 'ABS Filament - Black (1kg)',
      quantity: 5,
      unitPrice: 30,
      totalCost: 150,
      supplier: 'makrx',
      status: 'shipped',
      priority: 'high',
      orderDate: '2024-01-18',
      estimatedDelivery: '2024-01-23'
    },
    {
      id: 'ro-003',
      orderId: 'RO-20240120003',
      productName: 'Clear Resin (1L)',
      quantity: 3,
      unitPrice: 45,
      totalCost: 135,
      supplier: 'external',
      status: 'pending',
      priority: 'urgent',
      orderDate: '2024-01-20',
      estimatedDelivery: '2024-01-28'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (orderId: string) => {
    console.log('Viewing order:', orderId);
    // In real app, this would open order details modal
  };

  const handleTrackShipment = (orderId: string) => {
    console.log('Tracking shipment:', orderId);
    // In real app, this would open tracking information
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Reorder History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reorderHistory.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reorders yet</h3>
            <p className="text-gray-600">Your inventory reorder history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Qty</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Priority</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reorderHistory.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium text-sm">{order.orderId}</p>
                        <p className="text-xs text-gray-500">
                          {order.supplier === 'makrx' ? 'MakrX Store' : 'External'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-sm font-medium">{order.productName}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-sm">{order.quantity}</p>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">{order.totalCost}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="outline" className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        {order.estimatedDelivery && (
                          <p className="text-xs text-gray-500">
                            ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.orderId)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {order.status === 'shipped' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrackShipment(order.orderId)}
                          >
                            <Truck className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReorderHistoryTable;
